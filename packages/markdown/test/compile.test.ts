import { compile } from 'svelte/compiler';
import { describe, expect, test } from 'vitest';
import { BLUEPRINT_CONFIG, fakeHighlighter, runPreprocessor } from './helpers.ts';
import type { MarkdownConfig } from '../src/index.ts';

/**
 * Every fixture's generated output must be parseable Svelte under
 * `runes: true` — this is what proves the escaping strategy works.
 */
const cases: Array<[string, MarkdownConfig | undefined]> = [
	['basic.md', undefined],
	['frontmatter.md', undefined],
	['components.md', undefined],
	['code-blocks.md', undefined],
	['code-blocks.md', { highlight: fakeHighlighter }],
	['entities.md', undefined],
	['script-blocks.md', undefined],
	['blueprint.md', { blueprints: BLUEPRINT_CONFIG }],
	['blueprint-named.md', { blueprints: BLUEPRINT_CONFIG }],
	['blueprint-false.md', { blueprints: BLUEPRINT_CONFIG }]
];

describe('generated code compiles with runes enabled', () => {
	test.each(cases)('%s (config: %o)', async (fixture, config) => {
		const code = await runPreprocessor(fixture, config);
		expect(() =>
			compile(code, { runes: true, generate: false, filename: fixture.replace(/\.md$/, '.svelte') })
		).not.toThrow();
	});
});
