---
'@human-kit/humandocs': patch
---

Make the table of contents fully SSR-consistent. Two remaining differences between the server render and the hydrated page are gone:

- **Component-rendered headings now render in SSR.** Components that produce their own headings (e.g. `ApiReference`'s `api-*` sections) register them through a shared context the docs shell provides; because the content renders before the TOC aside, `Toc` picks them up during SSR instead of only after the client re-scans the DOM.
- **The active heading no longer flips on hydration.** The scrollspy is now position-based, so at the top of the page the first heading is active — the same state SSR renders — instead of an `IntersectionObserver` band picking a different one on load.

The TOC also renders from the data outline (metadata + registered headings) in both SSR and client rather than switching to DOM-scanned text on hydration, so heading decorations (anchor links, etc.) no longer make the labels drift.
