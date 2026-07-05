import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';
import { highlight } from './shiki.js';

/**
 * Resolves `./demo.svelte?highlight` imports to `{ code, html }`: the raw
 * source plus its shiki-highlighted HTML, generated at build time so no
 * highlighting JS ships to the client.
 */
const HIGHLIGHT_PREFIX = '\0demo-highlight:';
const HIGHLIGHT_SUFFIX = '.highlighted';

export interface HighlightedSource {
	code: string;
	html: string;
}

export interface DemoHighlightOptions {
	/** Language passed to shiki for `?highlight` imports. Default: 'svelte'. */
	lang?: string;
}

export function demoHighlight(options: DemoHighlightOptions = {}): Plugin {
	const lang = options.lang ?? 'svelte';
	return {
		name: 'human-kit-demo-highlight',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (!source.endsWith('?highlight')) return;
			const resolved = await this.resolve(source.slice(0, -'?highlight'.length), importer, {
				skipSelf: true
			});
			if (!resolved) return;
			// Virtual id that no longer ends in `.svelte`, so vite-plugin-svelte
			// does not try to compile the emitted JS as a Svelte component.
			return HIGHLIGHT_PREFIX + resolved.id + HIGHLIGHT_SUFFIX;
		},
		async load(id) {
			if (!id.startsWith(HIGHLIGHT_PREFIX)) return;
			const file = id.slice(HIGHLIGHT_PREFIX.length, -HIGHLIGHT_SUFFIX.length);
			this.addWatchFile(file);
			const code = (await readFile(file, 'utf-8')).trim();
			const html = await highlight(code, lang);
			return `export default ${JSON.stringify({ code, html })};`;
		}
	};
}
