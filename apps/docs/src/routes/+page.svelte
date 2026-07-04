<script lang="ts">
	import { ThemeToggle } from '@human-kit/humandocs/components';
</script>

<svelte:head>
	<title>humandocs — a documentation framework for Svelte</title>
	<meta
		name="description"
		content="Markdown-driven docs, live component demos with source, and generated API references for Svelte and SvelteKit."
	/>
</svelte:head>

<div class="flex min-h-screen flex-col bg-white dark:bg-gray-950">
	<header class="flex h-14 items-center justify-end px-4">
		<ThemeToggle />
	</header>

	<main class="flex flex-1 flex-col items-center justify-center px-6 text-center">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">humandocs</h1>
		<p class="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
			A documentation framework for Svelte and SvelteKit — markdown-driven pages, live component
			demos with source code, and generated API references.
		</p>
		<div class="mt-8 flex items-center gap-3">
			<a
				href="/docs/getting-started"
				class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
			>
				Get started
			</a>
			<a
				href="https://github.com/Agustin-Delgado/humandocs"
				target="_blank"
				rel="noreferrer"
				class="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900"
			>
				GitHub
			</a>
		</div>
	</main>
</div>
