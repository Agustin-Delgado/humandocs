import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { humandocsMarkdown } from '@human-kit/markdown';
import { highlight } from '@human-kit/humandocs/highlighter';
import rehypeSlug from 'rehype-slug';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		humandocsMarkdown({
			blueprints: {
				default: {
					path: fileURLToPath(new URL('./src/blueprints/docs.svelte', import.meta.url))
				}
			},
			rehypePlugins: [rehypeSlug],
			highlight
		})
	],
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x' })
	},
	compilerOptions: {
		runes: true
	}
};

export default config;
