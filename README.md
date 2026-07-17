# 👋 Hey, I'm Umang

**Senior Consultant @ EY Studio+ · Chicago** 🌆

This repo powers my corner of the internet → **[udhawan97.github.io](https://udhawan97.github.io)**

---

## 🧙‍♂️ Who am I?

I help Fortune 100 companies turn complicated technology programs into things that actually ship. By day, I'm a quality engineer keeping four cloud products honest — deployments, feature validation, and the occasional 2am on-call adventure. By night, I'm poking at AI, automation, and whatever else looks interesting.

```python
class Umang:
    def __init__(self):
        self.role = "Senior Consultant @ EY Studio+"
        self.location = "Chicago, IL"
        self.education = ["M.S. Info Systems (Kelley)", "B.S. Informatics (IU)"]
        self.currently = "putting AI to work past the pilot phase"
        self.fuel = "curiosity (and probably too much chai)"

    def superpower(self):
        return "Having the ability to adapt to new platforms and translating 'the build is broken' into language executives act on"
```

## 📊 Numbers I'm proud of

| Metric | Story |
|---|---|
| 🚀 **100+** | restaurant locations launched on a platform I quality-led |
| 📉 **20%** | fewer deployment incidents after I got my hands on release safety |
| ⏱️ **15%** | faster mean time to resolution, thanks to an observability framework built from scratch |
| 🏆 **3×** | Bravo Awards (plus a Rookie of the Year nomination among 100+ peers) |
| ☕ **∞** | cups consumed while writing test scripts |

## 🛠️ Toolbox

`Generative AI` `Python` `SQL` `AWS` `Azure` `JMeter` `Appium` `Grafana` `CI/CD` `SAFe` `Figma` ...and a healthy distrust of any release that "should just work"

## 🌱 Right now I'm...

- Going deep on **AI and cloud** — less hype, more "how do large orgs actually use this"
- Collecting certificates like infinity stones 💎
- Building small experiments that will (eventually 😅) land in public repos here

## 📫 Say hi

[Website](https://udhawan97.github.io) · [LinkedIn](https://www.linkedin.com/in/umangdhawan97) · [Email](mailto:umangdhawan97@gmail.com)

---

### 🗂️ What's in this repo

```
├── index.html                      ← the whole site (hand-coded, zero frameworks 💪)
├── assets/js/work.js               ← roles, workstreams & outcomes (impact map + case studies)
├── assets/js/projects.js           ← the "Featured builds" cards: data + renderer
├── assets/js/util.js               ← the esc() the two share (loads first)
├── assets/headshot.jpg             ← my face
├── tests/                          ← node --test, zero dependencies
├── Umang_Dhawan_Resume_Formal.pdf  ← the serious one (ATS-friendly)
└── Umang_Dhawan_Resume_Modern.pdf  ← the pretty one (charts! donuts! 📊🍩)
```

The three scripts in `assets/js/` are plain classic scripts sharing one global
scope — no modules, so `index.html` still opens straight from the filesystem.
They load before the main script, which expects their markup to already be in
the DOM. `util.js` goes first: it's the only place `esc()` may be declared.

### 🧪 Tests

```bash
node --test          # no install, no dependencies, no build
```

### ➕ Adding a project card

The four project cards render from one place, so a new one is two edits:

1. Add an entry to `PROJECTS` in `assets/js/projects.js` (name, copy, tags, links, status pill).
2. Add its bespoke visual as `<template class="ghp-scene" data-project="your-id">` in the `.ghp-grid` in `index.html`.

### ➕ Adding a workstream

The impact map, its detail panel, and the case-study rows all read the same
entries, so a new workstream is also two edits:

1. Add an entry to `WORKSTREAMS` in `assets/js/work.js` (role, title, copy, tags, outcome).
   The `*stars*` in an outcome mark what the case-study row emphasises.
2. Add its row icon as `<template class="work-icon" data-ws="your-id">` in `#caseStudiesBody`.

The role and outcome links come from the entry itself — there's no separate
connection list to update.

In both cases the tests will tell you if you miss the template, point an icon at
a file that isn't there, or reference a role that doesn't exist.

*Designed & hand-coded with AI assistance. No templates were harmed in the making of this site.*
