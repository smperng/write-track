<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children
	}: {
		children: Snippet;
	} = $props();

	let isOpen = $state(false);
	let menuRef: HTMLDivElement | undefined = $state();

	function toggle(e: MouseEvent) {
		e.stopPropagation();
		isOpen = !isOpen;
	}

	function handleClickOutside(e: MouseEvent) {
		if (menuRef && !menuRef.contains(e.target as Node)) {
			isOpen = false;
		}
	}

	function handleItemClick() {
		isOpen = false;
	}
</script>

<svelte:window onclick={handleClickOutside} />

<div class="relative" bind:this={menuRef}>
	<button
		onclick={toggle}
		class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
		aria-label="Actions"
		aria-expanded={isOpen}
	>
		&#x22EE;
	</button>

	{#if isOpen}
		<div
			class="absolute right-0 z-40 mt-1 min-w-[160px] rounded-md border border-gray-200 bg-white py-1 shadow-lg"
			onclick={handleItemClick}
			onkeydown={(e) => e.key === 'Escape' && (isOpen = false)}
			role="menu"
			tabindex="-1"
		>
			{@render children()}
		</div>
	{/if}
</div>
