<script lang="ts">
	import type { SceneStatus } from '$lib/types/database';
	import Badge from './Badge.svelte';

	let { status }: { status: SceneStatus } = $props();

	const statusConfig: Record<SceneStatus, { label: string; color: 'gray' | 'blue' | 'yellow' | 'purple' | 'green' }> = {
		brainstormed: { label: 'Brainstormed', color: 'gray' },
		rough: { label: 'Rough', color: 'blue' },
		revised: { label: 'Revised', color: 'yellow' },
		polished: { label: 'Polished', color: 'purple' },
		final: { label: 'Final', color: 'green' }
	};
</script>

<Badge label={statusConfig[status].label} color={statusConfig[status].color} />
