---
'@human-kit/markdown': minor
---

Export the page's `h2`/`h3` heading outline as `metadata.headings` (id, text, depth) when the headings have ids. A table of contents can render this during SSR instead of only discovering headings from the DOM after hydration.
