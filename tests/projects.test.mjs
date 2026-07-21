/*
 * Tests for assets/js/projects.js.
 *
 * The site ships zero dependencies and no build step, so assets/js/projects.js
 * is a plain classic script the browser loads with <script src>. Node can't
 * import a classic script, so we evaluate it in a vm context and hand back the
 * bindings we want to assert on. `document` is absent here, which is what keeps
 * the file's auto-render branch from running.
 *
 * Run: node --test tests/
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { load, root, readIndex } from './load.mjs';

const { PROJECTS, projectCardHtml } = load(
  ['assets/js/util.js', 'assets/js/projects.js'],
  '{ PROJECTS, projectCardHtml }'
);

const project = {
  id: 'orifold',
  name: 'Orifold',
  lang: { dot: 'swift', label: 'Swift' },
  desc: 'A native, local-first macOS workspace.',
  tags: ['macOS', 'Local-first'],
  site: 'https://udhawan97.github.io/Orifold/',
  source: 'https://github.com/udhawan97/Orifold',
};

test('card shows the project name in an h4', () => {
  const html = projectCardHtml(project, '');
  assert.match(html, /<h4>Orifold<\/h4>/);
});

test('visit-site link points at the project site', () => {
  const html = projectCardHtml(project, '');
  assert.match(
    html,
    /<a class="ghp-link primary" href="https:\/\/udhawan97\.github\.io\/Orifold\/" target="_blank" rel="noopener" aria-label="Visit the Orifold website">/
  );
});

test('source link points at the GitHub repo', () => {
  const html = projectCardHtml(project, '');
  assert.match(
    html,
    /<a class="ghp-link secondary" href="https:\/\/github\.com\/udhawan97\/Orifold" target="_blank" rel="noopener" aria-label="View Orifold source on GitHub">/
  );
});

test('language pill shows the dot class and the label', () => {
  const html = projectCardHtml(project, '');
  assert.match(html, /<span class="ghp-lang"><span class="ghp-dot swift"><\/span>Swift<\/span>/);
});

test('description renders in a ghp-desc paragraph', () => {
  const html = projectCardHtml(project, '');
  assert.match(html, /<p class="ghp-desc">A native, local-first macOS workspace\.<\/p>/);
});

test('tags render in order', () => {
  const html = projectCardHtml(project, '');
  const tags = [...html.matchAll(/<span class="ghp-tag">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(tags, ['macOS', 'Local-first']);
});

test('app icon renders once when the project has no reduced-motion twin', () => {
  const html = projectCardHtml({ ...project, icon: 'assets/logos/golavo.svg' }, '');
  const icons = [...html.matchAll(/<img class="ghp-appicon[^"]*"/g)];
  assert.equal(icons.length, 1);
  assert.match(html, /<img class="ghp-appicon" src="assets\/logos\/golavo\.svg"/);
});

test('app icon renders motion and static twins when a staticIcon is given', () => {
  const html = projectCardHtml(
    { ...project, icon: 'assets/logos/orifold.svg', staticIcon: 'assets/logos/orifold-static.svg' },
    ''
  );
  assert.match(
    html,
    /<img class="ghp-appicon ghp-appicon-motion" src="assets\/logos\/orifold\.svg"/
  );
  assert.match(
    html,
    /<img class="ghp-appicon ghp-appicon-static" src="assets\/logos\/orifold-static\.svg"/
  );
});

test('status pill carries its tone as a class', () => {
  const html = projectCardHtml({ ...project, status: { label: 'Beta', tone: 'beta' } }, '');
  assert.match(html, /<span class="ghp-status beta"><span class="ghp-status-dot"><\/span>Beta<\/span>/);
});

test('status pill with no tone renders the plain pill', () => {
  const html = projectCardHtml({ ...project, status: { label: 'Under construction' } }, '');
  assert.match(
    html,
    /<span class="ghp-status"><span class="ghp-status-dot"><\/span>Under construction<\/span>/
  );
});

test('scene markup is slotted into the visual, behind the visual class', () => {
  const html = projectCardHtml({ ...project, visualClass: 'ori-visual' }, '<div class="ori-scene"></div>');
  assert.match(
    html,
    /<div class="ghp-visual ori-visual" aria-hidden="true">[\s\S]*<div class="ori-scene"><\/div>[\s\S]*<\/div>/
  );
});

test('card is an article the reveal observer can pick up', () => {
  const html = projectCardHtml(project, '');
  assert.match(html.trim(), /^<article class="ghp-card r d1"/);
});

test('stagger delay follows the card position, capped at the last delay class', () => {
  assert.match(projectCardHtml(project, '', 1).trim(), /^<article class="ghp-card r d2"/);
  assert.match(projectCardHtml(project, '', 3).trim(), /^<article class="ghp-card r d4"/);
  assert.match(projectCardHtml(project, '', 9).trim(), /^<article class="ghp-card r d4"/);
});

test('text is escaped so copy cannot break out of the markup', () => {
  const html = projectCardHtml({ ...project, name: 'A & B <script>' }, '');
  assert.match(html, /<h4>A &amp; B &lt;script&gt;<\/h4>/);
  assert.doesNotMatch(html, /<h4>A & B <script>/);
});

/* --- the data itself: these guard the next card someone adds --- */

test('every project carries the fields a card needs', () => {
  for (const p of PROJECTS) {
    for (const field of ['id', 'name', 'icon', 'desc', 'site', 'source']) {
      assert.ok(p[field], `${p.id || '?'} is missing ${field}`);
    }
    assert.ok(p.lang?.dot && p.lang?.label, `${p.id} is missing a language pill`);
    assert.equal(p.tags.length, 4, `${p.id} should carry 4 tags`);
  }
});

test('every project icon file exists', () => {
  for (const p of PROJECTS) {
    for (const icon of [p.icon, p.staticIcon].filter(Boolean)) {
      assert.ok(existsSync(join(root, icon)), `${p.id}: missing ${icon}`);
    }
  }
});

test('every project links out over https', () => {
  for (const p of PROJECTS) {
    assert.match(p.site, /^https:\/\//, `${p.id} site`);
    assert.match(p.source, /^https:\/\/github\.com\//, `${p.id} source`);
  }
});

test('Codemble is featured with its public product and source links', () => {
  const codemble = PROJECTS.find((p) => p.id === 'codemble');
  assert.ok(codemble, 'Codemble is missing from the featured builds');
  assert.equal(codemble.site, 'https://udhawan97.github.io/Codemble/');
  assert.equal(codemble.source, 'https://github.com/udhawan97/Codemble');
  assert.deepEqual(
    Array.from(codemble.tags),
    ['Code literacy', 'Parser-proven', '3D + 2D maps', 'Polyglot']
  );
});

test('Dusori is featured with its public product and source links', () => {
  const dusori = PROJECTS.find((p) => p.id === 'dusori');
  assert.ok(dusori, 'Dusori is missing from the featured builds');
  assert.equal(dusori.site, 'https://udhawan97.github.io/Dusori/');
  assert.equal(dusori.source, 'https://github.com/udhawan97/Dusori');
  assert.deepEqual(
    Array.from(dusori.tags),
    ['Learning workspace', 'Portable files', 'Conflict-safe', 'Obsidian-ready']
  );
});

test('Codemble and Dusori explain their distinct user value without leading on AI', () => {
  const codemble = PROJECTS.find((p) => p.id === 'codemble');
  const dusori = PROJECTS.find((p) => p.id === 'dusori');
  assert.match(codemble.desc, /understanding into visible progress/);
  assert.match(codemble.desc, /pass graph-derived checks before a system lights up/);
  assert.doesNotMatch(codemble.desc, /\bAI\b/i);
  assert.match(dusori.desc, /paced system of topics, roadmaps, progress, and visible connections/);
  assert.match(dusori.desc, /portable files and makes external edits reviewable/);
  assert.doesNotMatch(dusori.desc, /\bAI\b/i);
});

test('featured builds are framed around user problems and visible value', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /Problems, turned into products\./);
  assert.match(html, /makes value visible through evidence, portability, or measurable feedback/);
  assert.doesNotMatch(html, /public experiments in AI and automation/);
});

test('Codemble and Dusori marks are live CSS animations with reduced-motion guards', () => {
  for (const icon of ['assets/logos/codemble.svg', 'assets/logos/dusori.svg']) {
    const svg = readFileSync(join(root, icon), 'utf8');
    assert.match(svg, /<style>/, `${icon} has no embedded animation styles`);
    assert.match(svg, /@keyframes/, `${icon} has no motion keyframes`);
    assert.match(svg, /animation:/, `${icon} has no live animation`);
    assert.match(svg, /@media \(prefers-reduced-motion: reduce\)/, `${icon} ignores reduced motion`);
  }
});

test('Dusori scene animates a reviewed local write and keeps a reduced-motion state', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /class="dus-scene" aria-hidden="true"/);
  assert.match(html, /class="dus-source"[^>]*>.*topic\.md/s);
  assert.match(html, /class="dus-review"[^>]*>.*external edit.*reviewed/s);
  assert.doesNotMatch(html, /class="dus-ready"/, 'redundant caption can collide with the source stack');
  assert.doesNotMatch(html, /class="dus-roadmap-foot"/, 'roadmap footer can collide with the final step');
  assert.match(html, /@keyframes dusTransit/);
  assert.match(html, /\.dus-packet, \.dus-roadmap, \.dus-review, \.dus-resolve-check, \.dus-wheel \{ animation: none !important; \}/);
});

test('Codemble scene turns source relationships into a settled proof state', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /class="cod-scene" aria-hidden="true"/);
  assert.match(html, /Source → system/);
  assert.match(html, /Chart<\/span><span class="cod-beat">Inspect<\/span><span class="cod-beat proven">Prove/);
  assert.match(html, /class="cod-evidence"/);
  assert.match(html, /understanding proven/);
  assert.doesNotMatch(html, /class="cod-mode"/, 'the project status badge owns the top-right scene space');
  assert.doesNotMatch(html, /class="cod-label"/, 'the project status badge owns the top-right graph space');
  assert.match(html, /\.ghp-card\.visible \.cod-signal \{ animation: codSignal [^;]+ both; \}/);
  assert.doesNotMatch(html, /@keyframes codOrbit/, 'the learning story should settle instead of orbiting forever');
  assert.match(html, /\.cod-network, \.cod-evidence, \.cod-signal, \.cod-node\.verified,/);
});

test('project ids are unique — each one needs its own scene template', () => {
  const ids = PROJECTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('index.html carries a scene template for every project', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  for (const p of PROJECTS) {
    assert.match(
      html,
      new RegExp(`<template class="ghp-scene" data-project="${p.id}">`),
      `index.html has no scene template for ${p.id}`
    );
  }
});

test('featured builds are not hidden behind a tall parent reveal gate', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /class="gh r"/);
  assert.match(html, /class="gh"/);
});

test('index.html loads the project data before the main script needs the cards', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const dataScript = html.indexOf('assets/js/projects.js');
  const observesCards = html.indexOf("'.xp-card, .ghp-card'");
  assert.notEqual(dataScript, -1, 'index.html does not load assets/js/projects.js');
  assert.notEqual(observesCards, -1, 'the main script no longer queries .ghp-card');
  assert.ok(
    dataScript < observesCards,
    'projects.js must load before the script that binds .ghp-card'
  );
});
