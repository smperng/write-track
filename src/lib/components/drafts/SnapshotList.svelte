<script lang="ts">
	import type { Database } from '$lib/types/database';
	import { enhance } from '$app/forms';
	import { formatWordCount } from '$lib/utils/format';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	type Snapshot = Database['public']['Tables']['snapshots']['Row'];

	let {
		snapshots,
		oncompare
	}: {
		snapshots: Snapshot[];
		oncompare?: (id: string) => void;
	} = $props();

	let showDeleteConfirm = $state(false);
	let deleteSnapshotId = $state('');
	let deleteForm: HTMLFormElement | undefined = $state();
</script>

{#if snapshots.length === 0}
	<div class="rounded-lg border border-dashed border-gray-300 p-8 text-center">
		<p class="text-sm text-gray-500">No snapshots yet. Create one from the editor to save a point-in-time copy.</p>
	</div>
{:else}
	<div class="space-y-2">
		{#each snapshots as snapshot (snapshot.id)}
			<div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
				<div class="flex items-center justify-between">
					<div>
						<span class="text-sm font-medium text-gray-900">{snapshot.label}</span>
						<span class="ml-2 text-xs text-gray-400">
							{formatWordCount(snapshot.word_count)}
						</span>
					</div>
					<span class="text-xs text-gray-400">
						{new Date(snapshot.created_at).toLocaleString()}
					</span>
				</div>
				{#if snapshot.description}
					<p class="mt-1 text-xs text-gray-500">{snapshot.description}</p>
				{/if}
				<div class="mt-2 flex gap-3">
					{#if oncompare}
						<button
							onclick={() => oncompare(snapshot.id)}
							class="text-xs text-primary-600 hover:text-primary-700"
						>
							Compare
						</button>
					{/if}
					<form method="POST" action="?/restore" use:enhance>
						<input type="hidden" name="snapshot_id" value={snapshot.id} />
						<button type="submit" class="text-xs text-yellow-600 hover:text-yellow-700">
							Restore
						</button>
					</form>
					<button
						onclick={() => {
							deleteSnapshotId = snapshot.id;
							showDeleteConfirm = true;
						}}
						class="text-xs text-red-500 hover:text-red-600"
					>
						Delete
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Snapshot"
	message="Are you sure you want to delete this snapshot?"
	confirmLabel="Delete"
	variant="danger"
	onconfirm={() => {
		const input = deleteForm?.querySelector<HTMLInputElement>('input[name="snapshot_id"]');
		if (input) {
			input.value = deleteSnapshotId;
			deleteForm?.requestSubmit();
		}
	}}
/>

<form method="POST" action="?/delete_snapshot" use:enhance bind:this={deleteForm} class="hidden">
	<input type="hidden" name="snapshot_id" value="" />
</form>
