import { visit } from 'unist-util-visit';
import type { Code, Root } from 'mdast';
import type { Highlighter } from './config.js';

/**
 * Shiki emits `tabindex="0"` on `<pre>`, which trips
 * a11y_no_noninteractive_tabindex; emitting the ignore comment in the
 * generated output removes the need for a consumer `onwarn` hack.
 */
const SVELTE_IGNORE = '<!-- svelte-ignore a11y_no_noninteractive_tabindex -->\n';

/**
 * Remark transform that replaces fenced code blocks with the highlighter's
 * HTML (as a raw `html` node, so it flows through remark-rehype untouched).
 * Must run before remark-rehype.
 */
export function remarkHighlight(highlighter: Highlighter | undefined) {
	return async (tree: Root) => {
		if (!highlighter) return;
		const nodes: Code[] = [];
		visit(tree, 'code', (node) => {
			nodes.push(node);
		});
		await Promise.all(
			nodes.map(async (node) => {
				const html = await highlighter(node.value, node.lang ?? undefined, node.meta ?? undefined);
				if (html === undefined) return;
				const replacement = node as unknown as { type: string; value: string };
				replacement.type = 'html';
				replacement.value = SVELTE_IGNORE + html;
			})
		);
	};
}
