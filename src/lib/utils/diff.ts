import DiffMatchPatch from 'diff-match-patch';

export interface DiffSegment {
	type: 'equal' | 'insert' | 'delete';
	text: string;
}

export function extractText(html: string): string {
	return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function computeDiff(oldHtml: string, newHtml: string): DiffSegment[] {
	const dmp = new DiffMatchPatch();
	const oldText = extractText(oldHtml);
	const newText = extractText(newHtml);

	const diffs = dmp.diff_main(oldText, newText);
	dmp.diff_cleanupSemantic(diffs);

	return diffs.map(([op, text]) => ({
		type: op === 0 ? 'equal' : op === 1 ? 'insert' : 'delete',
		text
	}));
}

export interface WordDelta {
	added: number;
	deleted: number;
}

function countWordsInText(text: string): number {
	const trimmed = text.trim();
	if (!trimmed) return 0;
	return trimmed.split(/\s+/).length;
}

export function calculateWordDelta(oldHtml: string, newHtml: string): WordDelta {
	const diffs = computeDiff(oldHtml, newHtml);

	let added = 0;
	let deleted = 0;

	for (const segment of diffs) {
		const wordCount = countWordsInText(segment.text);
		if (segment.type === 'insert') {
			added += wordCount;
		} else if (segment.type === 'delete') {
			deleted += wordCount;
		}
	}

	return { added, deleted };
}
