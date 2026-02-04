import { describe, it, expect } from 'vitest';
import { formatWordCount, formatStatus, formatSceneStatus, formatDeadline, calculateCompletionPercentage } from './format';

describe('formatWordCount', () => {
	it('formats zero', () => {
		expect(formatWordCount(0)).toBe('0 words');
	});

	it('formats small numbers', () => {
		expect(formatWordCount(500)).toBe('500 words');
	});

	it('formats large numbers with commas', () => {
		expect(formatWordCount(50000)).toBe('50,000 words');
	});

	it('formats very large numbers', () => {
		expect(formatWordCount(1234567)).toBe('1,234,567 words');
	});

	it('omits suffix when withSuffix is false', () => {
		expect(formatWordCount(1000, false)).toBe('1,000');
	});
});

describe('formatStatus', () => {
	it('formats planning', () => {
		expect(formatStatus('planning')).toBe('Planning');
	});

	it('formats drafting', () => {
		expect(formatStatus('drafting')).toBe('Drafting');
	});

	it('formats revising', () => {
		expect(formatStatus('revising')).toBe('Revising');
	});

	it('formats complete', () => {
		expect(formatStatus('complete')).toBe('Complete');
	});

	it('formats on_hold as On Hold', () => {
		expect(formatStatus('on_hold')).toBe('On Hold');
	});
});

describe('formatSceneStatus', () => {
	it('formats brainstormed', () => {
		expect(formatSceneStatus('brainstormed')).toBe('Brainstormed');
	});

	it('formats rough', () => {
		expect(formatSceneStatus('rough')).toBe('Rough');
	});

	it('formats revised', () => {
		expect(formatSceneStatus('revised')).toBe('Revised');
	});

	it('formats polished', () => {
		expect(formatSceneStatus('polished')).toBe('Polished');
	});

	it('formats final', () => {
		expect(formatSceneStatus('final')).toBe('Final');
	});
});

describe('formatDeadline', () => {
	it('shows overdue for past dates', () => {
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 3);
		expect(formatDeadline(pastDate.toISOString())).toBe('3d overdue');
	});

	it('shows "Due today" for today', () => {
		const today = new Date();
		today.setHours(23, 59, 59);
		expect(formatDeadline(today.toISOString())).toBe('Due today');
	});

	it('shows days left for near future', () => {
		const future = new Date();
		future.setDate(future.getDate() + 5);
		future.setHours(23, 59, 59);
		const result = formatDeadline(future.toISOString());
		expect(result).toMatch(/\dd left/);
	});

	it('shows date for far future', () => {
		const farFuture = new Date();
		farFuture.setDate(farFuture.getDate() + 30);
		const result = formatDeadline(farFuture.toISOString());
		expect(result).toMatch(/[A-Z][a-z]+ \d+/);
	});
});

describe('calculateCompletionPercentage', () => {
	it('returns 0 for empty array', () => {
		expect(calculateCompletionPercentage([])).toBe(0);
	});

	it('returns 0 for all brainstormed', () => {
		const scenes = [{ status: 'brainstormed' }, { status: 'brainstormed' }];
		expect(calculateCompletionPercentage(scenes)).toBe(0);
	});

	it('returns 100 for all final', () => {
		const scenes = [{ status: 'final' }, { status: 'final' }];
		expect(calculateCompletionPercentage(scenes)).toBe(100);
	});

	it('returns 50 for all revised', () => {
		const scenes = [{ status: 'revised' }, { status: 'revised' }];
		expect(calculateCompletionPercentage(scenes)).toBe(50);
	});

	it('calculates mixed statuses', () => {
		const scenes = [
			{ status: 'brainstormed' }, // 0
			{ status: 'final' }         // 1.0
		];
		expect(calculateCompletionPercentage(scenes)).toBe(50);
	});

	it('handles single scene', () => {
		expect(calculateCompletionPercentage([{ status: 'rough' }])).toBe(25);
		expect(calculateCompletionPercentage([{ status: 'polished' }])).toBe(75);
	});
});
