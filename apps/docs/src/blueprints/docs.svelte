<script module>
	export { default as h2 } from './h2.svelte';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		metadata: { title?: string; description?: string };
		children: Snippet;
	}

	let { metadata, children }: Props = $props();
</script>

<svelte:head>
	<title>{metadata.title ? `${metadata.title} · humandocs` : 'humandocs'}</title>
	{#if metadata.description}
		<meta name="description" content={metadata.description} />
	{/if}
</svelte:head>

<article class="hd-prose mx-auto max-w-3xl">
	{@render children()}
</article>
