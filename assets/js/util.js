/*
 * Shared helpers for the data modules. Loads first — the other scripts are
 * classic scripts sharing one global scope, so this must be the only place
 * `esc` is declared.
 */

/* Static, repo-authored copy goes through here before it lands in innerHTML. */
function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
