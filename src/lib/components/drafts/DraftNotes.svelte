<script lang="ts">
	import { enhance } from '$app/forms';

	let {
		draftId,
		notes
	}: {
		draftId: string;
		notes: string | null;
	} = $props();

	let currentNotes = $state(notes ?? '');
	let dirty = $derived(currentNotes !== (notes ?? ''));
</script>

<form method="POST" action="?/update_draft_notes" use:enhance>
	<input type="hidden" name="draft_id" value={draftId} />
	<div>
		<label for="draft-notes" class="block text-xs font-medium text-gray-500">Draft Notes</label>
		<textarea
			id="draft-notes"
			name="notes"
			bind:value={currentNotes}
			rows={3}
			placeholder="Notes about this draft..."
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
		></textarea>
	</div>
	{#if dirty}
		<button
			type="submit"
			class="mt-2 rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700"
		>
			Save Notes
		</button>
	{/if}
</form>
