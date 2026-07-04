import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { humandocs } from '@human-kit/humandocs/vite';

export default defineConfig({
	plugins: [humandocs(), tailwindcss(), sveltekit()]
});
