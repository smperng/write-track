<script lang="ts">
	import type { User } from '@supabase/supabase-js';

	let { user }: { user: User | null } = $props();
</script>

<header class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
	<h1 class="text-sm font-medium text-gray-600">WriteTrack</h1>
	<div class="flex items-center gap-3">
		{#if user}
			<span class="text-sm text-gray-500">{user.email}</span>
		{:else}
			<span class="text-sm text-gray-400">Not signed in</span>
		{/if}
	</div>
</header>
