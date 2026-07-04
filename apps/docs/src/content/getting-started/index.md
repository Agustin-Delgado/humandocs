---
title: Getting started
description: Install humandocs and wire it into a SvelteKit app.
---

# Getting started

humandocs turns a folder of markdown files into a documentation site: shell components (sidebar, table of contents, theme toggle), live component demos with their source code, and generated API reference tables.

## Install

```bash
pnpm add -D @human-kit/humandocs @human-kit/markdown rehype-slug
```

Tailwind CSS v4 is required — the components are styled with utility classes:

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

## Configure the preprocessor

Register `.md` as a compilable extension and add the preprocessor. The `highlight` export wires shiki with dual light/dark themes:

```js
// svelte.config.js
import { fileURLToPath } from 'node:url';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { humandocsMarkdown } from '@human-kit/markdown';
import { highlight } from '@human-kit/humandocs/highlighter';
import rehypeSlug from 'rehype-slug';

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		humandocsMarkdown({
			blueprints: {
				default: {
					path: fileURLToPath(new URL('./src/blueprints/docs.svelte', import.meta.url))
				}
			},
			rehypePlugins: [rehypeSlug],
			highlight
		})
	],
	compilerOptions: { runes: true }
};
```

## Configure Vite

The `humandocs()` plugin resolves `?highlight` imports for [live demos](/docs/components):

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { humandocs } from '@human-kit/humandocs/vite';

export default defineConfig({
	plugins: [humandocs(), tailwindcss(), sveltekit()]
});
```

## Styles and theme

Import the theme preset after Tailwind in your `app.css`:

```css
@import 'tailwindcss';
@import '@human-kit/humandocs/theme.css';
```

Paste the anti-FOUC snippet into the `<head>` of `src/app.html` so the persisted theme applies before styles load:

```html
<script>
	const theme = localStorage.getItem('theme');
	if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
		document.documentElement.classList.add('dark');
	}
</script>
```

The same snippet is exported as `THEME_INIT_SCRIPT` from `@human-kit/humandocs/theme`.

## Add the routes

A layout with the docs shell, and a catch-all route that resolves slugs to markdown files:

```svelte
<!-- src/routes/docs/+layout.svelte -->
<script>
	import { DocsShell } from '@human-kit/humandocs/components';
	import { nav } from '$lib/nav.js';

	let { children } = $props();
</script>

<DocsShell {nav} title="my-lib" githubUrl="https://github.com/you/my-lib">
	{@render children()}
</DocsShell>
```

```ts
// src/routes/docs/[...slug]/+page.ts
import { error } from '@sveltejs/kit';
import { createContentLoader } from '@human-kit/humandocs/content';

const loadContent = createContentLoader(import.meta.glob('/src/content/**/*.md'));

export const load = async ({ params }) => {
	const page = await loadContent(params.slug);
	if (!page) error(404, `Not found: ${params.slug}`);
	return page;
};
```

```svelte
<!-- src/routes/docs/[...slug]/+page.svelte -->
<script>
	let { data } = $props();
</script>

<data.content />
```

## Write content

Every folder under `src/content/` with an `index.md` becomes a page:

```md
---
title: Button
description: A pressable thing.
---

# Button

Markdown with **Svelte components** inside.
```

Head to [Markdown](/docs/markdown) for the syntax reference and [Blueprints](/docs/blueprints) for layouts.
