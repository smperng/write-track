<script lang="ts">
	import type { Database, ProjectStatus } from '$lib/types/database';
	import { enhance } from '$app/forms';

	type Project = Database['public']['Tables']['projects']['Row'];

	let {
		project,
		action = '?/create',
		oncancel
	}: {
		project?: Project;
		action?: string;
		oncancel?: () => void;
	} = $props();

	let error = $state('');
	let submitting = $state(false);

	const statuses: { value: ProjectStatus; label: string }[] = [
		{ value: 'planning', label: 'Planning' },
		{ value: 'drafting', label: 'Drafting' },
		{ value: 'revising', label: 'Revising' },
		{ value: 'complete', label: 'Complete' },
		{ value: 'on_hold', label: 'On Hold' }
	];
</script>

<form
	method="POST"
	action={action}
	use:enhance={() => {
		error = '';
		submitting = true;
		return async ({ result, update }) => {
			submitting = false;
			if (result.type === 'failure') {
				error = (result.data as { error?: string })?.error ?? 'Something went wrong';
			} else {
				await update();
			}
		};
	}}
>
	{#if project}
		<input type="hidden" name="id" value={project.id} />
	{/if}

	{#if error}
		<div class="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
			{error}
		</div>
	{/if}

	<div class="space-y-4">
		<div>
			<label for="title" class="block text-sm font-medium text-gray-700">Title</label>
			<input
				type="text"
				id="title"
				name="title"
				value={project?.title ?? ''}
				required
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			/>
		</div>

		<div>
			<label for="description" class="block text-sm font-medium text-gray-700">Description</label>
			<textarea
				id="description"
				name="description"
				rows={3}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
			>{project?.description ?? ''}</textarea>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="status" class="block text-sm font-medium text-gray-700">Status</label>
				<select
					id="status"
					name="status"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				>
					{#each statuses as s (s.value)}
						<option value={s.value} selected={project?.status === s.value}>{s.label}</option>
					{/each}
				</select>
			</div>

			<div>
				<label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
				<input
					type="text"
					id="genre"
					name="genre"
					value={project?.genre ?? ''}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				/>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<label for="target_word_count" class="block text-sm font-medium text-gray-700">Target Word Count</label>
				<input
					type="number"
					id="target_word_count"
					name="target_word_count"
					value={project?.target_word_count ?? ''}
					min="0"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				/>
			</div>

			<div>
				<label for="deadline" class="block text-sm font-medium text-gray-700">Deadline</label>
				<input
					type="date"
					id="deadline"
					name="deadline"
					value={project?.deadline ? project.deadline.split('T')[0] : ''}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
				/>
			</div>
		</div>
	</div>

	<div class="mt-6 flex justify-end gap-3">
		{#if oncancel}
			<button
				type="button"
				onclick={oncancel}
				class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
			>
				Cancel
			</button>
		{/if}
		<button
			type="submit"
			disabled={submitting}
			class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
		>
			{submitting ? 'Saving…' : project ? 'Save Changes' : 'Create Project'}
		</button>
	</div>
</form>
