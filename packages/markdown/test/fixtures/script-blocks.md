---
title: Scripts
---

<script module>
	export const shared = 42;

	export function helper() {
		return shared;
	}
</script>

<script lang="ts">
	let count: number = 0;

	function increment() {
		count += 1;
	}
</script>

# Scripts

Count starts at zero.

<button onclick={increment}>Increment</button>
