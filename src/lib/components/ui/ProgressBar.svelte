<script lang="ts">
	let {
		value,
		max = 100,
		label
	}: {
		value: number;
		max?: number;
		label?: string;
	} = $props();

	const percentage = $derived(max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0);
</script>

<div class="w-full">
	{#if label}
		<div class="mb-1 flex items-center justify-between text-xs text-gray-600">
			<span>{label}</span>
			<span>{percentage}%</span>
		</div>
	{/if}
	<div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
		<div
			class="h-full rounded-full bg-primary-500 transition-all duration-300"
			style="width: {percentage}%"
			role="progressbar"
			aria-valuenow={value}
			aria-valuemin={0}
			aria-valuemax={max}
		></div>
	</div>
</div>
