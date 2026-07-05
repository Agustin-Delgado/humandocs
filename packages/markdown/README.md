# @human-kit/markdown

A markdown preprocessor for Svelte built on [unified](https://unifiedjs.com/): GitHub Flavored Markdown, YAML frontmatter exported as `metadata`, Svelte components inside prose, runes-compatible blueprints (layouts + element overrides), and a pluggable async syntax highlighter.

Part of [humandocs](https://github.com/Agustin-Delgado/humandocs).

## Install

```bash
pnpm add -D @human-kit/markdown
```

## Usage

```js
// svelte.config.js
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { humandocsMarkdown } from '@human-kit/markdown';

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		humandocsMarkdown({
			blueprints: {
				default: {
					path: fileURLToPath(new URL('./src/blueprints/docs.svelte', import.meta.url))
				}
			}
		})
	],
	compilerOptions: { runes: true }
};
```

A blueprint is a plain Svelte 5 component — no special layout mechanism, so it works under `runes: true` (where mdsvex layouts break):

```svelte
<script>
	let { metadata, children } = $props();
</script>

<article>{@render children()}</article>
```

Export a component named after an HTML tag from the blueprint's `<script module>` and every occurrence of that element renders through it:

```svelte
<script module>
	export { default as h2 } from './h2.svelte';
</script>
```

## Options

| Option          | Type                               | Default   | Description                                                                                                                |
| --------------- | ---------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `extensions`    | `string[]`                         | `['.md']` | File extensions to transform.                                                                                              |
| `blueprints`    | `Record<string, { path: string }>` | `{}`      | Layouts; select per file with `blueprint:` frontmatter, opt out with `blueprint: false`.                                   |
| `remarkPlugins` | `PluggableList`                    | `[]`      | Extra remark plugins.                                                                                                      |
| `rehypePlugins` | `PluggableList`                    | `[]`      | Extra rehype plugins (e.g. `rehype-slug`).                                                                                 |
| `gfm`           | `boolean`                          | `true`    | GitHub Flavored Markdown.                                                                                                  |
| `highlight`     | `(code, lang, meta) => html`       | —         | Async code-block highlighter. Return Svelte-safe HTML (`escapeSvelte` helps) or `undefined` for the default `<pre><code>`. |

## Shiki highlighter (`@human-kit/markdown/shiki`)

A ready-made dual-theme (github-light/github-dark) code-block highlighter for the `highlight` option, emitting CSS variables so the consumer's `.dark` class switches themes with zero client JS:

```js
// svelte.config.js
import { humandocsMarkdown } from '@human-kit/markdown';
import { highlight } from '@human-kit/markdown/shiki';

humandocsMarkdown({ highlight });
```

```css
.shiki, .shiki span { color: var(--shiki-light); background-color: var(--shiki-light-bg); }
.dark .shiki, .dark .shiki span { color: var(--shiki-dark); background-color: var(--shiki-dark-bg); }
```

## Vite plugin (`@human-kit/markdown/vite`)

Resolves `./demo.svelte?highlight` imports to `{ code, html }` — the raw source plus its shiki-highlighted HTML, generated at build time:

```js
// vite.config.js
import { demoHighlight } from '@human-kit/markdown/vite';

export default { plugins: [demoHighlight(), sveltekit()] };
```

```svelte
<script>
	import demo from './demo.svelte?highlight';
</script>
```

Ambient type for the import, in `app.d.ts`:

```ts
declare module '*.svelte?highlight' {
	const source: { code: string; html: string };
	export default source;
}
```

## API extractor CLI (`hk-extract-api`)

Extracts component API data (props + data attributes) from a Svelte component library into `<content>/<component>/api.json`, purely syntactically (ts-morph, no type checker). Only components with an existing folder under the content dir are processed; hand-curated `description` fields in an existing api.json are preserved.

```bash
hk-extract-api --lib packages/ui/src/lib --content docs/src/content [component…]
```

## Notes

- Curly braces and backticks in prose are entity-escaped so Svelte never parses them; expressions only run inside components/raw HTML.
- One instance `<script>`, one `<script module>` and one `<style>` per file, hoisted out of the markdown.
- Don't add `rehype-raw` — raw component tags must pass through unparsed.

## License

MIT
