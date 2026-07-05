---
'@human-kit/markdown': minor
---

Ship the build-time docs tooling as part of the package, so a docs site can use the markdown pipeline without depending on the UI kit:

- `@human-kit/markdown/shiki`: dual-theme (github-light/github-dark) code-block highlighter for the `highlight` option, plus `getHighlighter` and `escapeSvelte` re-export.
- `@human-kit/markdown/vite`: `demoHighlight()` plugin resolving `?highlight` imports to `{ code, html }` at build time.
- `hk-extract-api` bin: the component API extractor (props + data attributes → `api.json`), previously only available as `humandocs extract-api`.
