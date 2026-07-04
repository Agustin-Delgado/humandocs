import { defineConfig } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
	testDir: 'tests',
	fullyParallel: true,
	// Build once, then serve the production output — SSR/hydration behaviour
	// only matches production in a real build.
	webServer: {
		command: `pnpm build && pnpm preview --port ${PORT}`,
		port: PORT,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	},
	use: {
		baseURL: `http://localhost:${PORT}`
	}
});
