import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export interface EditorOptions {
	content?: string;
	onUpdate?: (html: string) => void;
	element?: HTMLElement;
}

export function createEditor({ content = '', onUpdate, element }: EditorOptions): Editor {
	return new Editor({
		element,
		extensions: [StarterKit],
		content,
		onUpdate: ({ editor }) => {
			onUpdate?.(editor.getHTML());
		}
	});
}

export function countWords(html: string): number {
	// Strip HTML tags and count words
	const text = html.replace(/<[^>]*>/g, ' ').trim();
	if (!text) return 0;
	return text.split(/\s+/).filter((word) => word.length > 0).length;
}

export function extractText(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
