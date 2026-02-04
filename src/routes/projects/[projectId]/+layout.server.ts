import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { ProjectStructure, ChapterWithScenes, PartWithChildren } from '$lib/types/structure';

export const load: LayoutServerLoad = async ({
	params,
	locals: { supabase, safeGetSession }
}) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	// Load project
	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('*')
		.eq('id', params.projectId)
		.single();

	if (projectError || !project) throw error(404, 'Project not found');

	// Load drafts
	const { data: drafts } = await supabase
		.from('drafts')
		.select('*')
		.eq('project_id', params.projectId)
		.order('created_at', { ascending: true });

	const activeDraft = drafts?.find((d) => d.is_active) ?? drafts?.[0] ?? null;

	// Load parts
	const { data: parts } = await supabase
		.from('parts')
		.select('*')
		.eq('project_id', params.projectId)
		.order('sort_order', { ascending: true });

	// Load chapters
	const { data: chapters } = await supabase
		.from('chapters')
		.select('*')
		.eq('project_id', params.projectId)
		.order('sort_order', { ascending: true });

	// Load scenes for active draft
	let scenes: { id: string; chapter_id: string; title: string; word_count: number; status: string; sort_order: number }[] = [];
	if (activeDraft) {
		const { data: sceneData } = await supabase
			.from('scenes')
			.select('id, chapter_id, title, word_count, status, sort_order')
			.eq('draft_id', activeDraft.id)
			.order('sort_order', { ascending: true });
		scenes = sceneData ?? [];
	}

	// Build tree structure
	const scenesByChapter = new Map<string, typeof scenes>();
	for (const scene of scenes) {
		if (!scenesByChapter.has(scene.chapter_id)) {
			scenesByChapter.set(scene.chapter_id, []);
		}
		scenesByChapter.get(scene.chapter_id)!.push(scene);
	}

	const chaptersByPart = new Map<string | null, typeof chapters>();
	for (const chapter of chapters ?? []) {
		const key = chapter.part_id;
		if (!chaptersByPart.has(key)) {
			chaptersByPart.set(key, []);
		}
		chaptersByPart.get(key)!.push(chapter);
	}

	function buildChapter(ch: NonNullable<typeof chapters>[number]): ChapterWithScenes {
		return {
			id: ch.id,
			title: ch.title,
			sort_order: ch.sort_order,
			part_id: ch.part_id,
			scenes: (scenesByChapter.get(ch.id) ?? []).map((s) => ({
				id: s.id,
				title: s.title,
				word_count: s.word_count,
				status: s.status as 'brainstormed' | 'rough' | 'revised' | 'polished' | 'final',
				sort_order: s.sort_order
			}))
		};
	}

	const structure: ProjectStructure = {
		parts: (parts ?? []).map((part): PartWithChildren => ({
			id: part.id,
			title: part.title,
			sort_order: part.sort_order,
			chapters: (chaptersByPart.get(part.id) ?? []).map(buildChapter)
		})),
		chapters: (chaptersByPart.get(null) ?? []).map(buildChapter)
	};

	return {
		project,
		drafts: drafts ?? [],
		activeDraft,
		structure
	};
};
