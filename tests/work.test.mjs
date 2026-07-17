/*
 * Tests for assets/js/work.js — the roles, workstreams and outcomes behind the
 * impact map and the case studies.
 *
 * Run: node --test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load, readIndex } from './load.mjs';

const {
  ROLES,
  WORKSTREAMS,
  workConnections,
  roleNodeHtml,
  workstreamNodeHtml,
  outcomeNodeHtml,
  caseStudyRowHtml,
  outcomeHtml,
  outcomeText,
} = load(['assets/js/util.js', 'assets/js/work.js'], `{
  ROLES, WORKSTREAMS, workConnections, roleNodeHtml, workstreamNodeHtml,
  outcomeNodeHtml, caseStudyRowHtml, outcomeHtml, outcomeText
}`);

const ws = {
  id: 'ws1',
  role: 'senior',
  nodeLabel: 'Release Safety & Observability',
  title: 'Release Safety & Observability at Scale',
  desc: 'Embedded with a retailer’s cloud team.',
  tags: ['Cloud', 'CI/CD'],
  outcome: {
    id: 'out1',
    metric: '−20%',
    sub: 'incidents · MTTR −15%',
    statement: 'Incidents *−20%* · MTTR *−15%*',
  },
};

/* --- the outcome statement: one authored string, two renderings --- */

test('outcome statement emphasises the starred spans for the case-study row', () => {
  assert.equal(
    outcomeHtml('Incidents *−20%* · MTTR *−15%*'),
    'Incidents <em>−20%</em> · MTTR <em>−15%</em>'
  );
});

test('outcome statement drops the stars for the detail panel', () => {
  assert.equal(outcomeText('Incidents *−20%* · MTTR *−15%*'), 'Incidents −20% · MTTR −15%');
});

test('outcome statement escapes the text around the emphasis', () => {
  assert.equal(outcomeHtml('A & B *<x>*'), 'A &amp; B <em>&lt;x&gt;</em>');
  assert.equal(outcomeText('A & B *<x>*'), 'A &amp; B &lt;x&gt;');
});

/* --- the map --- */

test('role node carries its id and type', () => {
  const html = roleNodeHtml({ id: 'senior', label: 'Senior Consultant', sub: 'EY Studio+' });
  assert.match(html, /<div class="impact-node role-node r" data-id="senior" data-type="role">/);
  assert.match(html, /<span class="node-label">Senior Consultant<\/span>/);
  assert.match(html, /<span class="node-sub">EY Studio\+<\/span>/);
});

test('workstream node wires itself to its role and outcome', () => {
  const html = workstreamNodeHtml(ws);
  assert.match(
    html,
    /<div class="impact-node ws-node r" data-id="ws1" data-type="workstream" data-role="senior" data-outcome="out1">/
  );
  assert.match(html, /<span class="node-label">Release Safety &amp; Observability<\/span>/);
});

test('outcome node shows the metric and its sub-label', () => {
  const html = outcomeNodeHtml(ws);
  assert.match(html, /<div class="impact-node outcome-node r" data-id="out1" data-type="outcome">/);
  assert.match(html, /<span class="outcome-metric">−20%<\/span>/);
  assert.match(html, /<span class="node-sub">incidents · MTTR −15%<\/span>/);
});

test('connections are derived from the workstreams, not listed twice', () => {
  // Objects built inside the vm carry the vm's prototypes, so compare structurally.
  const conns = JSON.parse(JSON.stringify(workConnections([ws])));
  assert.deepEqual(conns, [
    { from: 'senior', to: 'ws1' },
    { from: 'ws1', to: 'out1' },
  ]);
});

test('every workstream contributes a role link and an outcome link', () => {
  assert.equal(workConnections(WORKSTREAMS).length, WORKSTREAMS.length * 2);
});

/* --- the case studies --- */

test('case study row is numbered from its position, zero-padded', () => {
  assert.match(caseStudyRowHtml(ws, 0, ''), /<div class="idx">01<\/div>/);
  assert.match(caseStudyRowHtml(ws, 9, ''), /<div class="idx">10<\/div>/);
});

test('case study row shows the same title as the detail panel', () => {
  assert.match(
    caseStudyRowHtml(ws, 0, ''),
    /<h3>.*Release Safety &amp; Observability at Scale<\/h3>/
  );
});

test('case study row slots its icon into the heading', () => {
  assert.match(caseStudyRowHtml(ws, 0, '<svg class="row-icon"></svg>'), /<h3><svg class="row-icon"><\/svg>Release/);
});

test('case study row renders the outcome with emphasis, then the tags', () => {
  const html = caseStudyRowHtml(ws, 0, '');
  assert.match(
    html,
    /<div class="meta"><span class="outcome">Incidents <em>−20%<\/em> · MTTR <em>−15%<\/em><\/span>Cloud · CI\/CD<\/div>/
  );
});

test('case study row is a .work-row the reveal observer can pick up', () => {
  assert.match(caseStudyRowHtml(ws, 0, '').trim(), /^<div class="work-row r">/);
});

/* --- the data itself --- */

test('every workstream points at a role that exists', () => {
  const roleIds = new Set(ROLES.map((r) => r.id));
  for (const w of WORKSTREAMS) {
    assert.ok(roleIds.has(w.role), `${w.id} points at unknown role "${w.role}"`);
  }
});

test('workstream and outcome ids are unique', () => {
  const wsIds = WORKSTREAMS.map((w) => w.id);
  const outIds = WORKSTREAMS.map((w) => w.outcome.id);
  assert.equal(new Set(wsIds).size, wsIds.length);
  assert.equal(new Set(outIds).size, outIds.length);
});

test('every workstream carries the fields both views need', () => {
  for (const w of WORKSTREAMS) {
    for (const field of ['id', 'role', 'nodeLabel', 'title', 'desc']) {
      assert.ok(w[field], `${w.id || '?'} is missing ${field}`);
    }
    assert.ok(w.tags.length, `${w.id} has no tags`);
    assert.ok(w.outcome?.id && w.outcome?.metric && w.outcome?.statement, `${w.id} outcome`);
  }
});

test('outcome statements have balanced emphasis markers', () => {
  for (const w of WORKSTREAMS) {
    const stars = (w.outcome.statement.match(/\*/g) || []).length;
    assert.equal(stars % 2, 0, `${w.id}: unbalanced * in "${w.outcome.statement}"`);
    assert.ok(stars > 0, `${w.id}: outcome has nothing emphasised`);
  }
});

/* --- the wiring in index.html --- */

test('index.html carries a row icon template for every workstream', () => {
  const html = readIndex();
  for (const w of WORKSTREAMS) {
    assert.match(
      html,
      new RegExp(`<template class="work-icon" data-ws="${w.id}">`),
      `index.html has no row icon for ${w.id}`
    );
  }
});

test('index.html no longer hand-writes the impact nodes or case studies', () => {
  const html = readIndex();
  assert.doesNotMatch(html, /data-type="workstream"/, 'workstream nodes are still hand-written');
  assert.doesNotMatch(html, /<div class="work-row r">/, 'case study rows are still hand-written');
});

test('index.html loads the work data before the script that reads it', () => {
  const html = readIndex();
  const dataScript = html.indexOf('assets/js/work.js');
  const usesData = html.indexOf("getElementById('impactMap')");
  assert.notEqual(dataScript, -1, 'index.html does not load assets/js/work.js');
  assert.notEqual(usesData, -1, 'the impact map script is gone');
  assert.ok(dataScript < usesData, 'work.js must load before the impact map script');
});
