<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';

	let { collapsed = $bindable(false) }: { collapsed: boolean } = $props();

	const navItems = [
		{ route: '/' as const, label: 'Dashboard', icon: '📊' },
		{ route: '/projects' as const, label: 'Projects', icon: '📁' }
	];

	const isInProject = $derived($page.url.pathname.match(/^\/projects\/[^/]+/) !== null);
</script>

<aside
	class="flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200 {collapsed
		? 'w-16'
		: 'w-60'}"
>
	<div class="flex h-14 items-center justify-between border-b border-gray-200 px-4">
		{#if !collapsed}
			<span class="text-lg font-semibold text-primary-700">WriteTrack</span>
		{/if}
		<button
			onclick={() => (collapsed = !collapsed)}
			class="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
			aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
		>
			{collapsed ? '→' : '←'}
		</button>
	</div>

	<nav class="flex-1 space-y-1 p-2">
		{#if isInProject && !collapsed}
			<a
				href={resolve('/projects')}
				class="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
			>
				&larr; Back to Projects
			</a>
		{/if}

		{#each navItems as item (item.route)}
			<a
				href={resolve(item.route)}
				class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700"
			>
				<span>{item.icon}</span>
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>
</aside>
