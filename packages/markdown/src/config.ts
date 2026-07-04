import type { PluggableList } from 'unified';

export interface BlueprintConfig {
	/**
	 * Absolute path to a Svelte component that wraps the rendered markdown.
	 * It receives `{ metadata, children }` via `$props()`.
	 */
	path: string;
}

export type Highlighter = (
	code: string,
	lang: string | undefined,
	meta: string | undefined
) => string | undefined | Promise<string | undefined>;

export interface MarkdownConfig {
	/** File extensions to transform. Default: `['.md']`. */
	extensions?: string[];
	/**
	 * Blueprints keyed by name. `default` applies to every file; a file opts
	 * into another via frontmatter `blueprint: <name>`, or out entirely with
	 * `blueprint: false`.
	 */
	blueprints?: Record<string, BlueprintConfig>;
	remarkPlugins?: PluggableList;
	rehypePlugins?: PluggableList;
	/** Enable GitHub Flavored Markdown (tables, strikethrough, task lists). Default: true. */
	gfm?: boolean;
	/**
	 * Code-block highlighter. The returned HTML replaces the fence verbatim,
	 * so it must already be Svelte-safe (see `escapeSvelte`). Return
	 * `undefined` to fall back to a plain `<pre><code>` rendering.
	 */
	highlight?: Highlighter;
}

export interface ResolvedConfig {
	extensions: string[];
	blueprints: Record<string, BlueprintConfig>;
	remarkPlugins: PluggableList;
	rehypePlugins: PluggableList;
	gfm: boolean;
	highlight: Highlighter | undefined;
}

export function resolveConfig(config: MarkdownConfig = {}): ResolvedConfig {
	return {
		extensions: config.extensions ?? ['.md'],
		blueprints: config.blueprints ?? {},
		remarkPlugins: config.remarkPlugins ?? [],
		rehypePlugins: config.rehypePlugins ?? [],
		gfm: config.gfm ?? true,
		highlight: config.highlight
	};
}
