<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { User } from '@supabase/supabase-js';

	let { user }: { user: User | null } = $props();
</script>

<header class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
	<h1 class="text-sm font-medium text-gray-600">WriteTrack</h1>
	<div class="flex items-center gap-3">
		{#if user}
			<span class="text-sm text-gray-500">{user.email}</span>
			<form method="POST" action="/api/auth/logout" use:enhance>
				<button
					type="submit"
					class="rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
				>
					Log out
				</button>
			</form>
		{:else}
			<a href={resolve('/login')} class="text-sm text-gray-600 hover:underline">Log in</a>
			<a href={resolve('/signup')} class="rounded-md bg-primary-600 px-3 py-1 text-sm text-white hover:bg-primary-700">Sign up</a>
		{/if}
	</div>
</header>
