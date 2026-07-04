---
'@human-kit/humandocs': patch
---

Fix the table of contents dropping component-rendered headings. `Toc` treated the SSR outline (`data.meta.headings`) as authoritative, but the preprocessor runs before components exist, so headings rendered by a component — such as the `api-*` sections `<ApiReference>` generates from its data — were missing from "On this page". The client now always re-scans the DOM after hydration and that complete list wins; the SSR outline is only the pre-hydration fallback.
