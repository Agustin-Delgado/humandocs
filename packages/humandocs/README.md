# @human-kit/humandocs

The [humandocs](https://github.com/Agustin-Delgado/humandocs) documentation kit for Svelte and SvelteKit: docs shell components (sidebar, table of contents, header with theme toggle), live component demos with source code, generated API reference tables, a `?highlight` Vite plugin, a SvelteKit content loader and a shiki dual-theme preset.

Requires Tailwind CSS v4 in the consuming app.

## Install

```bash
pnpm add -D @human-kit/humandocs @human-kit/markdown tailwindcss @tailwindcss/vite
```

## Entry points

| Import                             | Contents                                                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `@human-kit/humandocs/components`  | `DocsShell`, `Header`, `Sidebar`, `Toc`, `ThemeToggle`, `Demo`, `ApiReference`, `PropsTable`, `DataAttributesTable` |
| `@human-kit/humandocs/content`     | `createContentLoader` + `NavGroup`/`NavItem`/`DocMeta` types                                                        |
| `@human-kit/humandocs/highlighter` | shiki singleton: `highlight`, `escapeSvelte`, `getHighlighter`                                                      |
| `@human-kit/humandocs/vite`        | `humandocs()` plugin resolving `?highlight` demo-source imports                                                     |
| `@human-kit/humandocs/theme`       | `theme` runtime (dark-mode state) + `THEME_INIT_SCRIPT`                                                             |
| `@human-kit/humandocs/theme.css`   | Tailwind v4 preset: dark variant, `.hd-prose`, shiki dual-theme                                                     |
| `@human-kit/humandocs/ambient`     | Type declarations for `*?highlight` imports                                                                         |

## CLI

```bash
humandocs extract-api --lib packages/ui/src/lib --content docs/src/content
```

Walks a component library with ts-morph (purely syntactic) and writes one `api.json` per documented component, preserving hand-curated descriptions across regenerations.

## Quickstart

See the [getting started guide](https://github.com/Agustin-Delgado/humandocs/blob/main/apps/docs/src/content/getting-started/index.md) — or the [`apps/docs`](https://github.com/Agustin-Delgado/humandocs/tree/main/apps/docs) app, which is built with humandocs itself.

## License

MIT
