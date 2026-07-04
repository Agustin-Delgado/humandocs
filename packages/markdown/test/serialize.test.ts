import { describe, expect, test } from 'vitest';
import { serialize, type HastNode } from '../src/serialize.ts';
import { toImportPath, scanOverrides } from '../src/blueprint.ts';
import { extractFrontmatter } from '../src/frontmatter.ts';
import { extractBlocks } from '../src/extract-blocks.ts';

function root(...children: HastNode[]): HastNode {
	return { type: 'root', children };
}

describe('serialize', () => {
	test('escapes braces, backticks and angle brackets in text', () => {
		const out = serialize(root({ type: 'text', value: 'a {b} `c` <d>' }));
		expect(out).toBe('a &#123;b&#125; &#96;c&#96; &lt;d&gt;');
	});

	test('escapes braces and quotes in attribute values', () => {
		const out = serialize(
			root({
				type: 'element',
				tagName: 'a',
				properties: { href: '/x', title: 'has {braces} and "quotes"' },
				children: []
			})
		);
		expect(out).toBe('<a href="/x" title="has &#123;braces&#125; and &quot;quotes&quot;"></a>');
	});

	test('serializes className arrays and boolean attributes', () => {
		const out = serialize(
			root({
				type: 'element',
				tagName: 'input',
				properties: { className: ['a', 'b'], disabled: true, type: 'text' },
				children: []
			})
		);
		expect(out).toBe('<input class="a b" disabled type="text" />');
	});

	test('raw nodes pass through verbatim', () => {
		const out = serialize(root({ type: 'raw', value: '<Demo source={x}><Hero /></Demo>' }));
		expect(out).toBe('<Demo source={x}><Hero /></Demo>');
	});

	test('comments are preserved', () => {
		const out = serialize(root({ type: 'comment', value: ' svelte-ignore foo ' }));
		expect(out).toBe('<!-- svelte-ignore foo -->');
	});

	test('overridden tags are emitted through the namespace', () => {
		const out = serialize(
			root({
				type: 'element',
				tagName: 'h2',
				properties: { id: 'x' },
				children: [{ type: 'text', value: 'T' }]
			}),
			{ overrides: new Set(['h2']), namespace: 'ns__' }
		);
		expect(out).toBe('<ns__.h2 id="x">T</ns__.h2>');
	});
});

describe('toImportPath', () => {
	test('normalizes Windows separators', () => {
		expect(toImportPath('C:\\Users\\dev\\blueprint.svelte')).toBe('C:/Users/dev/blueprint.svelte');
	});
});

describe('scanOverrides', () => {
	test('collects lowercase re-exports from the module script', () => {
		const overrides = scanOverrides(
			`<script module>\n\texport { default as h2 } from './h2.svelte';\n\texport { Anchor as a, NotATag };\n</script>\n<p>x</p>`
		);
		expect(overrides).toEqual(new Set(['h2', 'a']));
	});

	test('returns empty set without a module script', () => {
		expect(scanOverrides('<script>let x = 1;</script>')).toEqual(new Set());
	});
});

describe('extractFrontmatter', () => {
	test('handles missing frontmatter', () => {
		expect(extractFrontmatter('# Hi')).toEqual({ metadata: {}, content: '# Hi' });
	});

	test('strips the fence and parses YAML', () => {
		const { metadata, content } = extractFrontmatter('---\ntitle: X\n---\n\n# Hi');
		expect(metadata).toEqual({ title: 'X' });
		expect(content).toBe('\n# Hi');
	});
});

describe('extractBlocks', () => {
	test('separates module script, instance script and style', () => {
		const source = `<script module>\nconst a = 1;\n</script>\n\n<script lang="ts">\nconst b = 2;\n</script>\n\nText\n\n<style>\np { color: red; }\n</style>\n`;
		const blocks = extractBlocks(source);
		expect(blocks.moduleScript?.body.trim()).toBe('const a = 1;');
		expect(blocks.instanceScript?.attributes).toContain('lang="ts"');
		expect(blocks.styleTag).toContain('color: red;');
		expect(blocks.content).not.toContain('script');
		expect(blocks.content).toContain('Text');
	});

	test('accepts the legacy context="module" attribute', () => {
		const blocks = extractBlocks(`<script context="module">const a = 1;</script>`);
		expect(blocks.moduleScript).toBeDefined();
	});

	test('throws on duplicate instance scripts', () => {
		expect(() =>
			extractBlocks('<script>1</script>\n<script>2</script>')
		).toThrow(/only one instance/);
	});

	test('ignores scripts and styles inside fenced code blocks', () => {
		const source = [
			'<script>',
			'\tconst real = 1;',
			'</script>',
			'',
			'```svelte',
			'<script>',
			'\tconst example = 2;',
			'</script>',
			'<style>',
			'\tp { color: red; }',
			'</style>',
			'```',
			''
		].join('\n');
		const blocks = extractBlocks(source);
		expect(blocks.instanceScript?.body).toContain('const real = 1;');
		expect(blocks.styleTag).toBeUndefined();
		expect(blocks.content).toContain('const example = 2;');
	});
});
