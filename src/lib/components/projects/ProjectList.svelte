<script lang="ts">
	import type { Database } from '$lib/types/database';
	import ProjectCard from './ProjectCard.svelte';

	type Project = Database['public']['Tables']['projects']['Row'];

	let {
		projects,
		wordCounts = {},
		completionPercentages = {},
		onarchive,
		ondelete
	}: {
		projects: Project[];
		wordCounts?: Record<string, number>;
		completionPercentages?: Record<string, number>;
		onarchive?: (id: string) => void;
		ondelete?: (id: string) => void;
	} = $props();
</script>

{#if projects.length === 0}
	<div class="rounded-lg border border-dashed border-gray-300 p-12 text-center">
		<p class="text-gray-500">No projects yet. Create your first project to get started.</p>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each projects as project (project.id)}
			<ProjectCard
				{project}
				wordCount={wordCounts[project.id] ?? 0}
				completionPercentage={completionPercentages[project.id] ?? 0}
				{onarchive}
				{ondelete}
			/>
		{/each}
	</div>
{/if}
