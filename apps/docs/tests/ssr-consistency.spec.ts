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

test('component-rendered headings are in the TOC in SSR and after hydration', async ({ page }) => {
	// <ApiReference> renders `api-*` headings from its data. The preprocessor
	// cannot see them, but the component registers them (toc-registry) so they
	// render in the SSR TOC too — not just after the client re-scans the DOM.
	const response = await page.request.get('/docs/components');
	const ssrHtml = await response.text();
	expect(ssrHtml, 'component heading missing from the SSR TOC').toContain('href="#api-root"');

	await page.goto('/docs/components', { waitUntil: 'networkidle' });
	await expect(page.locator('[aria-label="On this page"] a[href="#api-root"]')).toBeVisible();
});

test('SSR marks no active TOC heading; the client highlights the first at the top', async ({
	page
}) => {
	// The active item depends on scroll, which SSR cannot know. Guessing (e.g.
	// the first heading) flashes to the wrong item when the page loads scrolled,
	// so SSR marks nothing active.
	const response = await page.request.get('/docs/getting-started');
	const ssrHtml = await response.text();
	const tocNav = ssrHtml.match(/aria-label="On this page"[\s\S]*?<\/nav>/)?.[0] ?? '';
	expect(tocNav, 'TOC should render in SSR').not.toBe('');
	expect(tocNav, 'SSR should not guess an active heading').not.toContain('font-medium');

	// After hydration at the top, the first heading is active.
	await page.goto('/docs/getting-started', { waitUntil: 'networkidle' });
	await page.evaluate(() => window.scrollTo(0, 0));
	await page.waitForTimeout(300);
	await expect(page.locator('[aria-label="On this page"] a.font-medium')).toHaveCount(1);
});
