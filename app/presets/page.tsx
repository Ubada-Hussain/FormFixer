import type { Metadata } from 'next';
import PresetsClient from './PresetsClient';

export const metadata: Metadata = {
  title: 'University Portal Presets — FormFixer',
  description: 'Search a growing library of scholarship and admission portals. FormFixer automatically sets the exact file size and dimensions required for your specific form.',
};

export default function PresetsPage() {
  return <PresetsClient />;
}
