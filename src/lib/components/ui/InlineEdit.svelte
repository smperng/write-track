<script lang="ts">
	let {
		value,
		onsave
	}: {
		value: string;
		onsave: (newValue: string) => void;
	} = $props();

	let editing = $state(false);
	let editValue = $state(value);
	let inputRef: HTMLInputElement | undefined = $state();

	function startEditing() {
		editValue = value;
		editing = true;
		// Focus on next tick after render
		requestAnimationFrame(() => inputRef?.focus());
	}

	function save() {
		const trimmed = editValue.trim();
		if (trimmed && trimmed !== value) {
			onsave(trimmed);
		}
		editing = false;
	}

	function cancel() {
		editing = false;
		editValue = value;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			save();
		} else if (e.key === 'Escape') {
			cancel();
		}
	}
</script>

{#if editing}
	<input
		bind:this={inputRef}
		bind:value={editValue}
		onblur={save}
		onkeydown={handleKeydown}
		class="w-full rounded border border-primary-300 px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
	/>
{:else}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<span
		ondblclick={startEditing}
		class="cursor-pointer truncate text-sm hover:text-primary-700"
		title="Double-click to edit"
	>
		{value}
	</span>
{/if}
