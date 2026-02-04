import type { SceneStatus } from './database';

export interface SceneTreeItem {
	id: string;
	title: string;
	word_count: number;
	status: SceneStatus;
	sort_order: number;
}

export interface ChapterWithScenes {
	id: string;
	title: string;
	sort_order: number;
	part_id: string | null;
	scenes: SceneTreeItem[];
}

export interface PartWithChildren {
	id: string;
	title: string;
	sort_order: number;
	chapters: ChapterWithScenes[];
}

export interface ProjectStructure {
	parts: PartWithChildren[];
	chapters: ChapterWithScenes[];
}

export const SCENE_STATUS_WEIGHTS: Record<SceneStatus, number> = {
	brainstormed: 0,
	rough: 0.25,
	revised: 0.5,
	polished: 0.75,
	final: 1.0
};
