import { describe, it, expect } from 'vitest';
import { extractText, computeDiff } from './diff';

describe('extractText', () => {
	it('strips HTML tags', () => {
		expect(extractText('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
	});

	it('handles empty string', () => {
		expect(extractText('')).toBe('');
	});

	it('normalizes whitespace', () => {
		expect(extractText('<p>Hello</p><p>World</p>')).toBe('Hello World');
	});

	it('handles plain text', () => {
		expect(extractText('Hello world')).toBe('Hello world');
	});
});

describe('computeDiff', () => {
	it('returns equal for identical content', () => {
		const segments = computeDiff('<p>Hello world</p>', '<p>Hello world</p>');
		expect(segments).toHaveLength(1);
		expect(segments[0].type).toBe('equal');
		expect(segments[0].text).toBe('Hello world');
	});

	it('detects insertions', () => {
		const segments = computeDiff('<p>Hello</p>', '<p>Hello world</p>');
		const insertSegment = segments.find((s) => s.type === 'insert');
		expect(insertSegment).toBeDefined();
		expect(insertSegment!.text).toContain('world');
	});

	it('detects deletions', () => {
		const segments = computeDiff('<p>Hello world</p>', '<p>Hello</p>');
		const deleteSegment = segments.find((s) => s.type === 'delete');
		expect(deleteSegment).toBeDefined();
		expect(deleteSegment!.text).toContain('world');
	});

	it('handles empty inputs', () => {
		const segments = computeDiff('', '');
		expect(segments).toHaveLength(0);
	});

	it('handles complete replacement', () => {
		const segments = computeDiff('<p>foo</p>', '<p>bar</p>');
		expect(segments.some((s) => s.type === 'delete')).toBe(true);
		expect(segments.some((s) => s.type === 'insert')).toBe(true);
	});
});
