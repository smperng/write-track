<script lang="ts">
	import type { Database } from '$lib/types/database';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	type Draft = Database['public']['Tables']['drafts']['Row'];

	let {
		drafts,
		activeDraftId,
		projectId
	}: {
		drafts: Draft[];
		activeDraftId: string | null;
		projectId: string;
	} = $props();

	async function switchDraft(draftId: string) {
		if (draftId === activeDraftId) return;
		await fetch(`/api/projects/${projectId}/reorder`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action: 'switch_draft', draft_id: draftId })
		}).catch(() => {
			// Fallback: use form action
		});

		// Use form action via hidden form
		const form = document.querySelector<HTMLFormElement>('#draft-switch-form');
		const input = form?.querySelector<HTMLInputElement>('input[name="draft_id"]');
		if (form && input) {
			input.value = draftId;
			form.requestSubmit();
		}
	}
</script>

<div class="flex items-center gap-2">
	<label for="draft-select" class="text-xs font-medium text-gray-500">Draft:</label>
	<select
		id="draft-select"
		onchange={(e) => switchDraft(e.currentTarget.value)}
		class="flex-1 rounded border border-gray-300 px-2 py-1 text-xs"
	>
		{#each drafts as draft (draft.id)}
			<option value={draft.id} selected={draft.id === activeDraftId}>
				{draft.name}
			</option>
		{/each}
	</select>
</div>

<form
	id="draft-switch-form"
	method="POST"
	action="/projects/{projectId}/overview?/switch_draft"
	use:enhance={() => {
		return async ({ update }) => {
			await update();
			await invalidateAll();
		};
	}}
	class="hidden"
>
	<input type="hidden" name="draft_id" value="" />
</form>
