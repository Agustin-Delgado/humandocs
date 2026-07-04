---
title: Components
---

<script>
	import Counter from './counter.svelte';
</script>

# Components

Inline <Counter start={1} /> in a sentence.

<Counter start={2}>
	Tight children stay raw (no blank lines).
</Counter>

<Counter start={3}>

**Loose** children are processed as markdown.

</Counter>
