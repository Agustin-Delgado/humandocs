import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts', 'src/shiki.ts', 'src/vite.ts', 'src/cli/extract-api.ts'],
	format: ['esm'],
	dts: true,
	clean: true,
	target: 'node20'
});
