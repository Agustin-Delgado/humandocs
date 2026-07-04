# @human-kit/markdown

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
