<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import ProjectTree from '$lib/components/structure/ProjectTree.svelte';
	import DraftSelector from '$lib/components/drafts/DraftSelector.svelte';

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();

	const activeSceneId = $derived($page.params.sceneId);

	async function handleStructureAction(action: string, body: Record<string, unknown>) {
		await fetch(`/api/projects/${data.project.id}/reorder`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ action, ...body })
		});
		await invalidateAll();
	}

	function handleCreatePart(title: string) {
		handleStructureAction('create_part', { title });
	}

	function handleCreateChapter(title: string, partId?: string) {
		handleStructureAction('create_chapter', { title, part_id: partId ?? null });
	}

	function handleCreateScene(title: string, chapterId: string) {
		handleStructureAction('create_scene', { title, chapter_id: chapterId });
	}

	function handleRename(type: string, id: string, title: string) {
		handleStructureAction('rename', { type, id, title });
	}

	function handleDelete(type: string, id: string) {
		handleStructureAction('delete', { type, id });
	}
</script>

<svelte:head>
	<title>{data.project.title} — WriteTrack</title>
</svelte:head>

<div class="flex h-full gap-0 -m-6">
	<!-- Tree panel -->
	<div class="flex w-64 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
		<div class="border-b border-gray-200 px-3 py-2">
			<a href={resolve('/projects')} class="text-xs text-gray-400 hover:text-primary-600">&larr; Projects</a>
			<h2 class="mt-1 truncate text-sm font-semibold text-gray-900">{data.project.title}</h2>
		</div>

		<div class="border-b border-gray-200 px-3 py-2">
			<DraftSelector
				drafts={data.drafts}
				activeDraftId={data.activeDraft?.id ?? null}
				projectId={data.project.id}
			/>
		</div>

		<div class="flex-1 overflow-hidden">
			<ProjectTree
				projectId={data.project.id}
				structure={data.structure}
				{activeSceneId}
				oncreatepart={handleCreatePart}
				oncreatechapter={handleCreateChapter}
				oncreatescene={handleCreateScene}
				onrename={handleRename}
				ondelete={handleDelete}
			/>
		</div>
	</div>

	<!-- Content area -->
	<div class="flex-1 overflow-y-auto p-6">
		{@render children()}
	</div>
</div>
