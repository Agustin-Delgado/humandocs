import { find, html as htmlSchema } from 'property-information';

/**
 * Minimal structural typing for the hast tree. remark-rehype with
 * `allowDangerousHtml` produces `raw` nodes that @types/hast does not model
 * without extra augmentation, so we keep our own narrow view.
 */
export interface HastNode {
	type: string;
	value?: string;
	tagName?: string;
	properties?: Record<string, unknown>;
	children?: HastNode[];
}

export interface SerializeOptions {
	/** Tag names overridden by the blueprint, emitted as `<namespace.tag>`. */
	overrides?: Set<string>;
	/** Identifier of the blueprint namespace import. */
	namespace?: string;
}

const VOID_ELEMENTS = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr'
]);

const TEXT_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'{': '&#123;',
	'}': '&#125;',
	'`': '&#96;'
};

const ATTR_ESCAPES: Record<string, string> = {
	'&': '&amp;',
	'"': '&quot;',
	'{': '&#123;',
	'}': '&#125;',
	'`': '&#96;'
};

/**
 * Curly braces and backticks must become character references or Svelte
 * parses them as expressions. Svelte decodes references at render time, so
 * the visible output is unchanged (locked in by an SSR test).
 */
function escapeText(text: string): string {
	return text.replace(/[&<>{}`]/g, (char) => TEXT_ESCAPES[char]);
}

function escapeAttribute(value: string): string {
	return value.replace(/[&"{}`]/g, (char) => ATTR_ESCAPES[char]);
}

function serializeProperties(properties: Record<string, unknown>): string {
	let out = '';
	for (const [property, value] of Object.entries(properties)) {
		if (value === undefined || value === null || value === false) continue;
		const info = find(htmlSchema, property);
		if (value === true) {
			out += ` ${info.attribute}`;
			continue;
		}
		const serialized = Array.isArray(value)
			? value.join(info.commaSeparated ? ', ' : ' ')
			: String(value);
		out += ` ${info.attribute}="${escapeAttribute(serialized)}"`;
	}
	return out;
}

function serializeElement(node: HastNode, options: SerializeOptions): string {
	const tagName = node.tagName ?? 'div';
	const overridden = options.namespace !== undefined && options.overrides?.has(tagName);
	const tag = overridden ? `${options.namespace}.${tagName}` : tagName;
	const attributes = serializeProperties(node.properties ?? {});
	const children = (node.children ?? []).map((child) => serializeNode(child, options)).join('');
	if (children === '' && VOID_ELEMENTS.has(tagName)) {
		return `<${tag}${attributes} />`;
	}
	return `<${tag}${attributes}>${children}</${tag}>`;
}

function serializeNode(node: HastNode, options: SerializeOptions): string {
	switch (node.type) {
		case 'text':
			return escapeText(node.value ?? '');
		// Raw nodes pass through verbatim: this is where inline Svelte
		// components (and pre-highlighted code HTML) keep live expressions.
		case 'raw':
			return node.value ?? '';
		case 'comment':
			return `<!--${node.value ?? ''}-->`;
		case 'element':
			return serializeElement(node, options);
		default:
			return '';
	}
}

export function serialize(tree: HastNode, options: SerializeOptions = {}): string {
	return (tree.children ?? []).map((child) => serializeNode(child, options)).join('');
}
