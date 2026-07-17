/*
 * The site's scripts are plain classic scripts (no build step, index.html opens
 * straight from the filesystem), so node can't import them. We concatenate them
 * the way the browser would and evaluate them in a vm, then hand back the
 * bindings under test. `document` is absent, which is what keeps each file's
 * auto-render branch from running.
 */
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function load(paths, exportExpr) {
  const src = paths.map((p) => readFileSync(join(root, p), 'utf8')).join('\n');
  return runInNewContext(`${src}\n;(${exportExpr});`);
}

export function readIndex() {
  return readFileSync(join(root, 'index.html'), 'utf8');
}
