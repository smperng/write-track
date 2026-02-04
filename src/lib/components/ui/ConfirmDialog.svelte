<script lang="ts">
	let {
		open = $bindable(false),
		title,
		message,
		confirmLabel = 'Confirm',
		variant = 'danger',
		onconfirm
	}: {
		open: boolean;
		title: string;
		message: string;
		confirmLabel?: string;
		variant?: 'danger' | 'warning';
		onconfirm: () => void;
	} = $props();

	function handleConfirm() {
		onconfirm();
		open = false;
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			open = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false;
		}
	}

	const btnClass = $derived(
		variant === 'danger'
			? 'bg-red-600 hover:bg-red-700 text-white'
			: 'bg-yellow-600 hover:bg-yellow-700 text-white'
	);
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
	>
		<div
			class="mx-4 w-full max-w-sm rounded-lg bg-white shadow-xl"
			role="alertdialog"
			aria-modal="true"
			aria-label={title}
		>
			<div class="px-6 py-4">
				<h2 class="text-lg font-semibold text-gray-900">{title}</h2>
				<p class="mt-2 text-sm text-gray-600">{message}</p>
			</div>
			<div class="flex justify-end gap-3 border-t border-gray-200 px-6 py-3">
				<button
					onclick={() => (open = false)}
					class="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
				>
					Cancel
				</button>
				<button
					onclick={handleConfirm}
					class="rounded-md px-4 py-2 text-sm font-medium {btnClass}"
				>
					{confirmLabel}
				</button>
			</div>
		</div>
	</div>
{/if}
