const fs = require('fs');
const path = require('path');

async function testPythonDirectly() {
  const pythonApiUrl = 'http://localhost:8000/convert'; 

  // 1. Create a large dummy file (>10MB)
  const largeFilePath = path.join(__dirname, 'large_test.pdf');
  const size11MB = 11 * 1024 * 1024;
  fs.writeFileSync(largeFilePath, Buffer.alloc(size11MB, 'A'));

  // 2. Create a corrupted pdf
  const corruptedFilePath = path.join(__dirname, 'corrupted_test.pdf');
  fs.writeFileSync(corruptedFilePath, Buffer.from('this is not a pdf file', 'utf-8'));

  try {
    console.log('--- TEST 1: Large File DoS Protection (Python Service Directly) ---');
    let formData = new FormData();
    const largeBlob = new Blob([fs.readFileSync(largeFilePath)], { type: 'application/pdf' });
    formData.append('file', largeBlob, 'large_test.pdf');

    let res = await fetch(pythonApiUrl, {
      method: 'POST',
      body: formData,
    });
    
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${await res.text()}`);

    console.log('\n--- TEST 2: Corrupted File Error Handling (Python Service Directly) ---');
    formData = new FormData();
    const corruptedBlob = new Blob([fs.readFileSync(corruptedFilePath)], { type: 'application/pdf' });
    formData.append('file', corruptedBlob, 'corrupted_test.pdf');

    res = await fetch(pythonApiUrl, {
      method: 'POST',
      body: formData,
    });

    console.log(`Status: ${res.status}`);
    console.log(`Response: ${await res.text()}`);
    
  } catch(e) {
    console.error(e);
  } finally {
    fs.unlinkSync(largeFilePath);
    fs.unlinkSync(corruptedFilePath);
  }
}

testPythonDirectly();
