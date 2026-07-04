---
title: Blueprints
description: Layout components and markdown element overrides, compatible with runes.
---

# Blueprints

A blueprint is a plain Svelte 5 component that wraps every markdown page: it receives the frontmatter as `metadata` and the rendered content as `children`. Because it is a regular component using `$props()`, it works under `runes: true` — no special layout mechanism.

## Defining a blueprint

```svelte
<!-- src/blueprints/docs.svelte -->
<script>
	let { metadata, children } = $props();
</script>

<svelte:head>
	<title>{metadata.title}</title>
</svelte:head>

<article class="hd-prose mx-auto max-w-3xl">
	{@render children()}
</article>
```

The `article` wrapper matters: the `Toc` component discovers headings with the selector `article h2[id], article h3[id]`, and the `hd-prose` class applies the typography from the theme preset.

Register it in `humandocsMarkdown()`:

```js
humandocsMarkdown({
	blueprints: {
		default: { path: fileURLToPath(new URL('./src/blueprints/docs.svelte', import.meta.url)) }
	}
});
```

## Selecting a blueprint

The `default` blueprint applies to every file. A page can pick another one — or opt out — via frontmatter:

```md
---
title: Changelog
blueprint: changelog
---
```

```md
---
title: Raw page
blueprint: false
---
```

## Element overrides

Export a component named after an HTML tag from the blueprint's module script and every occurrence of that element in the markdown renders through it. This page's `h2` headings — hover one — get their anchor link that way:

```svelte
<!-- src/blueprints/docs.svelte -->
<script module>
	export { default as h2 } from './h2.svelte';
</script>
```

```svelte
<!-- src/blueprints/h2.svelte -->
<script>
	let { id, children, ...rest } = $props();
</script>

<h2 {id} {...rest} class="group">
	{@render children?.()}
	{#if id}
		<a href="#{id}" aria-label="Link to this section">#</a>
	{/if}
</h2>
```

Overrides receive the element's attributes as props (like the `id` added by `rehype-slug`) and its content as `children`.
