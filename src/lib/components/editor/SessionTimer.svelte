<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as sessionStore from '$lib/stores/sessionStore';

	let elapsed = $state(0);
	let interval: ReturnType<typeof setInterval> | null = null;

	function formatTime(seconds: number): string {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = seconds % 60;

		if (h > 0) {
			return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
		}
		return `${m}:${s.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		elapsed = sessionStore.getElapsedSeconds();
		interval = setInterval(() => {
			elapsed = sessionStore.getElapsedSeconds();
		}, 1000);
	});

	onDestroy(() => {
		if (interval) clearInterval(interval);
	});
</script>

<div class="flex items-center gap-1.5 rounded bg-primary-50 px-2 py-1 text-xs text-primary-700">
	<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<circle cx="12" cy="12" r="10" stroke-width="2" />
		<polyline points="12 6 12 12 16 14" stroke-width="2" stroke-linecap="round" />
	</svg>
	<span class="font-mono">{formatTime(elapsed)}</span>
</div>
