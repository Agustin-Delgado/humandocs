<script>
	let { start = 0, children } = $props();

	let count = $state(start);
</script>

<button onclick={() => (count += 1)}>{count}</button>
{@render children?.()}
