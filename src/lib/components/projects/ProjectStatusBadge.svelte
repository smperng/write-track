<script lang="ts">
	import type { ProjectStatus } from '$lib/types/database';
	import Badge from '$lib/components/ui/Badge.svelte';

	let { status }: { status: ProjectStatus } = $props();

	const statusConfig: Record<ProjectStatus, { label: string; color: 'gray' | 'blue' | 'yellow' | 'green' | 'red' }> = {
		planning: { label: 'Planning', color: 'gray' },
		drafting: { label: 'Drafting', color: 'blue' },
		revising: { label: 'Revising', color: 'yellow' },
		complete: { label: 'Complete', color: 'green' },
		on_hold: { label: 'On Hold', color: 'red' }
	};
</script>

<Badge label={statusConfig[status].label} color={statusConfig[status].color} />
