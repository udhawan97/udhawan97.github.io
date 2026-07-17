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
