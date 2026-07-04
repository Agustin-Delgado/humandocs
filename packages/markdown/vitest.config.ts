import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { humandocsMarkdown } from './src/index.ts';

const defaultBlueprint = fileURLToPath(
	new URL('./test/fixtures/blueprints/default.svelte', import.meta.url)
);

export default defineConfig({
	plugins: [
		svelte({
			extensions: ['.svelte', '.md'],
			compilerOptions: { runes: true },
			preprocess: [
				humandocsMarkdown({
					blueprints: { default: { path: defaultBlueprint } }
				})
			]
		})
	],
	test: {
		environment: 'node'
	}
});
