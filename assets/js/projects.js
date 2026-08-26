/*
 * Featured builds — the data behind the project cards, and the card renderer.
 *
 * Plain classic script on purpose: the site has no build step and index.html
 * opens straight from the filesystem, so no ES modules. index.html loads this
 * before the main script, which needs the cards in the DOM to observe them.
 *
 * Adding a project = one entry here + one <template class="ghp-scene"> in
 * index.html carrying its bespoke visual.
 *
 * Tested by tests/projects.test.mjs (`node --test`).
 */

/*
 * Every desc follows one shape a recruiter can scan in seconds:
 * the everyday problem → the value the product creates → the boundary
 * that makes it trustworthy. Honest limits ("never trades", "does not
 * diagnose") stay in. Kept under 300 characters by tests/projects.test.mjs.
 */
const PROJECTS = [
  {
    id: 'orifold',
    name: 'Orifold',
    icon: 'assets/logos/orifold.svg',
    staticIcon: 'assets/logos/orifold-static.svg',
    visualClass: 'ori-visual',
    status: { label: 'Beta', tone: 'beta' },
    lang: { dot: 'swift', label: 'Swift' },
    desc: 'PDF work scatters sensitive files across utilities and cloud uploads. Orifold turns up to 50 mixed files into one clean, searchable, signed, protected document on your Mac—with no account, upload, or subscription.',
    tags: ['One PDF workspace', 'Private on Mac', 'OCR + editing', 'Batch + compare'],
    site: 'https://udhawan97.github.io/Orifold/',
    source: 'https://github.com/udhawan97/Orifold',
  },
  {
    id: 'folioorb',
    name: 'FolioOrb',
    icon: 'assets/logos/folioorb.svg',
    staticIcon: 'assets/logos/folioorb-static.svg',
    visualClass: 'orb-visual',
    status: { label: 'Stable', tone: 'live' },
    lang: { dot: 'python', label: 'Python' },
    desc: 'Portfolio dashboards show numbers without explaining what deserves attention. FolioOrb turns holdings, market context, risk, and news into an explainable review with visible data gaps and durable records. It never connects to a brokerage or places trades.',
    tags: ['Explainable review', 'Data gaps visible', 'Durable records', 'No auto-trading'],
    site: 'https://udhawan97.github.io/FolioOrb/',
    source: 'https://github.com/udhawan97/FolioOrb',
  },
  {
    id: 'golavo',
    name: 'Golavo',
    icon: 'assets/logos/golavo.svg',
    status: { label: 'Pre-alpha', tone: 'beta' },
    lang: { dot: 'python', label: 'Python' },
    desc: 'Football forecasts rarely keep receipts. Golavo compares transparent models, locks predictions before kickoff, then uses post-match evidence to score or void them—so disagreement and track record stay visible. No betting or invented certainty.',
    tags: ['Match cockpit', 'Transparent models', 'Sealed predictions', 'Local-first'],
    site: 'https://udhawan97.github.io/Golavo/',
    source: 'https://github.com/udhawan97/Golavo',
  },
  {
    id: 'voyalier',
    name: 'Voyalier',
    icon: 'assets/logos/voyalier.svg',
    status: { label: 'Public beta', tone: 'beta' },
    lang: { dot: 'polyglot', label: 'Rust · TypeScript' },
    desc: 'Trip plans fracture across confirmations, tabs, and notes. Voyalier turns them into a source-linked, reviewable Blueprint that flags logistics gaps and stays useful offline—without an account, telemetry, or required AI.',
    tags: ['Evidence review', 'Trip Blueprint', 'Offline-ready', 'Consent-first'],
    site: 'https://udhawan97.github.io/Voyalier/',
    source: 'https://github.com/udhawan97/Voyalier',
  },
  {
    id: 'paldawn',
    name: 'PalDawn',
    icon: 'assets/logos/paldawn.svg',
    visualClass: 'pd-visual',
    status: { label: 'v0.3 live', tone: 'paldawn' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'Disease mechanisms are hard to follow across disconnected diagrams. PalDawn turns source-linked explanations into guided 3D journeys across body systems, with evidence beside each step. Educational only—it does not diagnose, and its synthetic systems map is not reviewed anatomy.',
    tags: ['3D learning voyage', 'Source-linked', 'Mechanism Lens', 'Synthetic map'],
    site: 'https://udhawan97.github.io/PalDawn/',
    source: 'https://github.com/udhawan97/PalDawn',
  },
  {
    id: 'codemble',
    name: 'Codemble',
    icon: 'assets/logos/codemble.svg',
    visualClass: 'cod-visual',
    status: { label: 'Stable', tone: 'live' },
    lang: { dot: 'polyglot', label: 'Python · JS/TS' },
    desc: 'Code generators can leave you with a project you cannot explain. Codemble maps local code as an explorable galaxy and conventional diagrams, traces change impact, and lights a system only after parser-derived checks prove understanding.',
    tags: ['Local code maps', 'Nine languages', 'Change impact', 'Proof-based learning'],
    site: 'https://udhawan97.github.io/Codemble/',
    source: 'https://github.com/udhawan97/Codemble',
  },
  {
    id: 'dusori',
    name: 'Dusori',
    icon: 'assets/logos/dusori.svg',
    visualClass: 'dus-visual',
    status: { label: 'v0.14 live', tone: 'live' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'Research tools hide how an answer was assembled. Dusori uses only search providers you permit, preserves the evidence trail, and turns quotable passages into an honest brief with citations and visible gaps—stored in ordinary local files.',
    tags: ['Evidence research', 'Consent-gated', 'Cited briefs', 'Local files'],
    site: 'https://udhawan97.github.io/Dusori/',
    source: 'https://github.com/udhawan97/Dusori',
  },
  {
    id: 'vidha',
    name: 'Vidha',
    icon: 'assets/logos/vidha.svg',
    visualClass: 'vidha-visual',
    status: { label: 'Pre-alpha', tone: 'vidha' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'Contingency plans fail when one person becomes unreachable. Vidha is a pre-alpha rehearsal for a recipient-specific document relay, designed around check-ins and human verification without drawing conclusions. Verification, authority, and delivery are not yet implemented.',
    tags: ['Contingency relay', 'Explicit check-ins', 'Human verification planned', 'Synthetic only'],
    site: 'https://github.com/udhawan97/Vidha#readme',
    siteLabel: 'Read overview',
    siteAria: 'Read the Vidha project overview',
    source: 'https://github.com/udhawan97/Vidha',
  },
  {
    id: 'nimanto',
    name: 'Nimanto',
    icon: 'assets/logos/nimanto.svg',
    staticIcon: 'assets/logos/nimanto-static.svg',
    visualClass: 'nim-visual',
    status: { label: 'v0.8 beta', tone: 'nimanto' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'Job searches bury evidence beneath opaque matching and sponsorship rumors. Nimanto gives H-1B professionals a private workbench to confirm career facts, inspect role fit, track applications, and approve every external handoff. It never predicts hiring odds or promises sponsorship.',
    tags: ['Candidate-controlled', 'Explainable fit', 'Local-first', 'Approval-gated'],
    site: 'https://udhawan97.github.io/Nimanto/',
    source: 'https://github.com/udhawan97/Nimanto',
  },
  {
    id: 'nindova',
    name: 'Nindova',
    icon: 'assets/logos/nindova.svg',
    visualClass: 'nin-visual',
    status: { label: 'Live', tone: 'live' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'Most games are designed to keep you playing. For adults 18+, Nindova offers eight authored browser games with fixed endings, plus a separate self-ending Night Room—all private, offline-ready, and free of accounts, ads, rankings, or telemetry.',
    tags: ['Eight finite games', 'Separate Night Room', 'Private + offline', 'No rankings or ads'],
    site: 'https://udhawan97.github.io/Nindova/',
    source: 'https://github.com/udhawan97/Nindova',
  },
];

/* Inlined once here instead of once per card. */
const ICON_GLOBE =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
const ICON_ARROW =
  '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const ICON_GITHUB =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>';

/* CSS only defines stagger delays d1–d4. */
const MAX_DELAY_STEP = 4;

/* esc() comes from util.js, which index.html loads first. */

/*
 * Only some icons need a staticIcon twin, and that isn't an oversight:
 * orifold/folioorb animate with SMIL <animate> tags, which ignore
 * prefers-reduced-motion, so CSS swaps in a still twin instead. golavo,
 * voyalier, codemble, and dusori animate with CSS inside the SVG and already
 * guard themselves. Adding twins for those four would be dead weight.
 */
function appIconHtml(project) {
  const attrs = `alt="" aria-hidden="true" width="48" height="48" loading="lazy" decoding="async"`;
  if (!project.staticIcon) {
    return `<img class="ghp-appicon" src="${esc(project.icon)}" ${attrs}>`;
  }
  return `<img class="ghp-appicon ghp-appicon-motion" src="${esc(project.icon)}" ${attrs}>
                <img class="ghp-appicon ghp-appicon-static" src="${esc(project.staticIcon)}" ${attrs}>`;
}

function statusHtml(status) {
  if (!status) return '';
  const cls = status.tone ? `ghp-status ${esc(status.tone)}` : 'ghp-status';
  return `<span class="${cls}"><span class="ghp-status-dot"></span>${esc(status.label)}</span>`;
}

function projectCardHtml(project, sceneHtml, index = 0) {
  const delay = Math.min(index + 1, MAX_DELAY_STEP);
  const visual = project.visualClass
    ? `ghp-visual ${esc(project.visualClass)}`
    : 'ghp-visual';
  const tags = project.tags
    .map((tag) => `<span class="ghp-tag">${esc(tag)}</span>`)
    .join('\n              ');
  const accessibleStatus = project.status
    ? `<span class="ghp-status-sr">Status: ${esc(project.status.label)}</span>`
    : '';
  const siteLabel = project.siteLabel || 'Visit site';
  const siteAria = project.siteAria || `Visit the ${project.name} website`;

  return `<article class="ghp-card r d${delay}" data-project="${esc(project.id)}">
          <div class="${visual}" aria-hidden="true">
            ${statusHtml(project.status)}
            ${sceneHtml}
          </div>
          <div class="ghp-body">
            <div class="ghp-title-row">
              <div class="ghp-name">
                ${appIconHtml(project)}
                <h4>${esc(project.name)}</h4>
                ${accessibleStatus}
              </div>
              <span class="ghp-lang"><span class="ghp-dot ${esc(project.lang.dot)}"></span>${esc(project.lang.label)}</span>
            </div>
            <p class="ghp-desc">${esc(project.desc)}</p>
            <div class="ghp-tags">
              ${tags}
            </div>
            <div class="ghp-links">
              <a class="ghp-link primary" href="${esc(project.site)}" target="_blank" rel="noopener" aria-label="${esc(siteAria)}">
                ${ICON_GLOBE}
                ${esc(siteLabel)}
                ${ICON_ARROW}
              </a>
              <a class="ghp-link secondary" href="${esc(project.source)}" target="_blank" rel="noopener" aria-label="View ${esc(project.name)} source on GitHub">
                ${ICON_GITHUB}
                Source
              </a>
            </div>
          </div>
        </article>`;
}

/*
 * Swap the scene templates in the grid for the rendered cards. Each card's
 * bespoke visual stays hand-written in index.html; everything around it comes
 * from PROJECTS.
 *
 * innerHTML is safe here: every value is authored in this repo, text goes
 * through esc(), and the scene markup comes from the page's own templates.
 * Nothing here ever touches visitor input.
 */
function renderProjectCards(grid, projects) {
  const scenes = new Map();
  grid.querySelectorAll('template.ghp-scene').forEach((tpl) => {
    scenes.set(tpl.dataset.project, tpl.innerHTML);
  });
  grid.innerHTML = projects
    .map((project, i) => projectCardHtml(project, scenes.get(project.id) || '', i))
    .join('\n');
}

/* Absent under `node --test`, which only exercises the pure parts above. */
if (typeof document !== 'undefined') {
  const grid = document.querySelector('.ghp-grid');
  if (grid) renderProjectCards(grid, PROJECTS);
}
