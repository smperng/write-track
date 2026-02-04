<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SceneStatus } from '$lib/types/database';
	import InlineEdit from '$lib/components/ui/InlineEdit.svelte';
	import SceneStatusBadge from '$lib/components/ui/SceneStatusBadge.svelte';
	import DropdownMenu from '$lib/components/ui/DropdownMenu.svelte';

	let {
		label,
		depth = 0,
		expandable = false,
		expanded = $bindable(true),
		href,
		active = false,
		sceneStatus,
		onrename,
		ondelete,
		children
	}: {
		label: string;
		depth?: number;
		expandable?: boolean;
		expanded?: boolean;
		href?: string;
		active?: boolean;
		sceneStatus?: SceneStatus;
		onrename?: (newTitle: string) => void;
		ondelete?: () => void;
		children?: Snippet;
	} = $props();
</script>

<div class="group" style="padding-left: {depth * 16}px">
	<div
		class="flex items-center gap-1 rounded px-2 py-1 text-sm {active
			? 'bg-primary-50 text-primary-700'
			: 'text-gray-700 hover:bg-gray-100'}"
	>
		{#if expandable}
			<button
				onclick={() => (expanded = !expanded)}
				class="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:text-gray-600"
				aria-label={expanded ? 'Collapse' : 'Expand'}
			>
				{expanded ? '&#9660;' : '&#9654;'}
			</button>
		{:else}
			<span class="inline-block w-5"></span>
		{/if}

		<div class="flex min-w-0 flex-1 items-center gap-2">
			{#if href}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- dynamic path from parent -->
				<a href={href} class="min-w-0 flex-1 truncate">
					{#if onrename}
						<InlineEdit value={label} onsave={onrename} />
					{:else}
						{label}
					{/if}
				</a>
			{:else}
				<div class="min-w-0 flex-1 truncate">
					{#if onrename}
						<InlineEdit value={label} onsave={onrename} />
					{:else}
						{label}
					{/if}
				</div>
			{/if}

			{#if sceneStatus}
				<SceneStatusBadge status={sceneStatus} />
			{/if}
		</div>

		{#if ondelete}
			<div class="opacity-0 group-hover:opacity-100">
				<DropdownMenu>
					<button
						onclick={ondelete}
						class="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
						role="menuitem"
					>
						Delete
					</button>
				</DropdownMenu>
			</div>
		{/if}
	</div>

	{#if expandable && expanded && children}
		{@render children()}
	{/if}
</div>
