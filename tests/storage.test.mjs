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

const prePaintMarker = index.indexOf('// Set theme before paint');
const headScriptStart = index.lastIndexOf('<script>', prePaintMarker);
const headScriptEnd = index.indexOf('</script>', prePaintMarker);
const headThemeScript = index.slice(headScriptStart + '<script>'.length, headScriptEnd);

assert.ok(prePaintMarker !== -1 && headScriptStart !== -1 && headScriptEnd !== -1,
  'missing pre-paint theme script');

const themeScript = scriptBetween(
  '// ── 1. Theme toggle',
  '// ── 2. Scroll progress bar'
);
const revealScript = scriptBetween(
  '// ── 7. Scroll reveal + count-up',
  '// ── 8–11. Enhanced interactions'
);
const resumeScript = scriptBetween(
  '// ── 13. Nav resume dropdown',
  '// ── 13b. Nav shrink/expand'
);

class FakeClassList {
  #values = new Set();

  add(...names) {
    names.forEach((name) => this.#values.add(name));
  }

  remove(...names) {
    names.forEach((name) => this.#values.delete(name));
  }

  toggle(name, force) {
    const next = force ?? !this.#values.has(name);
    if (next) this.#values.add(name);
    else this.#values.delete(name);
    return next;
  }

  contains(name) {
    return this.#values.has(name);
  }
}

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.style = {};
    this.inert = false;
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.children = new Map();
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  querySelector(selector) {
    return this.children.get(selector) ?? null;
  }

  getBoundingClientRect() {
    return { left: 0, width: 40, bottom: 40 };
  }

  click() {
    this.listeners.get('click')?.({ stopPropagation() {} });
  }
}

function storageFor(mode, initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) {
      if (mode === 'get-denied') throw new DOMException('blocked', 'SecurityError');
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (mode === 'set-denied') throw new DOMException('blocked', 'SecurityError');
      values.set(key, String(value));
    },
    value(key) {
      return values.get(key) ?? null;
    },
  };
}

function loadPageScripts(mode, initial) {
  const iconMoon = new FakeElement('icon-moon');
  const iconSun = new FakeElement('icon-sun');
  const themeMeta = new FakeElement('theme-color-meta');
  const themeToggle = new FakeElement('theme-toggle');
  const themeTip = new FakeElement('theme-tip');
  const resumeDropdown = new FakeElement('resumeDropdown');
  const resumeBtn = new FakeElement('resumeBtn');
  const resumeMenu = new FakeElement();
  const resumeInner = new FakeElement();

  resumeDropdown.children.set('.resume-dropdown', resumeMenu);
  resumeDropdown.children.set('.resume-dropdown-inner', resumeInner);

  const elements = new Map([
    ['icon-moon', iconMoon],
    ['icon-sun', iconSun],
    ['theme-color-meta', themeMeta],
    ['theme-toggle', themeToggle],
    ['theme-tip', themeTip],
    ['resumeDropdown', resumeDropdown],
    ['resumeBtn', resumeBtn],
  ]);
  const storage = storageFor(mode, initial);
  const observerInstances = [];
  const documentListeners = new Map();
  const windowListeners = new Map();
  const timeouts = [];

  class FakeIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      observerInstances.push(this);
    }
    observe() {}
    unobserve() {}
  }

  const document = {
    documentElement: { dataset: {} },
    activeElement: null,
    getElementById(id) {
      return elements.get(id) ?? null;
    },
    querySelectorAll() {
      return [];
    },
    addEventListener(type, listener) {
      documentListeners.set(type, listener);
    },
  };

  const context = {
    DOMException,
    document,
    localStorage: storage,
    IntersectionObserver: FakeIntersectionObserver,
    performance: { now: () => 0 },
    requestAnimationFrame() {},
    matchMedia: () => ({ matches: false }),
    innerWidth: 1280,
    setTimeout(callback) {
      timeouts.push(callback);
      return timeouts.length;
    },
    clearTimeout() {},
    addEventListener(type, listener) {
      windowListeners.set(type, listener);
    },
  };
  context.window = context;

  const vmContext = createContext(context);
  [headThemeScript, themeScript, revealScript, resumeScript].forEach((source) => {
    runInContext(source, vmContext);
  });

  return {
    document,
    storage,
    iconMoon,
    iconSun,
    themeMeta,
    themeToggle,
    themeTip,
    resumeBtn,
    observerInstances,
    windowListeners,
    timeouts,
  };
}

test('normal storage restores and persists theme state while later controllers bind', () => {
  const page = loadPageScripts('normal', { theme: 'light', 'theme-tip-shown': '1' });

  assert.equal(page.document.documentElement.dataset.theme, 'light');
  assert.equal(page.themeToggle.getAttribute('aria-label'), 'Switch to dark mode');
  assert.equal(page.windowListeners.has('scroll'), false,
    'persisted theme-tip flag should skip the hint scroll flow');
  assert.ok(page.resumeBtn.listeners.has('click'));
  assert.equal(page.observerInstances.length, 1, 'reveal observer should initialize');

  page.themeToggle.click();

  assert.equal(page.document.documentElement.dataset.theme, 'dark');
  assert.equal(page.storage.value('theme'), 'dark');
  assert.equal(page.themeToggle.getAttribute('aria-label'), 'Switch to light mode');
  assert.equal(page.themeMeta.getAttribute('content'), '#000000');
});

test('normal storage persists the theme-tip flag when the first-scroll hint appears', () => {
  const page = loadPageScripts('normal');

  assert.ok(page.windowListeners.has('scroll'));
  page.windowListeners.get('scroll')();
  page.timeouts.shift()();

  assert.equal(page.storage.value('theme-tip-shown'), '1');
});

test('denied storage reads fail open and later controllers and reveals still bind', () => {
  const page = loadPageScripts('get-denied');

  assert.equal(page.document.documentElement.dataset.theme, 'dark');
  assert.equal(page.themeToggle.getAttribute('aria-label'), 'Switch to light mode');
  assert.ok(page.windowListeners.has('scroll'), 'theme hint should retain its in-memory flow');
  assert.ok(page.resumeBtn.listeners.has('click'), 'later resume controller should bind');
  assert.equal(page.observerInstances.length, 1, 'later reveal observer should initialize');
});

test('denied storage writes do not interrupt in-memory theme and icon synchronization', () => {
  const page = loadPageScripts('set-denied');

  assert.doesNotThrow(() => page.themeToggle.click());
  assert.equal(page.document.documentElement.dataset.theme, 'light');
  assert.equal(page.themeToggle.getAttribute('aria-label'), 'Switch to dark mode');
  assert.equal(page.themeToggle.getAttribute('title'), 'Switch to dark mode');
  assert.equal(page.iconMoon.style.display, '');
  assert.equal(page.iconSun.style.display, 'none');
  assert.equal(page.themeMeta.getAttribute('content'), '#f5f5f7');
  assert.ok(page.resumeBtn.listeners.has('click'), 'later resume controller should remain bound');

  page.windowListeners.get('scroll')();
  page.timeouts.shift()();

  assert.equal(page.themeTip.getAttribute('aria-hidden'), 'false');
  assert.ok(page.themeTip.classList.contains('tip-show'));
});
