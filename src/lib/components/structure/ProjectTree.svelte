<script lang="ts">
	import { resolve } from '$app/paths';
	import type { ProjectStructure } from '$lib/types/structure';
	import TreeNode from './TreeNode.svelte';
	import StructureForm from './StructureForm.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { calculateCompletionPercentage } from '$lib/utils/format';

	let {
		projectId,
		structure,
		activeSceneId,
		oncreatepart,
		oncreatechapter,
		oncreatescene,
		onrename,
		ondelete
	}: {
		projectId: string;
		structure: ProjectStructure;
		activeSceneId?: string;
		oncreatepart?: (title: string) => void;
		oncreatechapter?: (title: string, partId?: string) => void;
		oncreatescene?: (title: string, chapterId: string) => void;
		onrename?: (type: string, id: string, title: string) => void;
		ondelete?: (type: string, id: string) => void;
	} = $props();

	let addingPart = $state(false);
	let addingChapter = $state<string | boolean>(false);
	let addingScene = $state<string | false>(false);

	// Collect all scenes for completion calculation
	const allScenes = $derived(() => {
		const scenes: { status: string }[] = [];
		for (const part of structure.parts) {
			for (const chapter of part.chapters) {
				for (const scene of chapter.scenes) {
					scenes.push(scene);
				}
			}
		}
		for (const chapter of structure.chapters) {
			for (const scene of chapter.scenes) {
				scenes.push(scene);
			}
		}
		return scenes;
	});

	const completionPct = $derived(calculateCompletionPercentage(allScenes()));
</script>

<div class="flex h-full flex-col overflow-hidden">
	<div class="border-b border-gray-200 px-3 py-2">
		<div class="mb-2 flex items-center justify-between">
			<span class="text-xs font-semibold uppercase tracking-wider text-gray-500">Structure</span>
		</div>
		{#if allScenes().length > 0}
			<ProgressBar value={completionPct} label="Completion" />
		{/if}
	</div>

	<div class="flex-1 overflow-y-auto py-2">
		<!-- Parts with their chapters -->
		{#each structure.parts as part (part.id)}
			<TreeNode
				label={part.title}
				depth={0}
				expandable={true}
				onrename={onrename ? (title) => onrename('part', part.id, title) : undefined}
				ondelete={ondelete ? () => ondelete('part', part.id) : undefined}
			>
				{#each part.chapters as chapter (chapter.id)}
					<TreeNode
						label={chapter.title}
						depth={1}
						expandable={true}
						onrename={onrename ? (title) => onrename('chapter', chapter.id, title) : undefined}
						ondelete={ondelete ? () => ondelete('chapter', chapter.id) : undefined}
					>
						{#each chapter.scenes as scene (scene.id)}
							<TreeNode
								label={scene.title}
								depth={2}
								href={resolve(`/projects/${projectId}/${scene.id}`)}
								active={scene.id === activeSceneId}
								sceneStatus={scene.status}
								onrename={onrename ? (title) => onrename('scene', scene.id, title) : undefined}
								ondelete={ondelete ? () => ondelete('scene', scene.id) : undefined}
							/>
						{/each}

						{#if addingScene === chapter.id}
							<div style="padding-left: 32px">
								<StructureForm
									placeholder="Scene title"
									onsubmit={(title) => {
										oncreatescene?.(title, chapter.id);
										addingScene = false;
									}}
									oncancel={() => (addingScene = false)}
								/>
							</div>
						{:else}
							<button
								onclick={() => (addingScene = chapter.id)}
								class="ml-8 mt-1 text-xs text-gray-400 hover:text-primary-600"
							>
								+ Scene
							</button>
						{/if}
					</TreeNode>
				{/each}

				{#if addingChapter === part.id}
					<div style="padding-left: 16px">
						<StructureForm
							placeholder="Chapter title"
							onsubmit={(title) => {
								oncreatechapter?.(title, part.id);
								addingChapter = false;
							}}
							oncancel={() => (addingChapter = false)}
						/>
					</div>
				{:else}
					<button
						onclick={() => (addingChapter = part.id)}
						class="ml-4 mt-1 text-xs text-gray-400 hover:text-primary-600"
					>
						+ Chapter
					</button>
				{/if}
			</TreeNode>
		{/each}

		<!-- Chapters without parts -->
		{#each structure.chapters as chapter (chapter.id)}
			<TreeNode
				label={chapter.title}
				depth={0}
				expandable={true}
				onrename={onrename ? (title) => onrename('chapter', chapter.id, title) : undefined}
				ondelete={ondelete ? () => ondelete('chapter', chapter.id) : undefined}
			>
				{#each chapter.scenes as scene (scene.id)}
					<TreeNode
						label={scene.title}
						depth={1}
						href={resolve(`/projects/${projectId}/${scene.id}`)}
						active={scene.id === activeSceneId}
						sceneStatus={scene.status}
						onrename={onrename ? (title) => onrename('scene', scene.id, title) : undefined}
						ondelete={ondelete ? () => ondelete('scene', scene.id) : undefined}
					/>
				{/each}

				{#if addingScene === chapter.id}
					<div style="padding-left: 16px">
						<StructureForm
							placeholder="Scene title"
							onsubmit={(title) => {
								oncreatescene?.(title, chapter.id);
								addingScene = false;
							}}
							oncancel={() => (addingScene = false)}
						/>
					</div>
				{:else}
					<button
						onclick={() => (addingScene = chapter.id)}
						class="ml-4 mt-1 text-xs text-gray-400 hover:text-primary-600"
					>
						+ Scene
					</button>
				{/if}
			</TreeNode>
		{/each}
	</div>

	<!-- Add buttons at bottom -->
	<div class="border-t border-gray-200 px-3 py-2 space-y-1">
		{#if addingPart}
			<StructureForm
				placeholder="Part title"
				onsubmit={(title) => {
					oncreatepart?.(title);
					addingPart = false;
				}}
				oncancel={() => (addingPart = false)}
			/>
		{:else}
			<button
				onclick={() => (addingPart = true)}
				class="block w-full text-left text-xs text-gray-400 hover:text-primary-600"
			>
				+ Part
			</button>
		{/if}

		{#if addingChapter === true}
			<StructureForm
				placeholder="Chapter title"
				onsubmit={(title) => {
					oncreatechapter?.(title);
					addingChapter = false;
				}}
				oncancel={() => (addingChapter = false)}
			/>
		{:else}
			<button
				onclick={() => (addingChapter = true)}
				class="block w-full text-left text-xs text-gray-400 hover:text-primary-600"
			>
				+ Chapter (no part)
			</button>
		{/if}
	</div>
</div>
