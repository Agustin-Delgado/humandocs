<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		children?: Snippet;
	}

	let { id, children, ...rest }: Props = $props();
</script>

<h2 {id} {...rest} class="group">
	{@render children?.()}
	{#if id}
		<a
			href="#{id}"
			aria-label="Link to this section"
			class="ml-2 text-gray-300 no-underline opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-600"
		>
			#
		</a>
	{/if}
</h2>
