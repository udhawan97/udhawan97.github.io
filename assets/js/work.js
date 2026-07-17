/*
 * The work: roles, workstreams, and what each one produced.
 *
 * This is the one place the six workstreams are written down. It feeds three
 * views that used to keep their own copies and drift apart:
 *   - the impact map's role / workstream / outcome nodes
 *   - the map's detail panel (opened by clicking a workstream)
 *   - the "Detailed Case Studies" rows
 *
 * Each outcome is authored once, with *stars* marking the part the case-study
 * row emphasises; the detail panel shows the same sentence without them.
 *
 * Adding a workstream = one entry here + one <template class="work-icon"> in
 * index.html carrying its row icon. The role and outcome links are read from
 * the entry, so there is no separate connection list to keep in step.
 *
 * Tested by tests/work.test.mjs (`node --test`).
 */

const ROLES = [
  { id: 'senior', label: 'Senior Consultant', sub: 'EY Studio+' },
  { id: 'consultant', label: 'Consultant', sub: 'EY' },
  { id: 'intern', label: 'IT Leadership Intern', sub: 'SAP America' },
];

const WORKSTREAMS = [
  {
    id: 'ws1',
    role: 'senior',
    nodeLabel: 'Release Safety & Observability',
    title: 'Release Safety & Observability at Scale',
    desc: 'Embedded with a Fortune 100 retailer’s cloud engineering team to harden releases — rollback standards, pre-deployment risk patterns, and an observability framework built from structured logs, dashboards, and diagnostic metrics.',
    tags: ['Cloud', 'CI/CD', 'Grafana', 'AppDynamics'],
    outcome: {
      id: 'out1',
      metric: '−20%',
      sub: 'incidents · MTTR −15%',
      statement: 'Incidents *−20%* · MTTR *−15%*',
    },
  },
  {
    id: 'ws2',
    role: 'senior',
    nodeLabel: 'Contact Center AI Strategy',
    title: 'Contact Center AI Strategy',
    desc: 'AI and technology points of view for Fortune 500 healthcare clients — capability assessments, tech stack benchmarks, and persona-based journeys, anchored in live validation of real customer service experiences.',
    tags: ['Generative AI', 'CX Strategy', 'Research'],
    outcome: {
      id: 'out2',
      metric: 'Strategy',
      sub: 'pursuit shaped',
      statement: 'Shaped *pursuit strategy*',
    },
  },
  {
    id: 'ws3',
    role: 'consultant',
    nodeLabel: 'Retail Platform Launch',
    title: 'Retail Platform Launch, 100+ Locations',
    desc: 'Led quality engineering for an in-store production platform rollout: automated regression with Kotlin and Appium, cross-team triage, weekly release sign-offs.',
    tags: ['Kotlin', 'Appium', 'Agile', 'JIRA'],
    outcome: {
      id: 'out3',
      metric: '+30%',
      sub: 'routing efficiency',
      statement: 'Routing efficiency *+30%*',
    },
  },
  {
    id: 'ws4',
    role: 'consultant',
    nodeLabel: 'Federal Cloud Compliance',
    title: 'Federal Cloud, Zero Audit Findings',
    desc: 'Coordinated agile delivery on a Microsoft GCC High implementation, ensuring FedRAMP and NIST 800-53 controls were executed and verified end to end.',
    tags: ['Azure', 'FedRAMP', 'NIST 800-53'],
    outcome: {
      id: 'out4',
      metric: '0',
      sub: 'audit findings',
      statement: '*0* audit findings',
    },
  },
  {
    id: 'ws5',
    role: 'consultant',
    nodeLabel: 'API Performance Engineering',
    title: 'Shipping API Performance Engineering',
    desc: '20+ JMeter test scripts and load benchmarks built with teams across the US and India for a major e-commerce launch, tracked in Azure DevOps, AppDynamics, and Grafana.',
    tags: ['JMeter', 'Performance', 'Azure DevOps'],
    outcome: {
      id: 'out5',
      metric: '+15%',
      sub: 'API reliability',
      statement: 'API reliability *+15%*',
    },
  },
  {
    id: 'ws6',
    role: 'intern',
    nodeLabel: 'Global Product Delivery & Design',
    title: 'Global Product Delivery & Design — SAP',
    desc: 'Coordinated SAFe delivery with the Chief Product Owner across Germany, the US, and India — managing ARTs, tracking OKRs, and keeping program increments on schedule. Facilitated design thinking and agile upskilling workshops for 50+ cross-functional professionals spanning product, engineering, and business roles across three continents. UX research shaped SAP FlexConnect; assisted with UI design for internal tools.',
    tags: ['SAP', 'SAFe', 'ARTs', 'OKRs', 'Product Management', 'UX Research', 'Design Thinking'],
    outcome: {
      id: 'out6',
      metric: '50+',
      sub: 'professionals upskilled across 3 continents',
      statement: '*50+* professionals upskilled across 3 continents',
    },
  },
];

/* `A *b* c` → `A <em>b</em> c`, escaping everything around the emphasis. */
function outcomeHtml(statement) {
  return statement
    .split('*')
    .map((part, i) => (i % 2 ? `<em>${esc(part)}</em>` : esc(part)))
    .join('');
}

/* The same sentence, plain, for the detail panel. */
function outcomeText(statement) {
  return statement
    .split('*')
    .map((part) => esc(part))
    .join('');
}

/* The graph the impact map draws, read off the workstreams themselves. */
function workConnections(workstreams) {
  const conns = [];
  workstreams.forEach((w) => {
    conns.push({ from: w.role, to: w.id });
    conns.push({ from: w.id, to: w.outcome.id });
  });
  return conns;
}

function roleNodeHtml(role) {
  return `<div class="impact-node role-node r" data-id="${esc(role.id)}" data-type="role">
            <span class="node-label">${esc(role.label)}</span>
            <span class="node-sub">${esc(role.sub)}</span>
          </div>`;
}

function workstreamNodeHtml(ws) {
  return `<div class="impact-node ws-node r" data-id="${esc(ws.id)}" data-type="workstream" data-role="${esc(ws.role)}" data-outcome="${esc(ws.outcome.id)}">
            <span class="node-label">${esc(ws.nodeLabel)}</span>
          </div>`;
}

function outcomeNodeHtml(ws) {
  return `<div class="impact-node outcome-node r" data-id="${esc(ws.outcome.id)}" data-type="outcome">
            <span class="outcome-metric">${esc(ws.outcome.metric)}</span>
            <span class="node-sub">${esc(ws.outcome.sub)}</span>
          </div>`;
}

function caseStudyRowHtml(ws, index, iconHtml) {
  const idx = String(index + 1).padStart(2, '0');
  return `<div class="work-row r">
      <div class="idx">${idx}</div>
      <div>
        <h3>${iconHtml}${esc(ws.title)}</h3>
        <p class="desc">${esc(ws.desc)}</p>
      </div>
      <div class="meta"><span class="outcome">${outcomeHtml(ws.outcome.statement)}</span>${ws.tags.map(esc).join(' · ')}</div>
    </div>`;
}

/*
 * Fill the three map columns and the case-study rows from the data above.
 *
 * innerHTML is safe here: every value is authored in this repo, text goes
 * through esc(), and the row icons come from the page's own templates.
 */
function renderWork() {
  const cols = document.querySelectorAll('.impact-cols .impact-col');
  if (cols.length === 3) {
    const [roleCol, wsCol, outCol] = cols;
    const keepHeader = (col) => col.querySelector('.col-header').outerHTML;
    roleCol.innerHTML = keepHeader(roleCol) + ROLES.map(roleNodeHtml).join('\n');
    wsCol.innerHTML = keepHeader(wsCol) + WORKSTREAMS.map(workstreamNodeHtml).join('\n');
    outCol.innerHTML = keepHeader(outCol) + WORKSTREAMS.map(outcomeNodeHtml).join('\n');
  }

  const body = document.getElementById('caseStudiesBody');
  if (body) {
    const icons = new Map();
    body.querySelectorAll('template.work-icon').forEach((tpl) => {
      icons.set(tpl.dataset.ws, tpl.innerHTML.trim());
    });
    body.innerHTML = WORKSTREAMS.map((ws, i) =>
      caseStudyRowHtml(ws, i, icons.get(ws.id) || '')
    ).join('\n');
  }
}

/* Absent under `node --test`, which only exercises the pure parts above. */
if (typeof document !== 'undefined') {
  renderWork();
}
