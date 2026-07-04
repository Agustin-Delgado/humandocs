<script lang="ts">
	let count = $state(0);
</script>

<button
	type="button"
	onclick={() => (count += 1)}
	class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>
