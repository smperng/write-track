<script lang="ts">
	let {
		placeholder = 'Title',
		onsubmit,
		oncancel
	}: {
		placeholder?: string;
		onsubmit: (title: string) => void;
		oncancel: () => void;
	} = $props();

	let title = $state('');
	let inputRef: HTMLInputElement | undefined = $state();

	$effect(() => {
		inputRef?.focus();
	});

	function handleSubmit() {
		const trimmed = title.trim();
		if (trimmed) {
			onsubmit(trimmed);
			title = '';
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === 'Escape') {
			oncancel();
		}
	}
</script>

<div class="flex items-center gap-2 py-1">
	<input
		bind:this={inputRef}
		bind:value={title}
		{placeholder}
		onkeydown={handleKeydown}
		onblur={oncancel}
		class="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
	/>
</div>
