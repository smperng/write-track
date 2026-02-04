<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import SceneEditor from '$lib/components/editor/SceneEditor.svelte';
	import SnapshotCreate from '$lib/components/drafts/SnapshotCreate.svelte';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex h-full flex-col gap-4">
	<div class="flex-1">
		<SceneEditor
			scene={data.scene}
			projectId={data.project.id}
			targetWordCount={data.project.target_word_count}
			onsave={() => invalidateAll()}
		/>
	</div>

	<div class="flex items-center justify-between">
		<SnapshotCreate sceneId={data.scene.id} />
		<a
			href={resolve(`/projects/${data.project.id}/${data.scene.id}/snapshots`)}
			class="text-sm text-primary-600 hover:text-primary-700"
		>
			View Snapshots
		</a>
	</div>
</div>
