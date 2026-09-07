# @human-kit/markdown

## 0.3.1

### Patch Changes

- [#12](https://github.com/Agustin-Delgado/humandocs/pull/12) [`5656f41`](https://github.com/Agustin-Delgado/humandocs/commit/5656f41d9e38a3768f9db49ea8a169d82cf0f542) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - `hk-extract-api` gave a part the props of another part. A component folder with a shared `types.ts` holds the props of its root, and a part with no declaration in that file took the first one it found there — so a part that lives in another folder, or that declares its props inline, was documented with the props of the root. The lookup now falls through to the file of the part, which is where its props actually are.

  The CLI also stops running on import, so `runExtractApi` can be called from a test.

## 0.3.0

### Minor Changes

- [#10](https://github.com/Agustin-Delgado/humandocs/pull/10) [`141c327`](https://github.com/Agustin-Delgado/humandocs/commit/141c3274bca110fa5541298f567ba97bde1c52f8) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Ship the build-time docs tooling as part of the package, so a docs site can use the markdown pipeline without depending on the UI kit:

  - `@human-kit/markdown/shiki`: dual-theme (github-light/github-dark) code-block highlighter for the `highlight` option, plus `getHighlighter` and `escapeSvelte` re-export.
  - `@human-kit/markdown/vite`: `demoHighlight()` plugin resolving `?highlight` imports to `{ code, html }` at build time.
  - `hk-extract-api` bin: the component API extractor (props + data attributes → `api.json`), previously only available as `humandocs extract-api`.

## 0.2.0

### Minor Changes

- [#4](https://github.com/Agustin-Delgado/humandocs/pull/4) [`9705c07`](https://github.com/Agustin-Delgado/humandocs/commit/9705c07a33ecfbc62242a2a5b868e10070b33d68) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Export the page's `h2`/`h3` heading outline as `metadata.headings` (id, text, depth) when the headings have ids. A table of contents can render this during SSR instead of only discovering headings from the DOM after hydration.

## 0.1.1

### Patch Changes

- [#2](https://github.com/Agustin-Delgado/humandocs/pull/2) [`cd68ac6`](https://github.com/Agustin-Delgado/humandocs/commit/cd68ac65bbe7632450f8f845035db3e383076155) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Don't wrap block-level components in `<p>`. A component written on its own line (`<Demo />`, `<ApiReference />`) was paragraph-wrapped by remark; when it renders a block element the result is `<p><div></p>`, which the browser reparents — breaking Svelte hydration (`HierarchyRequestError`) and leaving the page unstyled after hydration. Paragraphs whose only content is raw component/HTML nodes are now unwrapped, while inline usage (`text <Component /> text`) keeps its paragraph.

## 0.1.0

### Minor Changes

- [`cd075db`](https://github.com/Agustin-Delgado/humandocs/commit/cd075dbe384d6ef43f5f11376b5009fdf8546170) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Initial release.

  `@human-kit/markdown`: a unified-based markdown preprocessor for Svelte — GFM, frontmatter metadata, Svelte components in prose, runes-compatible blueprints with element overrides, and a pluggable async highlighter.

  `@human-kit/humandocs`: the documentation kit — docs shell components (DocsShell, Sidebar, Toc, Header, ThemeToggle), live demos via the `?highlight` Vite plugin, ApiReference tables, a SvelteKit content loader, a shiki dual-theme highlighter, a Tailwind v4 CSS preset, and the `humandocs extract-api` CLI.
