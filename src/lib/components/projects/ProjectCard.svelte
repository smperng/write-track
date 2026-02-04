<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Database } from '$lib/types/database';
	import ProjectStatusBadge from './ProjectStatusBadge.svelte';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';
	import { formatWordCount, formatDeadline } from '$lib/utils/format';

	type Project = Database['public']['Tables']['projects']['Row'];

	let {
		project,
		wordCount = 0,
		completionPercentage = 0,
		onarchive,
		ondelete
	}: {
		project: Project;
		wordCount?: number;
		completionPercentage?: number;
		onarchive?: (id: string) => void;
		ondelete?: (id: string) => void;
	} = $props();
</script>

<a
	href={resolve(`/projects/${project.id}`)}
	class="block rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
>
	<div class="mb-3 flex items-start justify-between">
		<h3 class="text-base font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div onclick={(e: MouseEvent) => e.preventDefault()}>
			<DropdownMenu>
				<a
					href={resolve(`/projects/${project.id}/overview`)}
					class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
					role="menuitem"
				>
					Edit
				</a>
				{#if onarchive}
					<button
						onclick={() => onarchive(project.id)}
						class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
						role="menuitem"
					>
						Archive
					</button>
				{/if}
				{#if ondelete}
					<button
						onclick={() => ondelete(project.id)}
						class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
						role="menuitem"
					>
						Delete
					</button>
				{/if}
			</DropdownMenu>
		</div>
	</div>

	{#if project.description}
		<p class="mb-3 text-sm text-gray-500 line-clamp-2">{project.description}</p>
	{/if}

	<div class="flex flex-wrap items-center gap-2">
		<ProjectStatusBadge status={project.status} />
		{#if project.genre}
			<span class="text-xs text-gray-400">{project.genre}</span>
		{/if}
	</div>

	<div class="mt-3 flex items-center justify-between text-xs text-gray-500">
		<span>{formatWordCount(wordCount)}</span>
		{#if project.deadline}
			<span>{formatDeadline(project.deadline)}</span>
		{/if}
	</div>

	{#if completionPercentage > 0}
		<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
			<div
				class="h-full rounded-full bg-primary-500"
				style="width: {completionPercentage}%"
			></div>
		</div>
	{/if}
</a>
