<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import ProjectForm from '$lib/components/projects/ProjectForm.svelte';
	import DraftNotes from '$lib/components/drafts/DraftNotes.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';

	let { data }: { data: PageData } = $props();

	let showCreateDraft = $state(false);
	let showDeleteDraft = $state(false);
	let deleteDraftId = $state('');
	let newDraftName = $state('');
</script>

<div class="mx-auto max-w-2xl space-y-8">
	<!-- Project Settings -->
	<section>
		<h2 class="mb-4 text-lg font-semibold text-gray-900">Project Settings</h2>
		<div class="rounded-lg border border-gray-200 bg-white p-6">
			<ProjectForm project={data.project} action="?/update" />
		</div>
	</section>

	<!-- Draft Management -->
	<section>
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-lg font-semibold text-gray-900">Drafts</h2>
			<button
				onclick={() => (showCreateDraft = true)}
				class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
			>
				New Draft
			</button>
		</div>

		<div class="space-y-3">
			{#each data.drafts as draft (draft.id)}
				<div
					class="rounded-lg border bg-white p-4 {draft.is_active
						? 'border-primary-300 ring-1 ring-primary-100'
						: 'border-gray-200'}"
				>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="font-medium text-gray-900">{draft.name}</span>
							{#if draft.is_active}
								<span class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">Active</span>
							{/if}
						</div>
						<div class="flex items-center gap-2">
							{#if !draft.is_active}
								<form method="POST" action="?/switch_draft" use:enhance>
									<input type="hidden" name="draft_id" value={draft.id} />
									<button
										type="submit"
										class="text-xs text-primary-600 hover:text-primary-700"
									>
										Switch to
									</button>
								</form>
							{/if}
							{#if data.drafts.length > 1}
								<button
									onclick={() => {
										deleteDraftId = draft.id;
										showDeleteDraft = true;
									}}
									class="text-xs text-red-500 hover:text-red-600"
								>
									Delete
								</button>
							{/if}
						</div>
					</div>

					{#if draft.is_active}
						<div class="mt-3">
							<DraftNotes draftId={draft.id} notes={draft.notes} />
						</div>
					{/if}

					<p class="mt-2 text-xs text-gray-400">
						Created {new Date(draft.created_at).toLocaleDateString()}
					</p>
				</div>
			{/each}
		</div>
	</section>
</div>

<Modal bind:open={showCreateDraft} title="Create New Draft">
	<form method="POST" action="?/create_draft" use:enhance>
		<input type="hidden" name="source_draft_id" value={data.activeDraft?.id ?? ''} />
		<div class="space-y-4">
			<div>
				<label for="draft_name" class="block text-sm font-medium text-gray-700">Draft Name</label>
				<input
					type="text"
					id="draft_name"
					name="name"
					bind:value={newDraftName}
					required
					placeholder="e.g., Second Draft"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				/>
			</div>
			<p class="text-sm text-gray-500">
				Content from the current active draft will be copied to the new draft.
			</p>
		</div>
		<div class="mt-6 flex justify-end gap-3">
			<button
				type="button"
				onclick={() => (showCreateDraft = false)}
				class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
			>
				Cancel
			</button>
			<button
				type="submit"
				class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
			>
				Create Draft
			</button>
		</div>
	</form>
</Modal>

<ConfirmDialog
	bind:open={showDeleteDraft}
	title="Delete Draft"
	message="Are you sure you want to delete this draft? All scenes in this draft will be permanently deleted."
	confirmLabel="Delete"
	variant="danger"
	onconfirm={() => {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/delete_draft';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'draft_id';
		input.value = deleteDraftId;
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}}
/>
