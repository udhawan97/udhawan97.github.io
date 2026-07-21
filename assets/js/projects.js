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

const PROJECTS = [
  {
    id: 'orifold',
    name: 'Orifold',
    icon: 'assets/logos/orifold.svg',
    staticIcon: 'assets/logos/orifold-static.svg',
    visualClass: 'ori-visual',
    status: { label: 'Beta', tone: 'beta' },
    lang: { dot: 'swift', label: 'Swift' },
    desc: 'A Mac-native document workspace that carries mixed files through one complete PDF workflow: merge, repair, OCR, edit, annotate, sign, protect, and export. Unlike upload-first utilities split across subscriptions, Orifold keeps the document, its searchable structure, and every core operation together on the Mac—with no account or cloud handoff required.',
    tags: ['Document workflow', 'Private by design', 'OCR + editing', 'macOS'],
    site: 'https://udhawan97.github.io/Orifold/',
    source: 'https://github.com/udhawan97/Orifold',
  },
  {
    id: 'folioorb',
    name: 'FolioOrb',
    icon: 'assets/logos/folioorb.svg',
    staticIcon: 'assets/logos/folioorb-static.svg',
    visualClass: 'orb-visual',
    status: { label: 'Beta', tone: 'beta' },
    lang: { dot: 'python', label: 'Python' },
    desc: 'A portfolio decision workspace that connects holdings, market prices, risk, news, and position history before issuing Hold/Add/Trim/Exit guidance. It exposes the evidence behind each verdict and labels missing or stale inputs instead of presenting a partial valuation as complete. Narration can explain the reasoning, but it never calculates the numbers or places a trade.',
    tags: ['Evidence-led', 'Decision support', 'Data quality', 'No auto-trading'],
    site: 'https://udhawan97.github.io/FolioOrb/',
    source: 'https://github.com/udhawan97/FolioOrb',
  },
  {
    id: 'golavo',
    name: 'Golavo',
    icon: 'assets/logos/golavo.svg',
    status: { label: 'Early access', tone: 'beta' },
    lang: { dot: 'python', label: 'Python' },
    desc: 'A football intelligence cockpit that makes every forecast accountable. Four independently inspectable models turn match data into probability ranges; pre-kickoff seals prevent hindsight edits, while post-match scoring and calibration show which methods actually earn trust. Cited explanations can clarify the evidence without changing a single model probability.',
    tags: ['Forecast accountability', 'Four-model ensemble', 'Sealed predictions', 'Calibration'],
    site: 'https://udhawan97.github.io/Golavo/',
    source: 'https://github.com/udhawan97/Golavo',
  },
  {
    id: 'voyalier',
    name: 'Voyalier',
    icon: 'assets/logos/voyalier.svg',
    status: { label: 'Early access', tone: 'beta' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'A travel intelligence workspace that turns scattered confirmations, official advice, weather, maps, offline packs, and recommendations into one reviewed Smart Blueprint. Unlike itinerary apps that merely collect bookings, Voyalier exposes gaps, asks for consent, and assembles a trip that remains usable when connectivity disappears. On-device or user-key assistance supports the plan without owning it.',
    tags: ['Evidence-backed', 'Smart Blueprint', 'Offline-ready', 'Consent-first'],
    site: 'https://udhawan97.github.io/Voyalier/',
    source: 'https://github.com/udhawan97/Voyalier',
  },
  {
    id: 'codemble',
    name: 'Codemble',
    icon: 'assets/logos/codemble.svg',
    visualClass: 'cod-visual',
    status: { label: 'Under construction' },
    lang: { dot: 'polyglot', label: 'Python · JS/TS' },
    desc: 'An explorable code-learning game that turns an unfamiliar codebase into a parser-proven 3D galaxy—and understanding into visible progress. Instead of treating an explanation as proof, Codemble makes learners navigate real files, inspect exact connections, and pass graph-derived checks before a system lights up, building a durable mental model across Python, JavaScript, TypeScript, and mixed projects.',
    tags: ['Code literacy', 'Parser-proven', '3D + 2D maps', 'Polyglot'],
    site: 'https://udhawan97.github.io/Codemble/',
    source: 'https://github.com/udhawan97/Codemble',
  },
  {
    id: 'dusori',
    name: 'Dusori',
    icon: 'assets/logos/dusori.svg',
    visualClass: 'dus-visual',
    status: { label: 'Under construction' },
    lang: { dot: 'typescript', label: 'TypeScript' },
    desc: 'A learning workspace that turns a scattered syllabus, notes, and source material into a paced system of topics, roadmaps, progress, and visible connections. Unlike course dashboards or second-brain databases that trap state inside an account, Dusori keeps the learning structure in portable files and makes external edits reviewable—so the same body of work can move between Dusori, Obsidian, and any Markdown editor without losing ownership or context.',
    tags: ['Learning workspace', 'Portable files', 'Conflict-safe', 'Obsidian-ready'],
    site: 'https://udhawan97.github.io/Dusori/',
    source: 'https://github.com/udhawan97/Dusori',
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

  return `<article class="ghp-card r d${delay}">
          <div class="${visual}" aria-hidden="true">
            ${statusHtml(project.status)}
            ${sceneHtml}
          </div>
          <div class="ghp-body">
            <div class="ghp-title-row">
              <div class="ghp-name">
                ${appIconHtml(project)}
                <h4>${esc(project.name)}</h4>
              </div>
              <span class="ghp-lang"><span class="ghp-dot ${esc(project.lang.dot)}"></span>${esc(project.lang.label)}</span>
            </div>
            <p class="ghp-desc">${esc(project.desc)}</p>
            <div class="ghp-tags">
              ${tags}
            </div>
            <div class="ghp-links">
              <a class="ghp-link primary" href="${esc(project.site)}" target="_blank" rel="noopener" aria-label="Visit the ${esc(project.name)} website">
                ${ICON_GLOBE}
                Visit site
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
