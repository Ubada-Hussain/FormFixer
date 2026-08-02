const fs = require('fs');

const RAW = [
  'NUST', 'COMSATS University Islamabad', 'University of the Punjab', 'UET Lahore', 'UET Taxila',
  'UET Peshawar', 'University of Education, Lahore', 'FAST-NUCES', 'LUMS', 'GIKI',
  'Quaid-i-Azam University', 'International Islamic University Islamabad', 'Bahria University',
  'Air University', 'Riphah International University', 'Foundation University Islamabad',
  'National Textile University Faisalabad', 'University of Agriculture Faisalabad',
  'Government College University Lahore', 'University of Sargodha', 'Bahauddin Zakariya University Multan',
  'Islamia University Bahawalpur', 'University of Gujrat', 'Lahore College for Women University',
  'Fatima Jinnah Women University', 'University of Health Sciences Lahore', 'King Edward Medical University',
  'Allama Iqbal Medical College', 'University of Central Punjab', 'Superior University Lahore',
  'Forman Christian College', 'Kinnaird College for Women', 'NED University of Engineering and Technology',
  'University of Karachi', 'Institute of Business Administration Karachi', 'Dow University of Health Sciences',
  'Ziauddin University', 'Sir Syed University of Engineering and Technology', 'Hamdard University',
  'Aga Khan University', 'Mehran University of Engineering and Technology', 'University of Sindh, Jamshoro',
  'Shah Abdul Latif University', 'University of Peshawar', 'Khyber Medical University', 'Hazara University',
  'Gomal University', 'University of Balochistan', 'Virtual University of Pakistan', 'Allama Iqbal Open University',
  'Pakistan Institute of Engineering and Applied Sciences'
];

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');
}

const lines = [];
lines.push('export const UNIVERSITY_INFO: Record<string, string> = {');

RAW.forEach(name => {
  const slug = slugify(name);
  const isMed = name.includes('Medical') || name.includes('Health');
  const isTech = name.includes('Engineering') || name.includes('Technology') || name.includes('UET') || name === 'NUST' || name === 'FAST-NUCES' || name === 'GIKI';
  
  let text = '';
  
  if (isMed) {
    text = `Applying to ${name} requires precise attention to detail, especially when it comes to your application documents. Their admissions portal strictly rejects profile photos and scanned documents that exceed the KB limit. Ensure your files are compressed without losing legibility before uploading.`;
  } else if (isTech) {
    text = `${name} has a highly competitive engineering and technology admissions process. The online application portal is known for strict file size limits on photos and academic certificates. Avoid the frustration of "file too large" errors by sizing your documents precisely to their requirements before starting your application.`;
  } else {
    text = `The online admission process for ${name} mandates that all candidate photos and scanned academic records meet specific file size limits. Using our preset ensures your documents will be instantly accepted by the ${name} portal, saving you time during the crucial application window.`;
  }
  
  // Custom overrides
  if (name === 'NUST') {
    text = 'The NUST Entry Test (NET) application requires your profile photo and CNIC scans to be perfectly sized before you can generate your fee challan. The NUST portal is notoriously strict about its photo upload limits, so using the correct preset is highly recommended.';
  } else if (name === 'LUMS') {
    text = 'Applying to LUMS involves a comprehensive online application where you must upload numerous supporting documents, transcripts, and a profile photo. Ensure your files are correctly compressed to avoid timeouts on the LUMS admissions portal.';
  } else if (name === 'FAST-NUCES') {
    text = 'The FAST-NUCES admission portal requires applicants to upload a clear passport-sized photograph and academic records within strict file size constraints. Prepare your files in advance to ensure a smooth application experience for their competitive computing programs.';
  }

  lines.push(`  '${slug}': \`${text}\`,`);
});

lines.push('};');
fs.writeFileSync('lib/university-info.ts', lines.join('\n'));
