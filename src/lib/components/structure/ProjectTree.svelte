<script lang="ts">
	import { resolve } from '$app/paths';
	import { dndzone } from 'svelte-dnd-action';
	import type {
		ProjectStructure,
		PartWithChildren,
		ChapterWithScenes
	} from '$lib/types/structure';
	import TreeNode from './TreeNode.svelte';
	import StructureForm from './StructureForm.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { calculateCompletionPercentage } from '$lib/utils/format';

	const FLIP_DURATION_MS = 150;

	let {
		projectId,
		structure,
		activeSceneId,
		oncreatepart,
		oncreatechapter,
		oncreatescene,
		onrename,
		ondelete,
		onreorder
	}: {
		projectId: string;
		structure: ProjectStructure;
		activeSceneId?: string;
		oncreatepart?: (title: string) => void;
		oncreatechapter?: (title: string, partId?: string) => void;
		oncreatescene?: (title: string, chapterId: string) => void;
		onrename?: (type: string, id: string, title: string) => void;
		ondelete?: (type: string, id: string) => void;
		onreorder?: (type: string, items: { id: string; sort_order: number }[]) => void;
	} = $props();

	let addingPart = $state(false);
	let addingChapter = $state<string | boolean>(false);
	let addingScene = $state<string | false>(false);

	// Mutable local copies for DnD — synced from structure prop, writable for drag operations
	// eslint-disable-next-line svelte/prefer-writable-derived -- must be writable for svelte-dnd-action
	let localParts = $state<PartWithChildren[]>([]);
	// eslint-disable-next-line svelte/prefer-writable-derived -- must be writable for svelte-dnd-action
	let localChapters = $state<ChapterWithScenes[]>([]);

	$effect(() => {
		localParts = structure.parts.map((p) => ({
			...p,
			chapters: p.chapters.map((c) => ({ ...c, scenes: c.scenes.map((s) => ({ ...s })) }))
		}));
	});
	$effect(() => {
		localChapters = structure.chapters.map((c) => ({
			...c,
			scenes: c.scenes.map((s) => ({ ...s }))
		}));
	});

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

	function toSortedItems(items: { id: string }[]) {
		return items.map((item, i) => ({ id: item.id, sort_order: i }));
	}

	// Extract items from DnD CustomEvent
	function dndItems<T>(e: Event): T[] {
		return (e as CustomEvent<{ items: T[] }>).detail.items;
	}
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
		<!-- Parts with their chapters (DnD zone for reordering parts) -->
		<div
			use:dndzone={{ items: localParts, flipDurationMs: FLIP_DURATION_MS, type: 'part' }}
			onconsider={(e) => {
				localParts = dndItems(e);
			}}
			onfinalize={(e) => {
				localParts = dndItems(e);
				onreorder?.('part', toSortedItems(localParts));
			}}
		>
			{#each localParts as part, partIdx (part.id)}
				<div>
					<TreeNode
						label={part.title}
						depth={0}
						expandable={true}
						onrename={onrename ? (title) => onrename('part', part.id, title) : undefined}
						ondelete={ondelete ? () => ondelete('part', part.id) : undefined}
					>
						<!-- DnD zone for chapters within this part -->
						<div
							use:dndzone={{
								items: localParts[partIdx].chapters,
								flipDurationMs: FLIP_DURATION_MS,
								type: `chapter-${part.id}`
							}}
							onconsider={(e) => {
								localParts[partIdx].chapters = dndItems(e);
							}}
							onfinalize={(e) => {
								localParts[partIdx].chapters = dndItems(e);
								onreorder?.('chapter', toSortedItems(localParts[partIdx].chapters));
							}}
							class="min-h-[2px]"
						>
							{#each localParts[partIdx].chapters as chapter, chapterIdx (chapter.id)}
								<div>
									<TreeNode
										label={chapter.title}
										depth={1}
										expandable={true}
										onrename={onrename
											? (title) => onrename('chapter', chapter.id, title)
											: undefined}
										ondelete={ondelete
											? () => ondelete('chapter', chapter.id)
											: undefined}
									>
										<!-- DnD zone for scenes within this chapter -->
										<div
											use:dndzone={{
												items: localParts[partIdx].chapters[chapterIdx].scenes,
												flipDurationMs: FLIP_DURATION_MS,
												type: `scene-${chapter.id}`
											}}
											onconsider={(e) => {
												localParts[partIdx].chapters[chapterIdx].scenes =
													dndItems(e);
											}}
											onfinalize={(e) => {
												localParts[partIdx].chapters[chapterIdx].scenes =
													dndItems(e);
												onreorder?.(
													'scene',
													toSortedItems(
														localParts[partIdx].chapters[chapterIdx].scenes
													)
												);
											}}
											class="min-h-[2px]"
										>
											{#each localParts[partIdx].chapters[chapterIdx].scenes as scene (scene.id)}
												<div>
													<TreeNode
														label={scene.title}
														depth={2}
														href={resolve(
															`/projects/${projectId}/${scene.id}`
														)}
														active={scene.id === activeSceneId}
														sceneStatus={scene.status}
														onrename={onrename
															? (title) =>
																	onrename('scene', scene.id, title)
															: undefined}
														ondelete={ondelete
															? () => ondelete('scene', scene.id)
															: undefined}
													/>
												</div>
											{/each}
										</div>

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
								</div>
							{/each}
						</div>

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
				</div>
			{/each}
		</div>

		<!-- Chapters without parts (DnD zone for standalone chapters) -->
		<div
			use:dndzone={{
				items: localChapters,
				flipDurationMs: FLIP_DURATION_MS,
				type: 'standalone-chapter'
			}}
			onconsider={(e) => {
				localChapters = dndItems(e);
			}}
			onfinalize={(e) => {
				localChapters = dndItems(e);
				onreorder?.('chapter', toSortedItems(localChapters));
			}}
		>
			{#each localChapters as chapter, chapterIdx (chapter.id)}
				<div>
					<TreeNode
						label={chapter.title}
						depth={0}
						expandable={true}
						onrename={onrename
							? (title) => onrename('chapter', chapter.id, title)
							: undefined}
						ondelete={ondelete ? () => ondelete('chapter', chapter.id) : undefined}
					>
						<!-- DnD zone for scenes within standalone chapter -->
						<div
							use:dndzone={{
								items: localChapters[chapterIdx].scenes,
								flipDurationMs: FLIP_DURATION_MS,
								type: `scene-${chapter.id}`
							}}
							onconsider={(e) => {
								localChapters[chapterIdx].scenes = dndItems(e);
							}}
							onfinalize={(e) => {
								localChapters[chapterIdx].scenes = dndItems(e);
								onreorder?.(
									'scene',
									toSortedItems(localChapters[chapterIdx].scenes)
								);
							}}
							class="min-h-[2px]"
						>
							{#each localChapters[chapterIdx].scenes as scene (scene.id)}
								<div>
									<TreeNode
										label={scene.title}
										depth={1}
										href={resolve(`/projects/${projectId}/${scene.id}`)}
										active={scene.id === activeSceneId}
										sceneStatus={scene.status}
										onrename={onrename
											? (title) => onrename('scene', scene.id, title)
											: undefined}
										ondelete={ondelete
											? () => ondelete('scene', scene.id)
											: undefined}
									/>
								</div>
							{/each}
						</div>

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
				</div>
			{/each}
		</div>
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
