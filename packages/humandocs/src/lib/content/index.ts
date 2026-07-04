import type { Component } from 'svelte';
import type { DocMeta } from './types.js';

export type { DocMeta, NavGroup, NavItem } from './types.js';

export interface ContentPage {
	content: Component;
	meta: DocMeta;
}

interface ContentModule {
	default: Component;
	metadata?: DocMeta;
}

export interface ContentLoaderOptions {
	/**
	 * Directory prefix common to every module key. Derived automatically from
	 * the glob result; pass it explicitly when the content tree has a single
	 * page (the common prefix would over-shoot).
	 */
	prefix?: string;
	/** Key suffixes tried in order for a slug. Default: ['/index.md', '.md']. */
	suffixes?: string[];
}

/**
 * Builds a slug → page resolver from an `import.meta.glob` result. The glob
 * call must live in consumer code (it is expanded at build time):
 *
 * ```ts
 * const load = createContentLoader(import.meta.glob('/src/content/** /*.md'));
 * ```
 */
export function createContentLoader(
	modules: Record<string, () => Promise<unknown>>,
	options: ContentLoaderOptions = {}
): (slug: string) => Promise<ContentPage | undefined> {
	const suffixes = options.suffixes ?? ['/index.md', '.md'];
	const prefix = options.prefix ?? commonDirPrefix(Object.keys(modules));

	return async (slug) => {
		for (const suffix of suffixes) {
			const loader = modules[`${prefix}${slug}${suffix}`];
			if (!loader) continue;
			const module = (await loader()) as ContentModule;
			if (typeof module.default !== 'function') return undefined;
			return {
				content: module.default,
				meta: module.metadata ?? { title: slug }
			};
		}
		return undefined;
	};
}

function commonDirPrefix(keys: string[]): string {
	if (keys.length === 0) return '';
	let prefix = keys[0].slice(0, keys[0].lastIndexOf('/') + 1);
	for (const key of keys) {
		while (prefix !== '' && !key.startsWith(prefix)) {
			prefix = prefix.slice(0, prefix.lastIndexOf('/', prefix.length - 2) + 1);
		}
	}
	return prefix;
}
