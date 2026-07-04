/**
 * End-to-end: fixtures are imported through vite-plugin-svelte with the real
 * preprocessor (see vitest.config.ts) and rendered with svelte/server. This
 * locks in the assumption that Svelte decodes `&#123;`-style references —
 * the entire escaping strategy rests on it.
 */
import { render } from 'svelte/server';
import { expect, test } from 'vitest';
import Entities, { metadata } from './fixtures/entities.md';

test('curly braces survive the full pipeline as literal text', () => {
	const { body } = render(Entities);
	expect(body).toContain('Braces { not an expression } in prose');
	expect(body).toContain('{#each item}');
});

test('blueprint wraps the page and overrides h2', () => {
	const { body } = render(Entities);
	expect(body).toContain('class="hd-prose"');
	expect(body).toContain('data-title="Entities"');
	expect(body).toContain('class="custom"');
	expect(body).toContain('Heading two');
});

test('metadata is exported from the module script', () => {
	expect(metadata.title).toBe('Entities');
});
