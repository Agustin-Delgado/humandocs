<script lang="ts">
	import { DocsShell } from '@human-kit/humandocs/components';
	import { nav } from '$lib/nav.js';

	let { children } = $props();
</script>

<DocsShell
	{nav}
	title="humandocs"
	badge="alpha"
	githubUrl="https://github.com/Agustin-Delgado/humandocs"
>
	{@render children()}
</DocsShell>
