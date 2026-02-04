<script lang="ts">
	import { computeDiff, type DiffSegment } from '$lib/utils/diff';

	let {
		oldContent,
		newContent
	}: {
		oldContent: string;
		newContent: string;
	} = $props();

	const segments: DiffSegment[] = $derived(computeDiff(oldContent, newContent));
</script>

<div class="rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm leading-relaxed">
	{#each segments as segment, i (i)}
		{#if segment.type === 'equal'}
			<span class="text-gray-700">{segment.text}</span>
		{:else if segment.type === 'insert'}
			<span class="bg-green-100 text-green-800">{segment.text}</span>
		{:else if segment.type === 'delete'}
			<span class="bg-red-100 text-red-800 line-through">{segment.text}</span>
		{/if}
	{/each}
</div>
