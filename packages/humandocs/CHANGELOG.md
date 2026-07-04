# @human-kit/humandocs

## 0.1.2

### Patch Changes

- [#6](https://github.com/Agustin-Delgado/humandocs/pull/6) [`f95d99a`](https://github.com/Agustin-Delgado/humandocs/commit/f95d99a114bc0e3160d3ec095b0e19f7ce2967aa) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix the table of contents dropping component-rendered headings. `Toc` treated the SSR outline (`data.meta.headings`) as authoritative, but the preprocessor runs before components exist, so headings rendered by a component — such as the `api-*` sections `<ApiReference>` generates from its data — were missing from "On this page". The client now always re-scans the DOM after hydration and that complete list wins; the SSR outline is only the pre-hydration fallback.

## 0.1.1

### Patch Changes

- [#4](https://github.com/Agustin-Delgado/humandocs/pull/4) [`9705c07`](https://github.com/Agustin-Delgado/humandocs/commit/9705c07a33ecfbc62242a2a5b868e10070b33d68) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix two SSR/hydration inconsistencies in the docs shell:

  - **Sidebar active state** now renders during SSR. The active check used `base` from `$app/paths`, which is a _relative_ prefix under SvelteKit's default `paths.relative`, so it never matched the absolute `page.url.pathname` server-side and the highlight only appeared after hydration. It now compares the absolute route suffix.
  - **Table of contents** now renders during SSR. `Toc` reads the heading outline from `data.meta.headings` (exposed by `@human-kit/markdown`) by convention — with an explicit `headings` prop on `Toc`/`DocsShell` to override — and falls back to DOM discovery only when no outline is available. The scroll-based active heading is still tracked on the client.

## 0.1.0

### Minor Changes

- [`cd075db`](https://github.com/Agustin-Delgado/humandocs/commit/cd075dbe384d6ef43f5f11376b5009fdf8546170) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Initial release.

  `@human-kit/markdown`: a unified-based markdown preprocessor for Svelte — GFM, frontmatter metadata, Svelte components in prose, runes-compatible blueprints with element overrides, and a pluggable async highlighter.

  `@human-kit/humandocs`: the documentation kit — docs shell components (DocsShell, Sidebar, Toc, Header, ThemeToggle), live demos via the `?highlight` Vite plugin, ApiReference tables, a SvelteKit content loader, a shiki dual-theme highlighter, a Tailwind v4 CSS preset, and the `humandocs extract-api` CLI.
