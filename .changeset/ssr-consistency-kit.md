---
'@human-kit/humandocs': patch
---

Fix two SSR/hydration inconsistencies in the docs shell:

- **Sidebar active state** now renders during SSR. The active check used `base` from `$app/paths`, which is a _relative_ prefix under SvelteKit's default `paths.relative`, so it never matched the absolute `page.url.pathname` server-side and the highlight only appeared after hydration. It now compares the absolute route suffix.
- **Table of contents** now renders during SSR. `Toc` reads the heading outline from `data.meta.headings` (exposed by `@human-kit/markdown`) by convention — with an explicit `headings` prop on `Toc`/`DocsShell` to override — and falls back to DOM discovery only when no outline is available. The scroll-based active heading is still tracked on the client.
