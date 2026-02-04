<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import SnapshotList from '$lib/components/drafts/SnapshotList.svelte';
	import DraftDiff from '$lib/components/drafts/DraftDiff.svelte';

	let { data }: { data: PageData } = $props();

	let compareSnapshotId = $state<string | null>(null);

	const compareSnapshot = $derived(
		compareSnapshotId
			? data.snapshots.find((s) => s.id === compareSnapshotId)
			: null
	);
</script>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-lg font-semibold text-gray-900">
			Snapshots — {data.scene.title}
		</h2>
		<a
			href={resolve(`/projects/${data.projectId}/${data.scene.id}`)}
			class="text-sm text-primary-600 hover:text-primary-700"
		>
			Back to Editor
		</a>
	</div>

	{#if compareSnapshot}
		<div>
			<div class="mb-2 flex items-center justify-between">
				<h3 class="text-sm font-medium text-gray-700">
					Diff: "{compareSnapshot.label}" vs Current
				</h3>
				<button
					onclick={() => (compareSnapshotId = null)}
					class="text-xs text-gray-400 hover:text-gray-600"
				>
					Close diff
				</button>
			</div>
			<DraftDiff oldContent={compareSnapshot.content} newContent={data.scene.content} />
		</div>
	{/if}

	<SnapshotList
		snapshots={data.snapshots}
		oncompare={(id) => (compareSnapshotId = id)}
	/>
</div>
