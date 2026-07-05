# @human-kit/humandocs

## 0.1.3

### Patch Changes

- [#8](https://github.com/Agustin-Delgado/humandocs/pull/8) [`3f27f31`](https://github.com/Agustin-Delgado/humandocs/commit/3f27f316357827581532a862d32693d0479b66d4) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Make the table of contents fully SSR-consistent. Two remaining differences between the server render and the hydrated page are gone:

  - **Component-rendered headings now render in SSR.** Components that produce their own headings (e.g. `ApiReference`'s `api-*` sections) register them through a shared context the docs shell provides; because the content renders before the TOC aside, `Toc` picks them up during SSR instead of only after the client re-scans the DOM.
  - **The active heading no longer flips on hydration.** The scrollspy is now position-based, so at the top of the page the first heading is active — the same state SSR renders — instead of an `IntersectionObserver` band picking a different one on load.

  The TOC also renders from the data outline (metadata + registered headings) in both SSR and client rather than switching to DOM-scanned text on hydration, so heading decorations (anchor links, etc.) no longer make the labels drift.

  `ThemeToggle` no longer flips its icon on hydration: the sun/moon are now chosen by the `.dark` class (set by the anti-FOUC script before paint) via CSS instead of JS state, so the correct icon shows from the first paint.

- [#8](https://github.com/Agustin-Delgado/humandocs/pull/8) [`d86253d`](https://github.com/Agustin-Delgado/humandocs/commit/d86253d9b95ec7180012d39ab439d576e8e26374) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Stop the table of contents from flashing the wrong item. The active heading depends on scroll, which SSR cannot know, so it no longer guesses (previously the first heading), which showed the wrong item for a frame when a page loaded scrolled (e.g. a reload). SSR now marks nothing active and the client sets it — the first heading at the top, or the scrolled section — computed synchronously so the correct item is active from the first client frame.

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
