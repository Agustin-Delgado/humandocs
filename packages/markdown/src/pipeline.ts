import { unified } from 'unified';
import type { Root } from 'mdast';
import type { Processor } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import { remarkHighlight } from './highlight.js';
import type { ResolvedConfig } from './config.js';

/**
 * Order is load-bearing: user remark plugins run on mdast, the highlight
 * transform replaces code fences before remark-rehype, and rehype plugins
 * run on hast. `allowDangerousHtml` keeps inline Svelte components as `raw`
 * nodes — never add rehype-raw here (parse5 would lowercase `<Demo>`).
 */
export function createPipeline(config: ResolvedConfig): Processor<Root> {
	const processor = unified().use(remarkParse);
	if (config.gfm) processor.use(remarkGfm);
	processor.use(config.remarkPlugins);
	processor.use(remarkHighlight, config.highlight);
	processor.use(remarkRehype, { allowDangerousHtml: true });
	processor.use(config.rehypePlugins);
	return processor as unknown as Processor<Root>;
}
