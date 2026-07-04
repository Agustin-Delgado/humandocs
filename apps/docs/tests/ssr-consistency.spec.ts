import { test, expect, type Page } from '@playwright/test';

// Pages that exercise the docs shell: sidebar, TOC and a live <Demo>.
const PAGES = ['/docs/getting-started', '/docs/markdown', '/docs/components'];

function collectProblems(page: Page): string[] {
	const problems: string[] = [];
	page.on('console', (m) => {
		if (m.type() === 'error' || m.type() === 'warning') problems.push(m.text());
	});
	page.on('pageerror', (e) => problems.push(String(e)));
	return problems;
}

for (const path of PAGES) {
	test(`SSR renders the same shell as hydration: ${path}`, async ({ page }) => {
		// Raw server response — no browser JS involved.
		const response = await page.request.get(path);
		const ssrHtml = await response.text();

		// The active sidebar item and the table of contents must be in the SSR
		// HTML, not injected only after hydration.
		expect(ssrHtml, 'sidebar active item missing from SSR').toContain('aria-current="page"');
		expect(ssrHtml, 'TOC missing from SSR').toContain('aria-label="On this page"');
		// A block-level component must never be wrapped in <p> — the invalid
		// nesting reparents in the browser and breaks hydration.
		expect(ssrHtml, 'block component wrapped in <p>').not.toMatch(/<p>\s*<div class="not-prose/);

		// After hydration the same markers are present and interactive.
		const problems = collectProblems(page);
		await page.goto(path, { waitUntil: 'networkidle' });
		await expect(page.locator('aside a[aria-current="page"]')).toHaveCount(1);
		await expect(page.locator('[aria-label="On this page"]')).toBeVisible();

		// Hydration must be clean — this is what caught the <p><div> regression.
		const hydrationProblems = problems.filter((p) =>
			/hydrat|HierarchyRequest|node type does not support/i.test(p)
		);
		expect(hydrationProblems, hydrationProblems.join('\n')).toHaveLength(0);
	});
}

test('component-rendered headings appear in the TOC after hydration', async ({ page }) => {
	// <ApiReference> renders `api-*` headings from its data; the preprocessor
	// runs before the component exists, so they are not in the SSR outline...
	const response = await page.request.get('/docs/components');
	const ssrHtml = await response.text();
	expect(ssrHtml, 'component heading should not be in the SSR TOC').not.toContain(
		'href="#api-root"'
	);

	// ...but the client re-scans the DOM and adds them. Regression guard: the
	// TOC used to drop these when the SSR outline was treated as authoritative.
	await page.goto('/docs/components', { waitUntil: 'networkidle' });
	await expect(page.locator('[aria-label="On this page"] a[href="#api-root"]')).toBeVisible();
});
