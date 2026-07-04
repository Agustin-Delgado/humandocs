---
title: Markdown
description: Syntax reference and limitations of the @human-kit/markdown preprocessor.
---

# Markdown

`@human-kit/markdown` is a markdown preprocessor for Svelte built on [unified](https://unifiedjs.com/). It compiles `.md` files into Svelte components: GitHub Flavored Markdown, YAML frontmatter, Svelte components inside prose, and build-time syntax highlighting.

## Frontmatter

The YAML block at the top of the file is exported as `metadata` from the compiled component's module script, and is passed to the active [blueprint](/docs/blueprints):

```md
---
title: Button
description: A pressable thing.
---
```

Importing the page gives you both the component and its metadata:

```ts
import Page, { metadata } from './content/button/index.md';
```

## Scripts

A markdown file can declare one instance `<script>` and one `<script module>`, anywhere in the file. They are hoisted out before the markdown is parsed:

```md
<script>
	import Demo from './demos/hero.svelte';
</script>

# My page

<Demo />
```

## Components in markdown

Svelte components pass through the pipeline untouched, with live expressions intact. Two things to know, both consequences of CommonMark's HTML-block rules:

- Content **between** a component's open and close tags is processed as markdown when separated by blank lines, and kept raw when the block is tight.
- Keep a component's open tag on contiguous lines — a blank line inside the attribute list splits the block.

```md
<Callout kind="warning">

This **is** processed as markdown.

</Callout>
```

## Code blocks

Fenced code blocks go through the `highlight` hook configured in `humandocsMarkdown()`. With the shiki highlighter from `@human-kit/humandocs/highlighter` you get dual light/dark themes with zero client-side JavaScript. Fences containing Svelte syntax — braces, `<script>` tags, `{#if}` blocks — are safe: the preprocessor escapes them.

## Limitations

- **No Svelte expressions in prose.** `{count}` or `{#each ...}` written directly in markdown text renders as literal text. Expressions work inside components and raw HTML, which covers demos and interactive content.
- One instance script, one module script and one style block per file; a literal `</script>` inside a string in a script body ends the block early.
- rehype plugins that re-parse raw HTML (like `rehype-raw`) are unsupported — they would mangle component tags. Plugins that operate on element nodes (`rehype-slug`, `rehype-autolink-headings`) work.

## Options

| Option          | Type                                | Description                                             |
| --------------- | ----------------------------------- | ------------------------------------------------------- |
| `extensions`    | `string[]`                          | File extensions to transform. Default `['.md']`.        |
| `blueprints`    | `Record<string, { path: string }>`  | Layout components; see [Blueprints](/docs/blueprints).  |
| `remarkPlugins` | `PluggableList`                     | Extra remark plugins, run on mdast.                     |
| `rehypePlugins` | `PluggableList`                     | Extra rehype plugins, run on hast.                      |
| `gfm`           | `boolean`                           | GitHub Flavored Markdown. Default `true`.               |
| `highlight`     | `(code, lang, meta) => html`        | Async code-block highlighter; return Svelte-safe HTML.  |
