# Personal Website — Editing Guide & Style Manual

Everything lives in one file: `index.html`. No frameworks, no build step. Open it in any text editor (VS Code recommended), save, refresh the browser.

## Folder layout

```
website/
├── index.html                              ← the entire site (HTML + CSS + JS)
├── assets/
│   └── headshot.jpg                        ← ADD YOUR PHOTO HERE (square crop, ≥440×440px)
├── Umang_Dhawan_Resume_AI_Consultant.pdf   ← resume served by the Download buttons
└── EDITING_GUIDE.md                        ← this file
```

## Common updates

### Add your headshot
Save your photo as `assets/headshot.jpg`. Until it exists, the site shows a "UD" initials circle automatically (the `onerror` fallback in the hero section).

### Update the resume
Replace `Umang_Dhawan_Resume_AI_Consultant.pdf` with the new PDF, keeping the same filename. If you rename it, update the two `href` values in the `#resume` section and the hero's "Download resume" button.

### Add a certification or quick fact
Search for `Quick facts` in `index.html` — each `<li>` inside the `.fact-card` is one row:
```html
<li><b>Certs:</b> AWS CP · Azure Fundamentals · ...</li>
```

### Add a new role
Copy a whole `<div class="job"> ... </div>` block in the `#experience` section and paste it at the top of the section (newest first). Edit title, org, dates, and bullets.

### Add a case study / project
Copy a `<div class="card"> ... </div>` block in the `#projects` section. Each card has an emoji icon, title, 2–3 sentence description, and `<span>` tags. Keep descriptions outcome-focused (what changed, by how much).

### GitHub section
The contribution graph is an image from ghchart.rshah.org — no API key, auto-updates daily:
```html
<img src="https://ghchart.rshah.org/2e75b6/udhawan97" ...>
```
- `2e75b6` is the brand-blue hex (no `#`). Change it to re-color the graph.
- To show private-repo activity in the graph: GitHub → Settings → Profile → check **"Include private contributions on my profile."**
- When you publish public repos, add cards for them in `#projects` linking to the repo URL.
- Alternative library if you want streaks/stats: `https://github-readme-stats.vercel.app/api?username=udhawan97`.

## Style guide (brand palette)

All colors are CSS variables at the top of `<style>` in `index.html`. Change once, applies everywhere:

| Variable | Value | Used for |
|---|---|---|
| `--bg` | `#f5f5f7` | page background (Apple light gray) |
| `--bg-2` | `#ffffff` | cards, marquee strip |
| `--ink` | `#1d1d1f` | headlines, body text, dark GitHub panel |
| `--ink-2` | `#515154` | secondary text |
| `--line` | `#d9d9de` | hairline borders |
| `--blue` | `#0066d6` | primary accent, gradient start, graph color |
| `--blue-bright` | `#2997ff` | gradient end, links on dark |

The resume uses the same family: navy `#1B3A5C` headings, blue `#2E75B6` rules/links (set in `make_resume.js` as `NAVY` / `BLUE`).

**Motion (all editable):**
- Scroll reveals: `.r` class (blur + rise). Stagger with `.d1/.d2/.d3`. Disable by removing `class="r"`. Respects `prefers-reduced-motion` automatically.
- Count-up stats: numbers animate from the `data-count` attribute on each stat. Change the number there.
- Skills marquee: edit the `<span>` items inside `#mq`; speed is `animation: slide 36s` (higher = slower). Pauses on hover.
- Scroll progress bar: the `#progress` div; gradient set in its CSS rule.
- Hero gradient headline: `.grad` class; underline-on-hover in footer: `h2.big a::after`.

**Typography:** native Apple stack (`-apple-system / SF Pro`) with tight letter-spacing (`-.035em` on the H1) and `clamp()` fluid sizing — no webfonts, instant load. To swap in a Google Font, add the `<link>` in `<head>` and change `font-family` on `body`.

**Updating stats:** the four cards in the `.stats` grid — change `data-count` and the label text. The "Selected Work" rows are `.work-row` blocks: number, title + description, and a right-hand `meta` column with the headline outcome.

## Updating the resume source

The resume is generated from `make_resume.js` (in the same delivery folder) using the `docx` npm package:
```bash
npm install docx
node make_resume.js          # → Umang_Dhawan_Resume_AI_Consultant.docx
```
Edit the bullet text in the script (or just edit the .docx in Word), export to PDF, and drop it into the website folder.

## Deployment

### Option A — GitHub Pages (free, recommended)
1. Create a repo named `udhawan97.github.io` (public).
2. Put the contents of `website/` at the repo root (index.html must be at root).
3. Push. Site is live at `https://udhawan97.github.io` within a minute or two.
```bash
cd website
git init && git add . && git commit -m "Personal site"
git remote add origin https://github.com/udhawan97/udhawan97.github.io.git
git branch -M main && git push -u origin main
```
Bonus: a public site repo also puts commits on your contribution graph.

### Option B — Custom domain
Buy a domain (Namecheap/Cloudflare, ~$10/yr). In the GitHub Pages repo: Settings → Pages → Custom domain → enter it, then add the DNS records GitHub shows (CNAME for `www`, A records for apex). Enable "Enforce HTTPS."

### Option C — Netlify / Vercel
Drag the `website/` folder onto app.netlify.com — instant deploy, free tier, custom domains supported.

## Testing locally
Just double-click `index.html`, or run `python3 -m http.server` in the folder and open http://localhost:8000 (needed if the browser blocks the ghchart image on `file://`).
