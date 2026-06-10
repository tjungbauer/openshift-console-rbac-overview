#!/usr/bin/env node
/**
 * Fail if i18nKeys.ts references keys missing from locales/en/plugin__rbac-overview.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const keysTs = fs.readFileSync(path.join(root, 'src/components/rbac-overview/i18nKeys.ts'), 'utf8');
const locale = JSON.parse(
  fs.readFileSync(path.join(root, 'locales/en/plugin__rbac-overview.json'), 'utf8'),
);

const keyMatches = [...keysTs.matchAll(/'([^']+)'/g)]
  .map((match) => match[1])
  .filter((key) => key.includes('.'));

const missing = [...new Set(keyMatches)].filter((key) => !(key in locale));
if (missing.length) {
  console.error('Missing locale strings:');
  missing.forEach((key) => console.error(`  - ${key}`));
  process.exit(1);
}

console.log(`i18n OK (${keyMatches.length} keys checked)`);
