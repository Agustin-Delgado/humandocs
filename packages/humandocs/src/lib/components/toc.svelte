<script lang="ts">
	import { page } from '$app/state';

	interface Heading {
		id: string;
		text: string;
		depth: number;
	}

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

	// By convention `createContentLoader` exposes the outline the preprocessor
	// extracted at `data.meta.headings`, so the TOC renders during SSR with no
	// wiring. An explicit `headings` prop overrides it.
	const dataHeadings = $derived((page.data as { meta?: { headings?: Heading[] } })?.meta?.headings);
	const ssrHeadings = $derived(providedHeadings ?? dataHeadings);

	let domHeadings = $state<Heading[]>([]);
	// Set by the scroll observer on the client; before that (and in SSR) the
	// first heading is treated as active so the rendered output matches.
	let scrollActiveId = $state<string | null>(null);

	// Once the client has walked the DOM, that list wins — it is the ground
	// truth and includes headings the preprocessor could not see (e.g. the
	// `api-*` headings that <ApiReference> renders from its data). The SSR
	// outline is only the pre-hydration fallback.
	const headings = $derived(domHeadings.length > 0 ? domHeadings : (ssrHeadings ?? []));
	const activeId = $derived(scrollActiveId ?? headings[0]?.id ?? null);

	$effect(() => {
		// Re-run whenever the route changes (after the new page renders).
		void page.url.pathname;

		const elements = [...document.querySelectorAll(selector)];
		// Always re-scan: reassigning (not appending) keeps it in sync with the
		// current route. Reading a local, never the state just written, avoids
		// an effect that depends on its own writes.
		domHeadings = elements.map((el) => ({
			id: el.id,
			text: el.textContent ?? '',
			depth: el.tagName === 'H2' ? 2 : 3
		}));
		scrollActiveId = null;

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						scrollActiveId = entry.target.id;
						break;
					}
				}
			},
			{ rootMargin: '-80px 0px -70% 0px' }
		);
		for (const el of elements) observer.observe(el);
		return () => observer.disconnect();
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
