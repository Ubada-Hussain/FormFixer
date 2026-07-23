export interface Preset {
  name: string;
  kb: number;
  verified: boolean;
}

export const PRESETS: Preset[] = [
  { name: "NUST", kb: 100, verified: false },
  { name: "COMSATS University Islamabad", kb: 100, verified: false },
  { name: "University of the Punjab", kb: 100, verified: false },
  { name: "UET Lahore", kb: 1000, verified: true },
  { name: "UET Taxila", kb: 1000, verified: true },
  { name: "UET Peshawar", kb: 1000, verified: false },
  { name: "University of Education, Lahore", kb: 50, verified: true },
  { name: "FAST-NUCES", kb: 100, verified: false },
  { name: "LUMS", kb: 100, verified: false },
  { name: "GIKI", kb: 100, verified: false },
  { name: "Quaid-i-Azam University", kb: 100, verified: false },
  { name: "International Islamic University Islamabad", kb: 100, verified: false },
  { name: "Bahria University", kb: 100, verified: false },
  { name: "Air University", kb: 100, verified: false },
  { name: "Riphah International University", kb: 100, verified: false },
  { name: "Foundation University Islamabad", kb: 100, verified: false },
  { name: "National Textile University Faisalabad", kb: 100, verified: false },
  { name: "University of Agriculture Faisalabad", kb: 100, verified: false },
  { name: "Government College University Lahore", kb: 100, verified: false },
  { name: "University of Sargodha", kb: 100, verified: false },
  { name: "Bahauddin Zakariya University Multan", kb: 100, verified: false },
  { name: "Islamia University Bahawalpur", kb: 100, verified: false },
  { name: "University of Gujrat", kb: 100, verified: false },
  { name: "Lahore College for Women University", kb: 100, verified: false },
  { name: "Fatima Jinnah Women University", kb: 100, verified: false },
  { name: "University of Health Sciences Lahore", kb: 100, verified: false },
  { name: "King Edward Medical University", kb: 100, verified: false },
  { name: "Allama Iqbal Medical College", kb: 100, verified: false },
  { name: "University of Central Punjab", kb: 100, verified: false },
  { name: "Superior University Lahore", kb: 100, verified: false },
  { name: "Forman Christian College", kb: 100, verified: false },
  { name: "Kinnaird College for Women", kb: 100, verified: false },
  { name: "NED University of Engineering and Technology", kb: 100, verified: false },
  { name: "University of Karachi", kb: 100, verified: false },
  { name: "Institute of Business Administration Karachi", kb: 100, verified: false },
  { name: "Dow University of Health Sciences", kb: 100, verified: false },
  { name: "Ziauddin University", kb: 100, verified: false },
  { name: "Sir Syed University of Engineering and Technology", kb: 100, verified: false },
  { name: "Hamdard University", kb: 100, verified: false },
  { name: "Aga Khan University", kb: 100, verified: false },
  { name: "Mehran University of Engineering and Technology", kb: 100, verified: false },
  { name: "University of Sindh, Jamshoro", kb: 100, verified: false },
  { name: "Shah Abdul Latif University", kb: 100, verified: false },
  { name: "University of Peshawar", kb: 100, verified: false },
  { name: "Khyber Medical University", kb: 100, verified: false },
  { name: "Hazara University", kb: 100, verified: false },
  { name: "Gomal University", kb: 100, verified: false },
  { name: "University of Balochistan", kb: 100, verified: false },
  { name: "Virtual University of Pakistan", kb: 100, verified: false },
  { name: "Allama Iqbal Open University", kb: 100, verified: false },
  { name: "Pakistan Institute of Engineering and Applied Sciences", kb: 100, verified: false },
];

export const MARQUEE_NAMES = PRESETS.map((p) => p.name);

export const PRESET_SELECT_OPTIONS = PRESETS.map((p) => ({
  value: `${p.kb}`,
  label: `${p.name} (Max ${p.kb} KB)${p.verified ? ' ✓ Verified' : ''}`,
}));
