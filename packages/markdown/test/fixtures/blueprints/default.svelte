<script module>
	export { default as h2 } from './h2.svelte';
</script>

<script>
	let { metadata, children } = $props();
</script>

<article class="hd-prose" data-title={metadata.title}>
	{@render children?.()}
</article>
