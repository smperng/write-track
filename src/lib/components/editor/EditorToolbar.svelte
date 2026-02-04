<script lang="ts">
	import type { Editor } from '@tiptap/core';

	let { editor }: { editor: Editor | null } = $props();
</script>

{#if editor}
	<div class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 px-3 py-2">
		<button
			onclick={() => editor?.chain().focus().toggleBold().run()}
			class="rounded px-2 py-1 text-sm font-bold {editor.isActive('bold')
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Bold"
		>
			B
		</button>

		<button
			onclick={() => editor?.chain().focus().toggleItalic().run()}
			class="rounded px-2 py-1 text-sm italic {editor.isActive('italic')
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Italic"
		>
			I
		</button>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<button
			onclick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
			class="rounded px-2 py-1 text-sm {editor.isActive('heading', { level: 2 })
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Heading 2"
		>
			H2
		</button>

		<button
			onclick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
			class="rounded px-2 py-1 text-sm {editor.isActive('heading', { level: 3 })
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Heading 3"
		>
			H3
		</button>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<button
			onclick={() => editor?.chain().focus().toggleBulletList().run()}
			class="rounded px-2 py-1 text-sm {editor.isActive('bulletList')
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Bullet List"
		>
			&#8226; List
		</button>

		<button
			onclick={() => editor?.chain().focus().toggleOrderedList().run()}
			class="rounded px-2 py-1 text-sm {editor.isActive('orderedList')
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Ordered List"
		>
			1. List
		</button>

		<button
			onclick={() => editor?.chain().focus().toggleBlockquote().run()}
			class="rounded px-2 py-1 text-sm {editor.isActive('blockquote')
				? 'bg-primary-100 text-primary-700'
				: 'text-gray-600 hover:bg-gray-200'}"
			title="Blockquote"
		>
			&#x201C;
		</button>

		<div class="mx-1 h-5 w-px bg-gray-300"></div>

		<button
			onclick={() => editor?.chain().focus().undo().run()}
			disabled={!editor.can().undo()}
			class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-30"
			title="Undo"
		>
			&#x21A9;
		</button>

		<button
			onclick={() => editor?.chain().focus().redo().run()}
			disabled={!editor.can().redo()}
			class="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-30"
			title="Redo"
		>
			&#x21AA;
		</button>
	</div>
{/if}
