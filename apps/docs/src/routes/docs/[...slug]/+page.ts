import { error } from '@sveltejs/kit';
import { createContentLoader } from '@human-kit/humandocs/content';
import type { PageLoad } from './$types.js';

const loadContent = createContentLoader(import.meta.glob('/src/content/**/*.md'));

export const load: PageLoad = async ({ params }) => {
	const page = await loadContent(params.slug);
	if (!page) error(404, `Not found: ${params.slug}`);
	return page;
};
