import requests
import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def test_conversion(pdf_path, api_url):
    print(f"Submitting {pdf_path} to {api_url}")
    
    with open(pdf_path, 'rb') as f:
        files = {'file': (os.path.basename(pdf_path), f, 'application/pdf')}
        res = requests.post(f"{api_url}/convert", files=files)
        
    if res.status_code != 200:
        print(f"Error: {res.status_code} - {res.text}")
        sys.exit(1)
        
    docx_path = pdf_path.replace('.pdf', '-test.docx')
    with open(docx_path, 'wb') as f:
        f.write(res.content)
        
    print(f"Saved DOCX to {docx_path}")
    print("\n--- Extracted Text ---")
    
    # Extract text from DOCX
    with zipfile.ZipFile(docx_path, 'r') as docx:
        content = docx.read('word/document.xml')
        tree = ET.fromstring(content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        for paragraph in tree.findall('.//w:p', ns):
            texts = [node.text for node in paragraph.findall('.//w:t', ns) if node.text]
            if texts:
                print(''.join(texts))
                
if __name__ == '__main__':
    pdf_path = os.path.abspath(sys.argv[1])
    api_url = sys.argv[2] if len(sys.argv) > 2 else "http://127.0.0.1:8000"
    test_conversion(pdf_path, api_url)
