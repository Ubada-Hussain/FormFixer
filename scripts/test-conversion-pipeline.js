const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');
const { Document, Paragraph, TextRun, Packer } = require('docx');

async function testConversion() {
  const samplePdfPath = path.join(__dirname, 'scratch', 'sample-multi-paragraph.pdf');
  const fileBuffer = fs.readFileSync(samplePdfPath);

  console.log('--- 1. Reading input PDF ---');
  console.log('File size:', fileBuffer.length, 'bytes');

  console.log('\n--- 2. Extracting text content with PDFParse ---');
  const uint8 = new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength);
  const parser = new PDFParse(uint8);
  await parser.load();
  const pdfRes = await parser.getText();
  const extractedText = typeof pdfRes === 'string' ? pdfRes : pdfRes.text || '';
  console.log('Extracted Real Content:\n' + extractedText);

  const lines = extractedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('-- ') && !l.endsWith(' --'));

  console.log('\n--- 3. Structuring into Word Document (.docx) ---');
  const paragraphs = lines.map((line, idx) => {
    if (idx === 0) {
      return new Paragraph({
        children: [
          new TextRun({
            text: line,
            bold: true,
            size: 28,
          }),
        ],
      });
    }
    return new Paragraph({
      children: [
        new TextRun({
          text: line,
          size: 22,
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'scratch', 'converted-result.docx');
  fs.writeFileSync(outputPath, docxBuffer);

  console.log('\n--- 4. Conversion Pipeline Verification Result ---');
  console.log('Successfully generated Word .docx file at:', outputPath);
  console.log('.docx file size:', docxBuffer.length, 'bytes');
  console.log('Total extracted paragraphs converted:', paragraphs.length);
}

testConversion().catch(console.error);
