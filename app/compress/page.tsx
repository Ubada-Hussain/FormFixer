import type { Metadata } from 'next';
import CompressClient from './CompressClient';

export const metadata: Metadata = {
  title: 'Compress Photo to Specific Size (KB, MB) — FormFixer',
  description: 'Compress photos (JPEG, PNG, WEBP) to an exact file size without losing quality. Perfect for online forms, scholarships, and admissions applications.',
};

export default function CompressPage() {
  return <CompressClient />;
}
