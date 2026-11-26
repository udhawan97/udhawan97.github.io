# Engineering Log

## 2026-09-14 — maintenance review

- **Repository evaluated:** `udhawan97/udhawan97.github.io`.
- **Area inspected:** repository README and file contract, zero-dependency Node test layout, recent project-card and responsive-visual fixes, and the shared classic-script structure under `assets/js/`.
- **Why product code was not merged:** the reviewed codebase did not expose an evidence-backed dead branch, redundant guard, or similarly bounded defect; recent changes focused on project artwork and responsive scene layout, so another visual or code edit without a reproduced issue would be cosmetic churn.
- **Validation/check status:** the repository documents `node --test` as its zero-install test command and has no pull-request workflow under `.github`; this fallback changes only this Markdown log and was reviewed for truthfulness, privacy, duplication, and scope.
- **Engineering takeaway:** prefer the next product-code cleanup around the shared `util.js` and project-data seams only when an existing Node test or reproduced page behavior demonstrates a concrete invariant to harden.

## 2026-09-21 — maintenance review

- **Repository evaluated:** `udhawan97/udhawan97.github.io` on `main` at `4343122b6f8be01e993c96f278694189a74646ff`.
- **Area inspected:** current README/file contract, the three classic scripts under `assets/js/`, existing zero-dependency test guidance, and the latest Pages deployment status.
- **Why product code was not merged here:** the README matches the current three-script layout and no evidence-backed product defect or stale setup instruction surfaced in this bounded review, so a speculative code or visual edit would be churn.
- **Validation/check status:** the current default-branch Pages deployment is successful; this fallback changes only this Markdown maintenance record and does not alter site code, dependencies, configuration, or deployment behavior.
- **Engineering takeaway:** keep product edits tied to a reproduced page/test invariant; use documentation maintenance only when it records concrete repository evidence rather than inventing cleanup work.

## 2026-11-25 — show the maintenance practice

- **User problem:** the portfolio showed products and client outcomes but did not explain how scheduled AI work supports ongoing maintenance or where the owner remains responsible.
- **Change:** added a native-disclosure workflow section, a dated Nimanto release example, direct learning-library resources, a professional README illustration, and an indigo/paper visual layer. Client claims, product artwork, shared data/rendering scripts, and resume files are preserved.
- **Verification:** 89 Node contracts pass. Supplemental WebKit checks cover 320/390/768/1440px layouts, keyboard disclosure open/close and consecutive-role exclusivity, theme persistence, the existing impact map, resume download, reduced motion, and the new section without JavaScript. Fourteen computed-color checks verify default, hover, open, selection, and download-icon contrast in both themes. Actual Safari local navigation, disclosures, theme persistence, and the resume menu were checked separately. Six new public links return HTTP 200; local references, unique IDs, SVG XML, and whitespace checks pass. This does not establish VoiceOver conformance or native Safari keyboard acceptance.
- **Process lesson:** a positional mobile selector hid the newly inserted Practice link. It now targets the intended Products link by destination, and a 320px browser check verifies Practice navigation. The palette review also exposed inherited foreground colors on accent-filled controls; a theme-aware foreground keeps those states readable. Future navigation and theme edits should check visible destinations and interactive states, not only page overflow and the default palette.
- **Delivery:** source integration and the existing `main:/` Pages publication require exact-candidate checks and public readback in the linked PR. No hosting-source, automation, or security setting changes are part of this work.
- **Next:** maintain dated examples through public source/release evidence; preserve the separation between independent AI-assisted work and client outcomes.
