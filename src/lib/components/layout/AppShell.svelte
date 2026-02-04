<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { User } from '@supabase/supabase-js';
	import Sidebar from './Sidebar.svelte';
	import Topbar from './Topbar.svelte';

	let { children, user }: { children: Snippet; user: User | null } = $props();

	let sidebarCollapsed = $state(false);
</script>

<div class="flex h-screen overflow-hidden bg-gray-50">
	<Sidebar bind:collapsed={sidebarCollapsed} />

	<div class="flex flex-1 flex-col overflow-hidden">
		<Topbar {user} />

		<main class="flex-1 overflow-y-auto p-6">
			{@render children()}
		</main>
	</div>
</div>
