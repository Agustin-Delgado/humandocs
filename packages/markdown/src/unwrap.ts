import type { HastNode } from './serialize.js';

function isWhitespaceText(node: HastNode): boolean {
	return node.type === 'text' && (node.value ?? '').trim() === '';
}

/**
 * A paragraph that holds only raw component/HTML nodes (plus insignificant
 * whitespace). remark wraps a block-level component written on its own line
 * — `<Demo />`, `<ApiReference />` — in a `<p>`; if that component renders a
 * block element the browser produces `<p><div></p>`, which is invalid and
 * breaks Svelte hydration. Unwrapping keeps inline usage (`text <C /> text`)
 * intact because those paragraphs still contain real text.
 */
function isRawOnlyParagraph(node: HastNode): boolean {
	if (node.type !== 'element' || node.tagName !== 'p') return false;
	const children = node.children ?? [];
	const hasRaw = children.some((child) => child.type === 'raw');
	return hasRaw && children.every((child) => child.type === 'raw' || isWhitespaceText(child));
}

/** Replace raw-only paragraphs with their children, depth-first. */
export function unwrapBlockParagraphs(tree: HastNode): void {
	const children = tree.children;
	if (!children) return;
	const next: HastNode[] = [];
	for (const child of children) {
		unwrapBlockParagraphs(child);
		if (isRawOnlyParagraph(child)) {
			next.push(...(child.children ?? []));
		} else {
			next.push(child);
		}
	}
	tree.children = next;
}
