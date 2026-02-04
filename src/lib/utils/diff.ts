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
