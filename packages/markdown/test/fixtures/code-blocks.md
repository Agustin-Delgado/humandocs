---
title: Code
---

# Code

```svelte
<script>
	let { open = $bindable(false) } = $props();
</script>

{#if open}
	<p>{open}</p>
{/if}
```

```ts twoslash
const x: number = 1;
```
