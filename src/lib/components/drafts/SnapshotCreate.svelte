<script lang="ts">
	import { enhance } from '$app/forms';

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { sceneId }: { sceneId: string } = $props();

	let showForm = $state(false);
	let label = $state('');
	let description = $state('');
</script>

{#if showForm}
	<form
		method="POST"
		action="?/create_snapshot"
		use:enhance={() => {
			return async ({ update }) => {
				await update();
				showForm = false;
				label = '';
				description = '';
			};
		}}
		class="flex items-end gap-2"
	>
		<div>
			<label for="snapshot-label" class="block text-xs font-medium text-gray-500">Label</label>
			<input
				type="text"
				id="snapshot-label"
				name="label"
				bind:value={label}
				required
				placeholder="e.g., Before major edit"
				class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			/>
		</div>
		<div>
			<label for="snapshot-desc" class="block text-xs font-medium text-gray-500">Description (optional)</label>
			<input
				type="text"
				id="snapshot-desc"
				name="description"
				bind:value={description}
				placeholder="Optional notes"
				class="mt-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			/>
		</div>
		<button
			type="submit"
			class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
		>
			Save
		</button>
		<button
			type="button"
			onclick={() => (showForm = false)}
			class="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
		>
			Cancel
		</button>
	</form>
{:else}
	<button
		onclick={() => (showForm = true)}
		class="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
	>
		Create Snapshot
	</button>
{/if}
