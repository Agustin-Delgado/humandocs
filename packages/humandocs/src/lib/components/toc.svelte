<script lang="ts">
	import { page } from '$app/state';
	import { getRegisteredHeadings, type RegisteredHeading } from './toc-registry.js';

	type Heading = RegisteredHeading;

	interface Props {
		/**
		 * Headings to render. Pass the outline from `data.meta.headings` (the
		 * preprocessor extracts it) so the list renders during SSR. When
		 * omitted, headings are discovered from the DOM after hydration.
		 */
		headings?: Heading[];
		/** Where to look for headings when none are provided. */
		selector?: string;
		label?: string;
	}

	let {
		headings: providedHeadings,
		selector = 'article h2[id], article h3[id]',
		label = 'On this page'
	}: Props = $props();

	// Headings that content components (e.g. ApiReference) rendered before the
	// TOC in the tree — available synchronously during SSR (see toc-registry).
	const registered = getRegisteredHeadings();

	// By convention `createContentLoader` exposes the outline the preprocessor
	// extracted at `data.meta.headings`, so the TOC renders during SSR with no
	// wiring. An explicit `headings` prop overrides it. Component-rendered
	// headings are appended (they sit at the end of the document).
	const dataHeadings = $derived((page.data as { meta?: { headings?: Heading[] } })?.meta?.headings);
	const ssrHeadings = $derived.by(() => {
		const base = providedHeadings ?? dataHeadings ?? [];
		if (registered.length === 0) return base;
		const seen = new Set(base.map((h) => h.id));
		return [...base, ...registered.filter((h) => !seen.has(h.id))];
	});

	let domHeadings = $state<Heading[]>([]);
	// The heading the reader has scrolled to; null while at the top so the
	// first heading stays active — matching SSR.
	let scrollActiveId = $state<string | null>(null);

	// Prefer the data outline (metadata + component-registered headings) so the
	// list and its text are identical in SSR and after hydration. Reading the
	// DOM would pick up heading decorations (e.g. anchor "#") and drift. The
	// DOM scan is only a fallback for content rendered without that outline.
	const headings = $derived(ssrHeadings.length > 0 ? ssrHeadings : domHeadings);
	const activeId = $derived(scrollActiveId ?? headings[0]?.id ?? null);

	$effect(() => {
		// Re-run whenever the route changes (after the new page renders).
		void page.url.pathname;

		const elements = [...document.querySelectorAll<HTMLElement>(selector)];
		// Always re-scan: reassigning (not appending) keeps it in sync with the
		// current route. Reading a local, never the state just written, avoids
		// an effect that depends on its own writes.
		domHeadings = elements.map((el) => ({
			id: el.id,
			text: el.textContent ?? '',
			depth: el.tagName === 'H2' ? 2 : 3
		}));

		if (elements.length === 0) {
			scrollActiveId = null;
			return;
		}

		// Position-based scrollspy: the active heading is the last one whose top
		// has passed the offset. At the top of the page nothing has, so it stays
		// null and the first heading is active — the same state SSR renders.
		const OFFSET = 100;
		const updateActive = () => {
			let current: string | null = null;
			for (const el of elements) {
				if (el.getBoundingClientRect().top <= OFFSET) current = el.id;
				else break;
			}
			scrollActiveId = current;
		};
		updateActive();
		window.addEventListener('scroll', updateActive, { passive: true });
		return () => window.removeEventListener('scroll', updateActive);
	});
</script>

{#if headings.length > 0}
	<nav aria-label={label} class="text-sm">
		<h4 class="text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
			{label}
		</h4>
		<ul class="mt-3 space-y-1.5 border-l border-gray-200 dark:border-gray-800">
			{#each headings as heading (heading.id)}
				<li>
					<a
						href="#{heading.id}"
						class="-ml-px block border-l py-0.5 transition-colors {heading.depth === 3
							? 'pl-7'
							: 'pl-4'} {activeId === heading.id
							? 'border-gray-900 font-medium text-gray-900 dark:border-white dark:text-white'
							: 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'}"
					>
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
