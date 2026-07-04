import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { preprocess } from 'svelte/compiler';
import { humandocsMarkdown, escapeSvelte, type MarkdownConfig } from '../src/index.ts';
import { toImportPath } from '../src/blueprint.ts';

export const BLUEPRINTS_DIR = fileURLToPath(new URL('./fixtures/blueprints/', import.meta.url));

export const BLUEPRINT_CONFIG: MarkdownConfig['blueprints'] = {
	default: { path: `${BLUEPRINTS_DIR}default.svelte` },
	plain: { path: `${BLUEPRINTS_DIR}plain.svelte` }
};

export function readFixture(name: string): string {
	return readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
}

export async function runPreprocessor(name: string, config?: MarkdownConfig): Promise<string> {
	const result = await preprocess(readFixture(name), [humandocsMarkdown(config)], {
		filename: name
	});
	return result.code;
}

/** Blueprint import paths are absolute; strip them so snapshots are machine-independent. */
export function sanitize(code: string): string {
	return code.replaceAll(toImportPath(BLUEPRINTS_DIR), '<BLUEPRINTS>/');
}

export const fakeHighlighter = (
	code: string,
	lang: string | undefined,
	meta: string | undefined
): string =>
	escapeSvelte(
		`<pre class="fake" data-lang="${lang ?? ''}" data-meta="${meta ?? ''}"><code>${code}</code></pre>`
	);

export const asyncFakeHighlighter = async (
	code: string,
	lang: string | undefined,
	meta: string | undefined
): Promise<string> => fakeHighlighter(code, lang, meta);
