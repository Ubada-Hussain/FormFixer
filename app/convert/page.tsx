import type { Metadata } from 'next';
import ConvertClient from './ConvertClient';

export const metadata: Metadata = {
  title: 'Convert Document Formats (PDF, Word, Images) — FormFixer',
  description: 'Easily convert images to PDF, or convert between English PDF and Word documents. Fast, secure, and accurate conversion for applications and forms.',
};

export default function ConvertPage() {
  return <ConvertClient />;
}
