<script>
	let { children, ...rest } = $props();
</script>

<h2 class="custom" {...rest}>{@render children?.()}</h2>
