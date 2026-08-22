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
  assert.match(html, /<span class="ghp-status-sr">Status: Beta<\/span>/);
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
  assert.match(html.trim(), /^<article class="ghp-card r d1" data-project="orifold"/);
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

test('PalDawn is featured with its public product and source links', () => {
  const paldawn = PROJECTS.find((p) => p.id === 'paldawn');
  assert.ok(paldawn, 'PalDawn is missing from the featured builds');
  assert.equal(paldawn.site, 'https://udhawan97.github.io/PalDawn/');
  assert.equal(paldawn.source, 'https://github.com/udhawan97/PalDawn');
  assert.deepEqual(
    Array.from(paldawn.tags),
    ['Cause → effect', 'Two narration depths', 'Claim-level sources', 'Never diagnoses']
  );
});

test('Vidha is featured with its project page and source links', () => {
  const vidha = PROJECTS.find((p) => p.id === 'vidha');
  assert.ok(vidha, 'Vidha is missing from the featured builds');
  assert.equal(vidha.site, 'https://udhawan97.github.io/Vidha/');
  assert.equal(vidha.source, 'https://github.com/udhawan97/Vidha');
  assert.deepEqual(
    Array.from(vidha.tags),
    ['Human verification', 'Per-envelope rules', 'Sealed content', 'Self-hostable']
  );
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

test('Nindova is featured with its live product and source links', () => {
  const nindova = PROJECTS.find((p) => p.id === 'nindova');
  assert.ok(nindova, 'Nindova is missing from the featured builds');
  assert.equal(nindova.site, 'https://udhawan97.github.io/Nindova/');
  assert.equal(nindova.source, 'https://github.com/udhawan97/Nindova');
  assert.deepEqual(
    Array.from(nindova.tags),
    ['Five finite games', 'Separate Night Room', 'Private + offline', 'No rankings or ads']
  );
});

test('Nimanto is featured with its public product and source links', () => {
  const nimanto = PROJECTS.find((p) => p.id === 'nimanto');
  assert.ok(nimanto, 'Nimanto is missing from the featured builds');
  assert.equal(nimanto.site, 'https://udhawan97.github.io/Nimanto/');
  assert.equal(nimanto.source, 'https://github.com/udhawan97/Nimanto');
  assert.deepEqual(
    Array.from(nimanto.tags),
    ['Candidate-controlled', 'Evidence-first', 'Local-first', 'Approval-gated']
  );
});

test('project maturity labels match the current public rollout order', () => {
  const status = Object.fromEntries(PROJECTS.map((p) => [p.id, p.status]));
  assert.deepEqual({ ...status.golavo }, { label: 'Early access', tone: 'beta' });
  assert.deepEqual({ ...status.voyalier }, { label: 'Early access', tone: 'beta' });
  assert.deepEqual({ ...status.paldawn }, { label: 'Early access', tone: 'beta' });
  assert.deepEqual({ ...status.codemble }, { label: 'Under construction' });
  assert.deepEqual({ ...status.dusori }, { label: 'Under construction' });
  assert.deepEqual({ ...status.vidha }, { label: 'Under construction' });
  assert.deepEqual({ ...status.nimanto }, { label: 'Local beta', tone: 'nimanto' });
  assert.deepEqual({ ...status.nindova }, { label: 'Live', tone: 'live' });
});

/*
 * Every desc must read problem → product → market difference in plain words,
 * short enough for a recruiter to scan. The per-project tests below pin the
 * honest boundaries; this one pins the length and the no-AI-leading rule.
 */
test('every description stays concise and layman-readable', () => {
  for (const p of PROJECTS) {
    assert.ok(p.desc.length <= 380, `${p.id} desc runs ${p.desc.length} chars — keep it under 380`);
    assert.doesNotMatch(p.desc, /\bAI\b/i, `${p.id} desc must not lead on AI`);
  }
});

test('Codemble and Dusori explain their distinct user value without leading on AI', () => {
  const codemble = PROJECTS.find((p) => p.id === 'codemble');
  const dusori = PROJECTS.find((p) => p.id === 'dusori');
  assert.match(codemble.desc, /explorable 3D galaxy where progress is earned/);
  assert.match(codemble.desc, /pass checks derived from the code/);
  assert.doesNotMatch(codemble.desc, /\bAI\b/i);
  assert.match(dusori.desc, /scattered notes and syllabi into a paced plan/);
  assert.match(dusori.desc, /plain, portable files/);
  assert.match(dusori.desc, /any Markdown editor and stays yours/);
  assert.doesNotMatch(dusori.desc, /\bAI\b/i);
});

test('PalDawn explains an evidence-first body voyage without medical claims', () => {
  const paldawn = PROJECTS.find((p) => p.id === 'paldawn');
  assert.match(paldawn.desc, /guided flight through the human body/);
  assert.match(paldawn.desc, /plain language or clinical depth/);
  assert.match(paldawn.desc, /every factual claim traces to a curated source/);
  assert.match(paldawn.desc, /Education only: it never diagnoses/);
  assert.doesNotMatch(paldawn.desc, /\bAI\b/i);
  assert.doesNotMatch(paldawn.desc, /\b(?:treatment|cure|triage)\b/i);
});

test('Vidha explains human-verified release without turning silence into death', () => {
  const vidha = PROJECTS.find((p) => p.id === 'vidha');
  assert.match(vidha.desc, /only if you become persistently unreachable/);
  assert.match(vidha.desc, /confirmed by trusted people/);
  assert.match(vidha.desc, /never by a missed email or a timer alone/);
  assert.match(vidha.desc, /Open source and self-hostable/);
  assert.doesNotMatch(vidha.desc, /\bAI\b/i);
  assert.doesNotMatch(vidha.desc, /\b(?:death|dead|estate)\b/i);
});

test('featured builds are framed around user problems and visible value', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /Problems, turned into products\./);
  assert.match(html, /When I’m not working on client projects/);
  assert.match(html, /turning recurring problems into working products/);
  assert.match(html, /from first principles through design, engineering, testing, and release/);
  assert.match(html, /candidate-controlled job search/);
  assert.doesNotMatch(html, /public experiments in AI and automation/);
});

test('featured product marks are live SVG animations with motion-safe fallbacks', () => {
  for (const project of PROJECTS) {
    const svg = readFileSync(join(root, project.icon), 'utf8');
    const hasSmilMotion = /<animate(?:Transform)?\b/.test(svg);
    const hasCssMotion = /@keyframes/.test(svg) && /animation:/.test(svg);
    assert.ok(hasSmilMotion || hasCssMotion, `${project.icon} has no live animation`);

    if (hasSmilMotion) {
      assert.ok(project.staticIcon, `${project.icon} needs a reduced-motion twin`);
      assert.ok(existsSync(join(root, project.staticIcon)), `${project.staticIcon} is missing`);
    } else {
      assert.match(
        svg,
        /@media \(prefers-reduced-motion:\s*reduce\)/,
        `${project.icon} ignores reduced motion`
      );
    }
  }
});

test('Nindova icon stitches four pairs in sequence before closing the center', () => {
  const svg = readFileSync(join(root, 'assets/logos/nindova.svg'), 'utf8');
  assert.match(svg, /animation: nindova-stitch 7s steps\(1, end\) infinite/);
  assert.match(svg, /\.nindova-pair-two \{ animation-delay: \.35s; \}/);
  assert.match(svg, /\.nindova-pair-three \{ animation-delay: \.7s; \}/);
  assert.match(svg, /\.nindova-pair-four \{ animation-delay: 1\.05s; \}/);
  assert.match(svg, /\.nindova-center \{ animation-delay: 1\.6s; \}/);
  assert.match(svg, /6%, 88% \{ opacity: 1; \}/);
  assert.match(svg, /\.nindova-diamond \{[\s\S]*?animation: none !important;[\s\S]*?opacity: 1;/);
  assert.match(svg, /\.nindova-glow \{[\s\S]*?animation: none !important;[\s\S]*?opacity: 0;/);
});

test('Nimanto icon opens five petals once and provides a still reduced-motion twin', () => {
  const svg = readFileSync(join(root, 'assets/logos/nimanto.svg'), 'utf8');
  const still = readFileSync(join(root, 'assets/logos/nimanto-static.svg'), 'utf8');
  assert.equal((svg.match(/class="nim-petal-(?:dark|stone)"/g) || []).length, 5);
  assert.match(svg, /dur="4\.4s" repeatCount="1" fill="freeze"/);
  assert.match(svg, /class="nim-seed"/);
  assert.doesNotMatch(still, /<animate(?:Transform)?\b/);
  assert.equal((still.match(/class="nim-petal-(?:dark|stone)"/g) || []).length, 5);
});

test('Orifold explains one private document workflow instead of leading on local AI', () => {
  const orifold = PROJECTS.find((p) => p.id === 'orifold');
  assert.match(orifold.desc, /does the whole job natively on the Mac/);
  assert.match(orifold.desc, /no account and no upload/);
  assert.match(orifold.desc, /never leaves the machine/);
  assert.doesNotMatch(orifold.desc, /\bAI\b/i);
  assert.deepEqual(
    Array.from(orifold.tags),
    ['Document workflow', 'Private by design', 'OCR + editing', 'macOS']
  );
});

test('FolioOrb explains evidence-led decisions without invented performance claims', () => {
  const folioorb = PROJECTS.find((p) => p.id === 'folioorb');
  assert.match(folioorb.desc, /connects holdings, prices, risk, and news/);
  assert.match(folioorb.desc, /shows the evidence behind every call/);
  assert.match(folioorb.desc, /flags missing or stale data/);
  assert.match(folioorb.desc, /It never places a trade/);
  assert.doesNotMatch(folioorb.desc, /\bAI\b/i);
  assert.deepEqual(
    Array.from(folioorb.tags),
    ['Evidence-led', 'Decision support', 'Data quality', 'No auto-trading']
  );
});

test('Golavo explains accountable forecasting instead of leading on local AI', () => {
  const golavo = PROJECTS.find((p) => p.id === 'golavo');
  assert.match(golavo.desc, /makes every forecast accountable/);
  assert.match(golavo.desc, /sealed before kickoff/);
  assert.match(golavo.desc, /which methods actually earn trust/);
  assert.doesNotMatch(golavo.desc, /\bAI\b/i);
  assert.deepEqual(
    Array.from(golavo.tags),
    ['Forecast accountability', 'Four-model ensemble', 'Sealed predictions', 'Calibration']
  );
});

test('Voyalier explains reviewed travel readiness instead of leading on local AI', () => {
  const voyalier = PROJECTS.find((p) => p.id === 'voyalier');
  assert.match(voyalier.desc, /Itinerary apps collect bookings/);
  assert.match(voyalier.desc, /one reviewed plan/);
  assert.match(voyalier.desc, /surfaces the gaps before you fly/);
  assert.match(voyalier.desc, /usable offline/);
  assert.doesNotMatch(voyalier.desc, /\bAI\b/i);
  assert.deepEqual(
    Array.from(voyalier.tags),
    ['Evidence-backed', 'Smart Blueprint', 'Offline-ready', 'Consent-first']
  );
});

test('Nindova explains its separate finite House and Night loops without reward claims', () => {
  const nindova = PROJECTS.find((p) => p.id === 'nindova');
  assert.match(nindova.desc, /built to end: five finite tables/);
  assert.match(nindova.desc, /deliberately separate Night Room/);
  assert.match(nindova.desc, /No account, ads, rankings, or telemetry/);
  assert.match(nindova.desc, /clearable anytime/);
  assert.doesNotMatch(nindova.desc, /improves? sleep|dopamine|memory/i);
});

test('Nimanto explains candidate control without promising employment or sponsorship', () => {
  const nimanto = PROJECTS.find((p) => p.id === 'nimanto');
  assert.match(nimanto.desc, /local-first workbench for H-1B professionals/);
  assert.match(nimanto.desc, /requirement by requirement why a role fits/);
  assert.match(nimanto.desc, /sends nothing anywhere without explicit approval/);
  assert.match(nimanto.desc, /never predicts hiring odds or promises sponsorship/);
  assert.doesNotMatch(nimanto.desc, /auto-apply|guaranteed|legal advice/i);
});

test('Orifold scene resolves mixed operations into one private document', () => {
  const html = readIndex();
  assert.match(html, /class="ori-scene" aria-hidden="true"/);
  assert.match(html, /Files → finished PDF/);
  assert.match(html, /One document workflow\./);
  assert.match(html, /class="ori-source merge"[^>]*>.*Merge/s);
  assert.match(html, /class="ori-source ocr"[^>]*>.*OCR/s);
  assert.match(html, /class="ori-source sign"[^>]*>.*Sign/s);
  assert.match(html, /stays on this Mac/);
  assert.match(html, /\.ghp-card\.visible \.ori-packet \{ animation: oriPacket [^;]+ both; \}/);
  assert.doesNotMatch(html, /@keyframes pdfFloat/, 'the document story should resolve instead of floating forever');
  assert.match(html, /\.ori-source, \.ori-packet, \.ori-document, \.ori-doc-sign, \.ori-proof,/);
});

test('FolioOrb scene resolves visible evidence into a verdict without fake returns', () => {
  const html = readIndex();
  assert.match(html, /class="orb-scene" aria-hidden="true"/);
  assert.match(html, /Evidence → verdict/);
  assert.match(html, /Decisions without hidden math\./);
  assert.match(html, /class="orb-source price">prices/);
  assert.match(html, /<span><em>Hold<\/em><em>Add<\/em><em>Trim<\/em><em>Exit<\/em><\/span>/);
  assert.match(html, /data quality visible/);
  assert.match(html, /\.ghp-card\.visible \.orb-signal \{ animation: orbSignal [^;]+ both; \}/);
  assert.doesNotMatch(html, /\+12\.4%/, 'the card must not invent a portfolio return');
  assert.doesNotMatch(html, /@keyframes finDraw/, 'the decision story should resolve instead of replaying a market chart');
  assert.match(html, /\.orb-source, \.orb-signal, \.orb-core-ring, \.orb-core, \.orb-actions, \.orb-proof,/);
});

test('FolioOrb evidence lanes do not cross labels or bleed from narrow cards', () => {
  const html = readIndex();
  assert.match(html, /class="orb-link price" d="M30 10\.5 H43 L52 50"/);
  assert.match(html, /class="orb-link news" d="M30 63\.2 H47 L52 50"/);
  assert.doesNotMatch(html, /M56 10 L126 10 L156 40/, 'a price connector must not run through the news label');
  assert.match(html, /\.orb-source\.price \{ top: 0; \}/);
  assert.match(html, /\.orb-source\.history \{ top: 60px; \}/);
  assert.match(
    html,
    /@container \(max-width: 360px\) \{[\s\S]*?\.orb-stage \{[\s\S]*?left: 0; top: 0; width: 100%; height: 100%;[\s\S]*?transform: none;/
  );
  assert.match(html, /--orb-signal-shift: 9cqw;/);
});

test('Golavo scene resolves forecast evidence into an intact audit trail', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /class="gol-scene" aria-hidden="true"/);
  assert.match(html, /Forecast → seal → score/);
  assert.match(html, /A prediction with a receipt\./);
  assert.match(html, /audit trail intact/);
  assert.match(html, /\.ghp-card\.visible \.gol-packet \{ animation: golPacket [^;]+ both; \}/);
  assert.doesNotMatch(html, /@keyframes golKick/, 'the story should resolve instead of looping a goal forever');
  assert.match(html, /\.gol-progress, \.gol-packet, \.gol-node\.seal, \.gol-node\.score, \.gol-verdict,/);
});

test('Voyalier scene turns reviewed evidence into a ready Smart Blueprint', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /class="voy-scene" aria-hidden="true"/);
  assert.match(html, /Evidence → readiness/);
  assert.match(html, /Plans that survive travel day\./);
  assert.match(html, /class="voy-source">official advice/);
  assert.match(html, /class="voy-signal"/);
  assert.match(html, /Smart Blueprint ready/);
  assert.doesNotMatch(html, /@keyframes voyGlide/, 'the story should resolve instead of looping a flight forever');
  assert.match(html, /\.voy-source, \.voy-route-group, \.voy-signal, \.voy-checkpoint, \.voy-destination, \.voy-blueprint,/);
});

test('Dusori scene animates a reviewed local write and keeps a reduced-motion state', () => {
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  assert.match(html, /class="dus-scene" aria-hidden="true"/);
  assert.match(html, /class="dus-source"[^>]*>.*topic\.md/s);
  assert.match(html, /class="dus-review"[^>]*>.*external edit.*reviewed/s);
  assert.doesNotMatch(html, /class="dus-ready"/, 'redundant caption can collide with the source stack');
  assert.doesNotMatch(html, /class="dus-roadmap-foot"/, 'roadmap footer can collide with the final step');
  assert.match(
    html,
    /\.dus-review \{[\s\S]*?left: 140px; top: 104px;[\s\S]*?background: color-mix\(in oklch, var\(--dus-ink\), var\(--dus-paper\) 8%\);[\s\S]*?white-space: nowrap;/,
    'the review checkpoint must stay distinct from the pale roadmap panel'
  );
  assert.match(html, /\.dus-review span \{ color: var\(--dus-paper-dim\); \}/);
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

test('Nindova scene separates five finite Salon tables from the Night Room', () => {
  const html = readIndex();
  assert.match(html, /class="nin-scene" aria-hidden="true"/);
  assert.match(html, /House \+<\/span> <span>Night Room/);
  assert.match(html, /Every room has an ending\./);
  assert.match(html, /class="nin-palace" viewBox="0 0 324 118"/);
  assert.match(html, /class="nin-curtain nin-curtain-left"/);
  assert.match(html, /class="nin-curtain nin-curtain-right"/);
  assert.equal((html.match(/class="nin-table [^"]+"/g) || []).length, 5);
  assert.match(html, /class="nin-threshold"/);
  assert.match(html, /class="nin-door-glow"/);
  assert.match(html, /class="nin-night-room"/);
  assert.match(html, /five finite games · one night room/);
  assert.match(
    html,
    /\.nin-stage \{[\s\S]*?width: min\(100%, 468px\);[\s\S]*?aspect-ratio: 13 \/ 4;/,
    'the scene should scale with the card instead of clipping a fixed-width stage'
  );
  assert.doesNotMatch(
    html,
    /@container \(max-width: [^)]+\) \{ \.nin-stage/,
    'the Nindova stage should not rely on breakpoint-specific scale guesses'
  );
  assert.match(html, /\.ghp-card\.visible \.nin-table \{ animation: ninTable [^;]+ both; \}/);
  assert.doesNotMatch(html, /animation: ninTable [^;]+ infinite/, 'the House story should settle');
  assert.match(html, /\.nin-palace-shell, \.nin-curtain, \.nin-table,/);
  assert.match(html, /\.nin-door-glow, \.nin-night-room, \.nin-proof \{ animation: none !important; \}/);
});

test('Nimanto scene turns confirmed evidence into an inspectable, approval-gated handoff', () => {
  const html = readIndex();
  assert.match(html, /class="nim-scene" aria-hidden="true"/);
  assert.match(html, /Evidence first/);
  assert.match(html, /You approve every handoff\./);
  assert.match(html, /class="nim-story-compact">You approve\.<br>Every step\.<\/span>/);
  assert.equal((html.match(/class="nim-evidence-line [^"]+"/g) || []).length, 3);
  assert.equal((html.match(/class="nim-petal [^"]+"/g) || []).length, 5);
  assert.equal((html.match(/class="nim-ledger-row [^"]+"/g) || []).length, 3);
  assert.match(html, /role fit · inspectable/);
  assert.match(html, /criteria<\/b><em>supported/);
  assert.match(html, /sponsor<\/b><em>verify/);
  assert.match(html, /approve yourself/);
  assert.match(html, /width: min\(100%, 432px\);/);
  assert.match(html, /clipPath id="nim-flow-safe" clipPathUnits="userSpaceOnUse"/);
  assert.equal((html.match(/class="nim-connector (?:evidence|ledger)"/g) || []).length, 2);
  assert.equal((html.match(/class="nim-flow-port (?:evidence|ledger)"/g) || []).length, 2);
  assert.match(html, /class="nim-connector evidence" d="M168 69C178 69 183 77 194 77"/);
  assert.match(html, /class="nim-connector ledger" d="M306 77C314 77 318 71 324 71"/);
  assert.doesNotMatch(html, /M146 91C168 91/, 'connectors must not enter the evidence text column');
  assert.match(html, /\.nim-evidence-line \{[\s\S]*?font: 500 9px\/1\.15 var\(--font-mono\);/);
  assert.match(html, /\.ghp-card\[data-project="nimanto"\] \.ghp-visual \{ height: 152px; \}/);
  assert.match(html, /#topBtn \{ bottom: 18px; left: auto; right: 16px; width: 46px;/);
  assert.match(html, /\.ghp-card\.visible \.nim-petal \{ animation: nimFoldOpen [^;]+ both; \}/);
  assert.doesNotMatch(html, /animation: nim(?:Gather|FoldOpen|Resolve) [^;]+ infinite/);
  assert.match(html, /\.nim-evidence-line, \.nim-petal, \.nim-ledger-row, \.nim-approval \{ animation: none !important; \}/);
  assert.match(html, /\.nim-evidence-line, \.nim-petal, \.nim-ledger-row, \.nim-approval \{ opacity: 1; transform: none !important; \}/);
  assert.doesNotMatch(html, /automatic application|hiring odds|sponsorship guaranteed/i);
});

test('PalDawn scene flies a cited cause-to-effect voyage into first light', () => {
  const html = readIndex();
  assert.match(html, /class="pal-scene" aria-hidden="true"/);
  assert.match(html, /Cause → effect/);
  assert.match(html, /A voyage you can fact-check\./);
  assert.match(html, /class="pal-depth lay">plain<\/span>/);
  assert.match(html, /class="pal-depth cli">clinical<\/span>/);
  assert.equal((html.match(/class="pal-node (?:cause|portal|effect)"/g) || []).length, 3);
  assert.match(html, /every claim cited/);
  assert.match(html, /\.ghp-card\.visible \.pal-ship \{ animation: palShip [^;]+ both; \}/);
  assert.doesNotMatch(html, /animation: pal[A-Za-z]+ [^;]+ infinite/, 'the voyage story should settle');
  assert.match(html, /\.pal-dawn-group, \.pal-route, \.pal-ship, \.pal-node\.effect, \.pal-depth, \.pal-proof,/);
});

test('Vidha scene verifies silence with people before an envelope releases', () => {
  const html = readIndex();
  assert.match(html, /class="vid-scene" aria-hidden="true"/);
  assert.match(html, /Check-ins → release/);
  assert.match(html, /Released by people, not timers\./);
  assert.equal((html.match(/class="vid-tick (?:one|two|three|missed)"/g) || []).length, 4);
  assert.match(html, /Humans verify/);
  assert.match(html, /sealed until confirmed/);
  assert.match(html, /\.ghp-card\.visible \.vid-packet \{ animation: vidPacket [^;]+ both; \}/);
  assert.doesNotMatch(html, /animation: vid[A-Za-z]+ [^;]+ infinite/, 'the vigil story should settle');
  assert.match(html, /\.vid-progress, \.vid-packet, \.vid-tick, \.vid-node, \.vid-envelope, \.vid-proof \{ animation: none !important; \}/);
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

test('the stacked About layout releases the portrait before copy can cross it', () => {
  const html = readIndex();
  assert.match(
    html,
    /@media \(max-width: 880px\) \{[\s\S]*?\.about-grid \.portrait \{ position: relative; top: auto; \}/,
    'the one-column portrait override must outrank the later sticky base rule'
  );
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
