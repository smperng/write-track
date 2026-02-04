<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { Editor } from '@tiptap/core';
	import type { SceneStatus, Database } from '$lib/types/database';
	import { createEditor, countWords } from './tiptap';
	import EditorToolbar from './EditorToolbar.svelte';
	import WordCounter from './WordCounter.svelte';
	import SceneStatusBadge from '$lib/components/ui/SceneStatusBadge.svelte';

	type Scene = Database['public']['Tables']['scenes']['Row'];

	let {
		scene,
		projectId,
		targetWordCount,
		onsave
	}: {
		scene: Scene;
		projectId: string;
		targetWordCount?: number | null;
		onsave?: () => void;
	} = $props();

	let editor: Editor | null = $state(null);
	let editorElement: HTMLDivElement | undefined = $state();
	let wordCount = $state(scene.word_count);
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	let saving = $state(false);
	let status: SceneStatus = $state(scene.status);

	const statuses: SceneStatus[] = ['brainstormed', 'rough', 'revised', 'polished', 'final'];

	async function autoSave(html: string) {
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			saving = true;
			try {
				const wc = countWords(html);
				await fetch(`/api/projects/${projectId}/scenes/${scene.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content: html, word_count: wc })
				});
				wordCount = wc;
				onsave?.();
			} finally {
				saving = false;
			}
		}, 1000);
	}

	async function updateStatus(newStatus: SceneStatus) {
		status = newStatus;
		await fetch(`/api/projects/${projectId}/scenes/${scene.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: newStatus })
		});
		onsave?.();
	}

	onMount(() => {
		if (editorElement) {
			editor = createEditor({
				content: scene.content,
				element: editorElement,
				onUpdate: (html) => {
					wordCount = countWords(html);
					autoSave(html);
				}
			});
		}
	});

	onDestroy(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
		editor?.destroy();
	});
</script>

<div class="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
	<div class="flex items-center justify-between border-b border-gray-200 px-4 py-2">
		<div class="flex items-center gap-3">
			<h2 class="text-sm font-semibold text-gray-900">{scene.title}</h2>
			<SceneStatusBadge {status} />
			{#if saving}
				<span class="text-xs text-gray-400">Saving...</span>
			{/if}
		</div>
		<div class="flex items-center gap-3">
			<select
				value={status}
				onchange={(e) => updateStatus(e.currentTarget.value as SceneStatus)}
				class="rounded border border-gray-300 px-2 py-1 text-xs"
			>
				{#each statuses as s (s)}
					<option value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
				{/each}
			</select>
			<WordCounter count={wordCount} target={targetWordCount} />
		</div>
	</div>

	<EditorToolbar {editor} />

	<div bind:this={editorElement} class="prose prose-sm max-w-none flex-1 overflow-y-auto p-4"></div>
</div>
