<script lang="ts">
	let {
		color = 'gray',
		label
	}: {
		color?: 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
		label: string;
	} = $props();

	const colorClasses: Record<string, string> = {
		gray: 'bg-gray-100 text-gray-700',
		blue: 'bg-blue-100 text-blue-700',
		green: 'bg-green-100 text-green-700',
		yellow: 'bg-yellow-100 text-yellow-700',
		red: 'bg-red-100 text-red-700',
		purple: 'bg-purple-100 text-purple-700',
		indigo: 'bg-indigo-100 text-indigo-700'
	};
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {colorClasses[color]}">
	{label}
</span>
