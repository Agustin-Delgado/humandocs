import { getContext, setContext } from 'svelte';

export interface RegisteredHeading {
	id: string;
	text: string;
	depth: number;
}

const KEY = Symbol('humandocs-toc-registry');

/**
 * Shared, mutable list that lets components which render their own headings
 * (e.g. `ApiReference`) surface them to the table of contents during SSR.
 *
 * It works because the docs shell renders the main content before the TOC
 * aside: by the time `Toc` reads the registry, the content components have
 * already pushed into it. On the client the TOC re-scans the DOM instead, so
 * the registry is an SSR-only convenience.
 */
export function provideTocRegistry(): RegisteredHeading[] {
	const registry: RegisteredHeading[] = [];
	setContext(KEY, registry);
	return registry;
}

export function registerHeadings(headings: RegisteredHeading[]): void {
	getContext<RegisteredHeading[] | undefined>(KEY)?.push(...headings);
}

export function getRegisteredHeadings(): RegisteredHeading[] {
	return getContext<RegisteredHeading[] | undefined>(KEY) ?? [];
}
