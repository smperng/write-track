<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import ProjectList from '$lib/components/projects/ProjectList.svelte';
	import ProjectForm from '$lib/components/projects/ProjectForm.svelte';

	let { data }: { data: PageData } = $props();

	let showCreateModal = $state(false);
	let showDeleteConfirm = $state(false);
	let deleteProjectId = $state('');
	let archiveForm: HTMLFormElement | undefined = $state();
	let deleteForm: HTMLFormElement | undefined = $state();

	function handleArchive(id: string) {
		const input = archiveForm?.querySelector<HTMLInputElement>('input[name="id"]');
		if (input) {
			input.value = id;
			archiveForm?.requestSubmit();
		}
	}

	function handleDeleteClick(id: string) {
		deleteProjectId = id;
		showDeleteConfirm = true;
	}

	function handleDeleteConfirm() {
		const input = deleteForm?.querySelector<HTMLInputElement>('input[name="id"]');
		if (input) {
			input.value = deleteProjectId;
			deleteForm?.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Projects — WriteTrack</title>
</svelte:head>

<div class="mx-auto max-w-5xl">
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Projects</h1>
		<button
			onclick={() => (showCreateModal = true)}
			class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
		>
			New Project
		</button>
	</div>

	<ProjectList
		projects={data.projects}
		wordCounts={data.wordCounts}
		completionPercentages={data.completionPercentages}
		onarchive={handleArchive}
		ondelete={handleDeleteClick}
	/>
</div>

<Modal bind:open={showCreateModal} title="New Project">
	<ProjectForm oncancel={() => (showCreateModal = false)} />
</Modal>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Project"
	message="Are you sure you want to delete this project? This action cannot be undone."
	confirmLabel="Delete"
	variant="danger"
	onconfirm={handleDeleteConfirm}
/>

<!-- Hidden forms for archive/delete actions -->
<form method="POST" action="?/archive" use:enhance bind:this={archiveForm} class="hidden">
	<input type="hidden" name="id" value="" />
</form>
<form method="POST" action="?/delete" use:enhance bind:this={deleteForm} class="hidden">
	<input type="hidden" name="id" value="" />
</form>
