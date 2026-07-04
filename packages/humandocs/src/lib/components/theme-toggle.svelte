<script lang="ts">
	import { theme } from '../theme/theme.svelte.js';
	import Sun from './icons/sun.svelte';
	import Moon from './icons/moon.svelte';
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	aria-label={theme.dark ? 'Switch to light mode' : 'Switch to dark mode'}
	class="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
>
	{#if theme.dark}
		<Sun class="size-4" />
	{:else}
		<Moon class="size-4" />
	{/if}
</button>
