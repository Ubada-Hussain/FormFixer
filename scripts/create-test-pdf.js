const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function createSamplePdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.addPage([600, 800]);

  page.drawText('FormFixer Project Overview Document', {
    x: 50,
    y: 730,
    size: 20,
    font: boldFont,
    color: rgb(0.05, 0.43, 0.34),
  });

  const p1 = 'FormFixer is an intelligent document management system that simplifies application procedures for students and professionals across Pakistan and worldwide.';
  const p2 = 'Our mission is to eliminate portal rejection errors by ensuring files match target size constraints and document formatting standards without sacrificing visual clarity or privacy.';
  const p3 = 'All document processing runs with speed and security, preserving original content, typography, and structure throughout the conversion lifecycle.';

  let y = 680;
  [p1, p2, p3].forEach((para, idx) => {
    page.drawText(`Paragraph ${idx + 1}: ${para}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 60;
  });

  const pdfBytes = await pdfDoc.save();
  const dir = path.join(__dirname, 'scratch');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, 'sample-multi-paragraph.pdf');
  fs.writeFileSync(filePath, pdfBytes);
  console.log('Sample PDF created at:', filePath);
}

createSamplePdf().catch(console.error);
