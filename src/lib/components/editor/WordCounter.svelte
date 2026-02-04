<script lang="ts">
	import { formatWordCount } from '$lib/utils/format';

	let {
		count,
		target
	}: {
		count: number;
		target?: number | null;
	} = $props();

	const percentage = $derived(target && target > 0 ? Math.min(Math.round((count / target) * 100), 100) : null);
</script>

<div class="flex items-center gap-2 text-xs text-gray-500">
	<span>{formatWordCount(count)}</span>
	{#if target && percentage !== null}
		<span class="text-gray-400">/ {formatWordCount(target, false)} target</span>
		<span class="text-gray-400">({percentage}%)</span>
	{/if}
</div>
