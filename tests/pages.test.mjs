import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readIndex, root } from './load.mjs';

const html = readIndex();
const workflow = readFileSync(join(root, '.github/workflows/pages.yml'), 'utf8');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

test('portfolio licensing copy is neutral and points to project repositories', () => {
  assert.match(html, /<b>Open-source<\/b> · licenses vary/);
  assert.match(html, /Licenses and reuse terms vary by project\./);
  assert.match(html, /linked repository as the source of truth/);
  assert.doesNotMatch(html, /Apache 2\.0/i);
});

test('initial page resources are first-party and contribution history is user-initiated', () => {
  assert.doesNotMatch(html, /ghchart\.rshah\.org/i);
  assert.doesNotMatch(
    html,
    /<(?:img|script|iframe|video|audio|source|embed|input|track|object)\b[^>]*\b(?:src|poster|data)=["']https?:\/\//i
  );
  assert.doesNotMatch(html, /\b(?:srcset|imagesrcset)=["'][^"']*https?:\/\//i);
  assert.doesNotMatch(
    html,
    /<link\b(?=[^>]*\brel=["'][^"']*\b(?:stylesheet|preload|modulepreload|prefetch|dns-prefetch|preconnect|icon|manifest)\b)[^>]*\bhref=["']https?:\/\//i
  );
  assert.doesNotMatch(html, /<image\b[^>]*\b(?:href|xlink:href)=["']https?:\/\//i);
  assert.doesNotMatch(html, /@import\s+(?:url\()?\s*["']?https?:\/\//i);
  assert.doesNotMatch(html, /url\(\s*["']?https?:\/\//i);
  assert.match(
    html,
    /<a class="gh-profile-link" href="https:\/\/github\.com\/udhawan97"[^>]+rel="noopener noreferrer"[^>]+referrerpolicy="no-referrer"[^>]+aria-label="View Umang Dhawan's GitHub profile and contribution history"/
  );
});

test('Pages workflow verifies before packaging and cannot auto-deploy', () => {
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /push:\n\s+branches: \[main\]/);
  assert.match(workflow, /node-version: 26\.4\.0/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /run: node --test/);
  assert.match(workflow, /inputs\.deploy_sha/);
  assert.match(workflow, /git merge-base --is-ancestor "\$actual_sha" origin\/main/);
  assert.match(workflow, /github\.event_name == 'workflow_dispatch'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /actions\/deploy-pages@[0-9a-f]{40}/);
  assert.ok(
    workflow.indexOf('run: node --test') < workflow.indexOf('actions/upload-pages-artifact@'),
    'the artifact must not be uploaded before tests pass'
  );
  assert.ok(
    workflow.indexOf('actions/upload-pages-artifact@') < workflow.indexOf('actions/deploy-pages@'),
    'deployment must consume the verified artifact'
  );
});

test('delivery runbook keeps cutover and rollback behind explicit authority', () => {
  assert.match(readme, /legacy `main:\/` publisher remains authoritative/i);
  assert.match(readme, /separately authorized cutover window/i);
  assert.match(readme, /known-good SHA/i);
  assert.match(readme, /deploy=true/i);
  assert.match(readme, /does not prove a browser smoke/i);
  assert.match(readme, /No provider setting, deployment, or rollback drill is performed/i);
});
