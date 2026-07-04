import { parse } from 'yaml';

export interface FrontmatterResult {
	metadata: Record<string, unknown>;
	content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/;

/**
 * Frontmatter is stripped manually (not with remark-frontmatter) because the
 * metadata is needed before the pipeline runs: it selects the blueprint and
 * is serialized into the generated module script.
 */
export function extractFrontmatter(source: string): FrontmatterResult {
	const match = FRONTMATTER_RE.exec(source);
	if (!match) return { metadata: {}, content: source };
	const metadata = parse(match[1]) ?? {};
	if (typeof metadata !== 'object' || Array.isArray(metadata)) {
		throw new Error('humandocs-markdown: frontmatter must be a YAML mapping');
	}
	return {
		metadata: metadata as Record<string, unknown>,
		content: source.slice(match[0].length)
	};
}
