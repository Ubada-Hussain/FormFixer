import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Next 14.2.x does not create this manifest for an app-router-only project.
// It still tries to read it during the production build.
const serverDir = join(process.cwd(), '.next', 'server');
const manifestPath = join(serverDir, 'pages-manifest.json');

if (!existsSync(manifestPath)) {
  mkdirSync(serverDir, { recursive: true });
  writeFileSync(manifestPath, '{}');
}
