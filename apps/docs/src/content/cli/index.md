---
title: CLI
description: Generate API reference JSON from your component library's TypeScript.
---

# CLI

The `humandocs extract-api` command walks a Svelte component library with [ts-morph](https://ts-morph.com/) — purely syntactically, no type checker — and writes one `api.json` per documented component, ready for the `ApiReference` component.

```bash
humandocs extract-api --lib packages/ui/src/lib --content docs/src/content
```

## Flags

| Flag           | Required | Description                                                                 |
| -------------- | -------- | --------------------------------------------------------------------------- |
| `--lib`        | yes      | Root of the component library source (one folder per component).            |
| `--content`    | yes      | Docs content root; every subfolder with a matching lib component is processed and receives an `api.json`. |
| `--components` | no       | Comma-separated subset to regenerate.                                        |

## Conventions

The extractor understands a component library laid out as `lib/<name>/`:

- **Parts** come from `index.parts.ts` (`export { default as Root } from './root/...svelte'`); a lone `.svelte` file becomes a single `Root` part.
- **Props** come from `<Component><Part>Props` type aliases or interfaces in `types.ts` or the part's `<script lang="ts">`. Variant types (`XRootSingleProps`) are merged.
- **Wrappers** — `ComponentProps<typeof X>` intersections and `Omit<...>` exclusions — are followed into the wrapped component, including aliased and namespaced imports.
- **Defaults** are read from the `$props()` destructuring (unwrapping `$bindable(...)`), with JSDoc `@default` as fallback.
- **Descriptions** come from JSDoc. On regeneration, non-empty descriptions already present in `api.json` are preserved when extraction yields nothing — so hand-curated docs survive.
- **Data attributes** are seeded from `data-*` usage in each part's markup.

## Output

```json
{
	"component": "Switch",
	"parts": [
		{
			"name": "Root",
			"description": "",
			"props": [
				{
					"name": "checked",
					"type": "boolean",
					"required": false,
					"default": "false",
					"description": "Controlled checked state."
				}
			],
			"dataAttributes": [
				{ "name": "data-checked", "description": "Present when checked." }
			]
		}
	]
}
```

Render it with [`ApiReference`](/docs/components#apireference).
