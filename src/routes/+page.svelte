<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { formatWordCount } from '$lib/utils/format';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard — WriteTrack</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
	<h1 class="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-sm font-medium text-gray-500">Total Projects</h2>
			<p class="mt-2 text-3xl font-semibold text-gray-900">{data.stats.projectCount}</p>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-sm font-medium text-gray-500">Words Written</h2>
			<p class="mt-2 text-3xl font-semibold text-gray-900">
				{formatWordCount(data.stats.totalWords, false)}
			</p>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<h2 class="text-sm font-medium text-gray-500">Active Drafts</h2>
			<p class="mt-2 text-3xl font-semibold text-gray-900">{data.stats.activeDrafts}</p>
		</div>
	</div>

	{#if data.recentProjects.length > 0}
		<div class="mt-8">
			<h2 class="mb-4 text-lg font-semibold text-gray-900">Recent Projects</h2>
			<div class="space-y-2">
				{#each data.recentProjects as project (project.id)}
					<a
						href={resolve(`/projects/${project.id}`)}
						class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-shadow hover:shadow-sm"
					>
						<div>
							<span class="text-sm font-medium text-gray-900">{project.title}</span>
							{#if project.genre}
								<span class="ml-2 text-xs text-gray-400">{project.genre}</span>
							{/if}
						</div>
						<span
							class="text-xs text-gray-500"
						>
							{new Date(project.updated_at).toLocaleDateString()}
						</span>
					</a>
				{/each}
			</div>
		</div>
	{:else}
		<div class="mt-8 rounded-lg border border-dashed border-gray-300 p-12 text-center">
			<p class="text-gray-500">No projects yet. Create your first project to get started.</p>
			<a
				href={resolve('/projects')}
				class="mt-4 inline-block rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
			>
				Go to Projects
			</a>
		</div>
	{/if}
</div>
