import type { HastNode } from './serialize.js';

export interface Heading {
	id: string;
	text: string;
	depth: number;
}

const HEADING_DEPTHS: Record<string, number> = { h2: 2, h3: 3 };

function textContent(node: HastNode): string {
	if (node.type === 'text') return node.value ?? '';
	// Raw nodes (inline components) contribute no readable text.
	if (node.type === 'raw') return '';
	return (node.children ?? []).map(textContent).join('');
}

/**
 * Collect `h2`/`h3` headings that carry an `id` (added by rehype-slug), so a
 * table of contents can render during SSR instead of only after the
 * client-side DOM walk. Order follows document order.
 */
export function extractHeadings(tree: HastNode): Heading[] {
	const headings: Heading[] = [];
	function walk(node: HastNode) {
		if (node.type === 'element' && node.tagName && node.tagName in HEADING_DEPTHS) {
			const id = node.properties?.id;
			if (typeof id === 'string' && id.length > 0) {
				headings.push({ id, text: textContent(node).trim(), depth: HEADING_DEPTHS[node.tagName] });
			}
		}
		for (const child of node.children ?? []) walk(child);
	}
	walk(tree);
	return headings;
}
