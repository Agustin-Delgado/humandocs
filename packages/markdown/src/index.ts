import { VFile } from 'vfile';
import type { PreprocessorGroup } from 'svelte/compiler';
import { resolveConfig, type MarkdownConfig } from './config.js';
import { extractFrontmatter } from './frontmatter.js';
import { extractBlocks } from './extract-blocks.js';
import { selectBlueprint } from './blueprint.js';
import { createPipeline } from './pipeline.js';
import { serialize, type HastNode } from './serialize.js';
import { assemble, BLUEPRINT_NAMESPACE } from './assemble.js';

export type { MarkdownConfig, BlueprintConfig, Highlighter } from './config.js';

/**
 * Escape `{`, `}` and `` ` `` in an HTML string so Svelte does not parse
 * them as expressions. Use on highlighter output before returning it.
 */
export function escapeSvelte(html: string): string {
	return html
		.replace(/{/g, '&#123;')
		.replace(/}/g, '&#125;')
		.replace(/`/g, '&#96;');
}

export function humandocsMarkdown(userConfig: MarkdownConfig = {}): PreprocessorGroup {
	const config = resolveConfig(userConfig);
	const processor = createPipeline(config);

	return {
		name: 'humandocs-markdown',
		markup: async ({ content, filename }) => {
			if (!filename || !config.extensions.some((extension) => filename.endsWith(extension))) {
				return;
			}

			const { metadata, content: withoutFrontmatter } = extractFrontmatter(content);
			const blocks = extractBlocks(withoutFrontmatter);
			const blueprint = selectBlueprint(metadata, config, filename);

			const file = new VFile({ path: filename, value: blocks.content });
			const mdast = processor.parse(file);
			const hast = (await processor.run(mdast, file)) as unknown as HastNode;

			const markup = serialize(hast, {
				overrides: blueprint?.overrides,
				namespace: BLUEPRINT_NAMESPACE
			});

			const code = assemble({
				metadata,
				markup,
				moduleScript: blocks.moduleScript,
				instanceScript: blocks.instanceScript,
				styleTag: blocks.styleTag,
				blueprint
			});

			return { code, dependencies: blueprint ? [blueprint.path] : [] };
		}
	};
}
