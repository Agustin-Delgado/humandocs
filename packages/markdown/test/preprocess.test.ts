import { describe, expect, test } from 'vitest';
import {
	BLUEPRINT_CONFIG,
	asyncFakeHighlighter,
	fakeHighlighter,
	runPreprocessor,
	sanitize
} from './helpers.ts';

describe('humandocsMarkdown output', () => {
	test('basic markdown', async () => {
		expect(await runPreprocessor('basic.md')).toMatchSnapshot();
	});

	test('frontmatter becomes a metadata export', async () => {
		const code = await runPreprocessor('frontmatter.md');
		expect(code).toContain(
			'export const metadata = {"title":"Frontmatter","description":"A description with \\"quotes\\" and — dashes.","order":3,"draft":true};'
		);
		expect(code).toMatchSnapshot();
	});

	test('svelte components pass through untouched', async () => {
		const code = await runPreprocessor('components.md');
		expect(code).toContain('<Counter start={1} />');
		expect(code).toContain("import Counter from './counter.svelte';");
		expect(code).toMatchSnapshot();
	});

	test('code blocks without a highlighter fall back to pre/code', async () => {
		const code = await runPreprocessor('code-blocks.md');
		expect(code).toContain('&#123;#if open&#125;');
		expect(code).not.toContain('{#if open}');
		// The <script> inside the fence is a code example — it must stay in
		// the fence (escaped), never hoisted as the page's instance script.
		expect(code).toContain('&lt;script&gt;');
		expect(code).not.toMatch(/<script>\s*let \{ open/);
		expect(code).toMatchSnapshot();
	});

	test('code blocks with a sync highlighter', async () => {
		const code = await runPreprocessor('code-blocks.md', { highlight: fakeHighlighter });
		expect(code).toContain('data-lang="svelte"');
		expect(code).toContain('data-meta="twoslash"');
		expect(code).toContain('svelte-ignore a11y_no_noninteractive_tabindex');
		expect(code).toMatchSnapshot();
	});

	test('code blocks with an async highlighter match the sync output', async () => {
		const syncCode = await runPreprocessor('code-blocks.md', { highlight: fakeHighlighter });
		const asyncCode = await runPreprocessor('code-blocks.md', {
			highlight: asyncFakeHighlighter
		});
		expect(asyncCode).toBe(syncCode);
	});

	test('braces and backticks in prose are entity-escaped', async () => {
		const code = await runPreprocessor('entities.md');
		expect(code).toContain('Braces &#123; not an expression &#125; in prose');
		expect(code).toContain('&#123;#each item&#125;');
		expect(code).toContain('title="title with &#123;braces&#125;"');
		expect(code).toMatchSnapshot();
	});

	test('user scripts are hoisted out of the markdown', async () => {
		const code = await runPreprocessor('script-blocks.md');
		expect(code).toContain('export const shared = 42;');
		expect(code).toContain('let count: number = 0;');
		expect(code).toContain('<script lang="ts">');
		expect(code).toContain('<button onclick={increment}>Increment</button>');
		expect(code).toMatchSnapshot();
	});

	test('default blueprint wraps content and overrides h2', async () => {
		const code = await runPreprocessor('blueprint.md', { blueprints: BLUEPRINT_CONFIG });
		expect(code).toContain("import Blueprint__, * as blueprintModule__ from '");
		expect(code).toContain('<Blueprint__ {metadata}>');
		expect(code).toContain('<blueprintModule__.h2>Overridden heading</blueprintModule__.h2>');
		expect(code).toContain('<h1>Title</h1>');
		expect(sanitize(code)).toMatchSnapshot();
	});

	test('named blueprint without overrides imports only the default export', async () => {
		const code = await runPreprocessor('blueprint-named.md', { blueprints: BLUEPRINT_CONFIG });
		expect(code).toContain("import Blueprint__ from '");
		expect(code).not.toContain('blueprintModule__');
		expect(sanitize(code)).toMatchSnapshot();
	});

	test('blueprint: false opts out of wrapping', async () => {
		const code = await runPreprocessor('blueprint-false.md', { blueprints: BLUEPRINT_CONFIG });
		expect(code).not.toContain('Blueprint__');
		expect(code).toMatchSnapshot();
	});

	test('unknown blueprint name throws a clear error', async () => {
		await expect(
			runPreprocessor('blueprint-named.md', { blueprints: {} })
		).rejects.toThrow(/unknown blueprint "plain"/);
	});

	test('non-markdown files are ignored', async () => {
		const { preprocess } = await import('svelte/compiler');
		const { humandocsMarkdown } = await import('../src/index.ts');
		const source = '<h1>untouched</h1>';
		const result = await preprocess(source, [humandocsMarkdown()], { filename: 'page.svelte' });
		expect(result.code).toBe(source);
	});
});
