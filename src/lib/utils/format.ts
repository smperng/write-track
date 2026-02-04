import type { ProjectStatus, SceneStatus } from '$lib/types/database';
import { SCENE_STATUS_WEIGHTS } from '$lib/types/structure';

/**
 * Format a word count with comma separators and optional "words" suffix.
 */
export function formatWordCount(count: number, withSuffix = true): string {
	const formatted = count.toLocaleString('en-US');
	return withSuffix ? `${formatted} words` : formatted;
}

/**
 * Format a project status enum value as a human-readable label.
 */
export function formatStatus(status: ProjectStatus): string {
	const labels: Record<ProjectStatus, string> = {
		planning: 'Planning',
		drafting: 'Drafting',
		revising: 'Revising',
		complete: 'Complete',
		on_hold: 'On Hold'
	};
	return labels[status];
}

/**
 * Format a scene status enum value as a human-readable label.
 */
export function formatSceneStatus(status: SceneStatus): string {
	const labels: Record<SceneStatus, string> = {
		brainstormed: 'Brainstormed',
		rough: 'Rough',
		revised: 'Revised',
		polished: 'Polished',
		final: 'Final'
	};
	return labels[status];
}

/**
 * Format a deadline date string as a human-readable label.
 */
export function formatDeadline(deadline: string): string {
	const date = new Date(deadline);
	const now = new Date();

	// Compare by calendar date (ignoring time)
	const deadlineDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const diffDays = Math.round((deadlineDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return `${Math.abs(diffDays)}d overdue`;
	} else if (diffDays === 0) {
		return 'Due today';
	} else if (diffDays <= 7) {
		return `${diffDays}d left`;
	} else {
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}
}

/**
 * Calculate completion percentage from an array of scenes based on their status weights.
 * Returns a number from 0 to 100.
 */
export function calculateCompletionPercentage(
	scenes: { status: string }[]
): number {
	if (scenes.length === 0) return 0;

	const totalWeight = scenes.reduce((sum, scene) => {
		return sum + (SCENE_STATUS_WEIGHTS[scene.status as SceneStatus] ?? 0);
	}, 0);

	return Math.round((totalWeight / scenes.length) * 100);
}
