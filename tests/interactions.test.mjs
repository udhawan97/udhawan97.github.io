import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContext, runInContext } from 'node:vm';
import { readIndex } from './load.mjs';

const index = readIndex();

function scriptBetween(start, end) {
  const startAt = index.indexOf(start);
  const endAt = index.indexOf(end, startAt);
  assert.notEqual(startAt, -1, `missing script marker: ${start}`);
  assert.notEqual(endAt, -1, `missing script marker: ${end}`);
  return index.slice(startAt, endAt);
}

class FakeClassList {
  #values = new Set();

  add(...names) { names.forEach((name) => this.#values.add(name)); }
  remove(...names) { names.forEach((name) => this.#values.delete(name)); }
  contains(name) { return this.#values.has(name); }
  toggle(name, force) {
    const next = force ?? !this.#values.has(name);
    if (next) this.#values.add(name);
    else this.#values.delete(name);
    return next;
  }
}

class FakeElement {
  constructor(id = '', dataset = {}) {
    this.id = id;
    this.dataset = dataset;
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.innerHTML = '';
    this.focused = false;
    this.hovered = false;
    this.children = new Set();
  }

  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  matches(selector) { return selector === ':hover' ? this.hovered : false; }
  contains(element) { return element === this || this.children.has(element); }
  appendChild(element) { this.children.add(element); }
  focus() { this.focused = true; }
  click() { this.listeners.get('click')?.({ stopPropagation() {} }); }
  keydown(key) {
    const event = { key, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
    this.listeners.get('keydown')?.(event);
    return event;
  }
}

const navScript = scriptBetween(
  '// ── 13b. Nav shrink/expand',
  '// ── 19. Impact map'
);

function loadNav({ fineHover }) {
  const nav = new FakeElement('nav');
  const timers = [];
  const windowListeners = new Map();
  const document = {
    activeElement: null,
    querySelector: (selector) => selector === 'nav' ? nav : null,
  };
  const context = {
    document,
    matchMedia: () => ({ matches: fineHover }),
    setTimeout(callback, delay) {
      const timer = { callback, delay };
      timers.push(timer);
      return timer;
    },
    clearTimeout() {},
    addEventListener(type, listener) { windowListeners.set(type, listener); },
  };
  context.window = context;
  runInContext(navScript, createContext(context));
  return { document, nav, timers, windowListeners };
}

test('coarse or no-hover navigation stays expanded after idle', () => {
  const page = loadNav({ fineHover: false });

  for (const timer of page.timers) timer.callback();

  assert.equal(page.nav.classList.contains('nav-shrunk'), false);
});

test('fine-hover navigation keeps compact idle behavior and expands for keyboard focus', () => {
  const idlePage = loadNav({ fineHover: true });

  idlePage.timers.find((timer) => timer.delay === 2000).callback();
  assert.equal(idlePage.nav.classList.contains('nav-shrunk'), true);

  const page = loadNav({ fineHover: true });
  const firstLink = new FakeElement('firstLink');
  const secondLink = new FakeElement('secondLink');
  page.nav.appendChild(firstLink);
  page.nav.appendChild(secondLink);

  page.document.activeElement = firstLink;
  page.nav.listeners.get('focusin')();
  page.timers.find((timer) => timer.delay === 2000).callback();
  assert.equal(page.nav.classList.contains('nav-shrunk'), false);

  page.document.activeElement = secondLink;
  page.nav.listeners.get('focusout')({ relatedTarget: secondLink });
  assert.equal(page.nav.classList.contains('nav-shrunk'), false);

  page.document.activeElement = null;
  page.nav.listeners.get('focusout')({ relatedTarget: null });
  assert.equal(page.nav.classList.contains('nav-shrunk'), true);

  page.nav.listeners.get('focusin')();
  assert.equal(page.nav.classList.contains('nav-shrunk'), false);

  page.nav.hovered = true;
  page.nav.listeners.get('focusout')({ relatedTarget: null });
  assert.equal(page.nav.classList.contains('nav-shrunk'), false);

  page.nav.hovered = false;
  page.nav.listeners.get('mouseleave')();
  assert.equal(page.nav.classList.contains('nav-shrunk'), true);
});

const disclosureScript = scriptBetween(
  '    function closeDetail(returnFocus = false)',
  '    // Stagger node entrance animations'
);

function loadDisclosure() {
  const first = new FakeElement('ws1', { id: 'ws1', type: 'workstream' });
  const second = new FakeElement('ws2', { id: 'ws2', type: 'workstream' });
  const detailEl = new FakeElement('impactDetail');
  const nodes = [first, second];
  const mapEl = new FakeElement('impactMap');
  mapEl.querySelectorAll = (selector) =>
    selector === '.ws-node' || selector === '.impact-node' ? nodes : [];

  const context = {
    mapEl,
    detailEl,
    activeWs: null,
    activeTrigger: null,
    wsData: {
      ws1: { title: 'First workstream', desc: 'First detail', tags: ['One'], outcome: { statement: '*First* outcome' } },
      ws2: { title: 'Second workstream', desc: 'Second detail', tags: ['Two'], outcome: { statement: '*Second* outcome' } },
    },
    esc: (value) => value,
    outcomeText: (value) => value.replaceAll('*', ''),
    applyHover() {},
    clearHover() {},
  };
  runInContext(disclosureScript, createContext(context));
  return { first, second, detailEl };
}

test('impact disclosure synchronizes triggers, switches workstreams, closes with Escape, and reopens', () => {
  const page = loadDisclosure();

  for (const trigger of [page.first, page.second]) {
    assert.equal(trigger.getAttribute('role'), 'button');
    assert.equal(trigger.getAttribute('tabindex'), '0');
    assert.equal(trigger.getAttribute('aria-controls'), 'impactDetail');
    assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  }
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'true');

  page.first.click();
  assert.equal(page.first.getAttribute('aria-expanded'), 'true');
  assert.equal(page.second.getAttribute('aria-expanded'), 'false');
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'false');
  assert.ok(page.detailEl.classList.contains('open'));
  assert.match(page.detailEl.innerHTML, /First workstream/);

  page.second.click();
  assert.equal(page.first.getAttribute('aria-expanded'), 'false');
  assert.equal(page.second.getAttribute('aria-expanded'), 'true');
  assert.equal(page.first.classList.contains('selected'), false);
  assert.equal(page.second.classList.contains('selected'), true);
  assert.match(page.detailEl.innerHTML, /Second workstream/);

  const escape = page.detailEl.keydown('Escape');
  assert.equal(escape.defaultPrevented, true);
  assert.equal(page.second.getAttribute('aria-expanded'), 'false');
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'true');
  assert.equal(page.detailEl.classList.contains('open'), false);
  assert.equal(page.second.focused, true);

  page.first.click();
  assert.equal(page.first.getAttribute('aria-expanded'), 'true');
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'false');

  const space = page.first.keydown(' ');
  assert.equal(space.defaultPrevented, true);
  assert.equal(page.first.getAttribute('aria-expanded'), 'false');
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'true');
  assert.equal(page.detailEl.classList.contains('open'), false);
  assert.equal(page.first.focused, true);

  const enter = page.first.keydown('Enter');
  assert.equal(enter.defaultPrevented, true);
  assert.equal(page.first.getAttribute('aria-expanded'), 'true');
  assert.equal(page.detailEl.getAttribute('aria-hidden'), 'false');
});
