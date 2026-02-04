<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import AppShell from '$lib/components/layout/AppShell.svelte';
	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();

	let isAuthPage = $derived(
		$page.url.pathname === '/login' || $page.url.pathname === '/signup'
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isAuthPage}
	{@render children()}
{:else}
	<AppShell user={data.user}>
		{@render children()}
	</AppShell>
{/if}
