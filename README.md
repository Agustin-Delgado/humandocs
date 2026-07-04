# humandocs

A documentation framework for Svelte and SvelteKit — markdown-driven pages, live component demos with source code, and generated API references. Think [fumadocs](https://www.fumadocs.dev/), but for Svelte.

> Status: early development. Nothing is published yet.

## Packages

| Package                                        | Description                                                                                                                                                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@human-kit/markdown`](./packages/markdown)   | A markdown preprocessor for Svelte built on [unified](https://unifiedjs.com/) — Svelte components inside markdown, frontmatter metadata, runes-compatible blueprints (layouts + element overrides), and a pluggable async syntax highlighter. |
| [`@human-kit/humandocs`](./packages/humandocs) | The docs kit — Svelte components (docs shell, sidebar, TOC, live demos, API tables), a Vite plugin for `?highlight` demo sources, a SvelteKit content loader, a shiki dual-theme preset, and the `humandocs extract-api` CLI.                 |

## Monorepo layout

```
packages/markdown    @human-kit/markdown
packages/humandocs   @human-kit/humandocs
apps/docs            documentation site, built with humandocs itself
```

## Development

```bash
pnpm install
pnpm test        # preprocessor test suite
pnpm check       # svelte-check across packages
pnpm dev         # run the docs app
```

## License

[MIT](./LICENSE)
