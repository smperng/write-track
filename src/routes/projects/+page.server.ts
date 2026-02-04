import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) return { projects: [], wordCounts: {}, completionPercentages: {} };

	const { data: projects } = await supabase
		.from('projects')
		.select('*')
		.is('archived_at', null)
		.order('updated_at', { ascending: false });

	// Get word counts from active drafts' scenes
	const wordCounts: Record<string, number> = {};
	const completionPercentages: Record<string, number> = {};

	if (projects && projects.length > 0) {
		const projectIds = projects.map((p) => p.id);

		// Get active drafts for all projects
		const { data: activeDrafts } = await supabase
			.from('drafts')
			.select('id, project_id')
			.in('project_id', projectIds)
			.eq('is_active', true);

		if (activeDrafts && activeDrafts.length > 0) {
			const draftIds = activeDrafts.map((d) => d.id);
			const draftToProject = Object.fromEntries(activeDrafts.map((d) => [d.id, d.project_id]));

			const { data: scenes } = await supabase
				.from('scenes')
				.select('draft_id, word_count, status')
				.in('draft_id', draftIds);

			if (scenes) {
				const statusWeights: Record<string, number> = {
					brainstormed: 0,
					rough: 0.25,
					revised: 0.5,
					polished: 0.75,
					final: 1.0
				};

				const projectScenes: Record<string, { totalWords: number; totalWeight: number; count: number }> = {};

				for (const scene of scenes) {
					const projectId = draftToProject[scene.draft_id];
					if (!projectScenes[projectId]) {
						projectScenes[projectId] = { totalWords: 0, totalWeight: 0, count: 0 };
					}
					projectScenes[projectId].totalWords += scene.word_count;
					projectScenes[projectId].totalWeight += statusWeights[scene.status] ?? 0;
					projectScenes[projectId].count += 1;
				}

				for (const [projectId, data] of Object.entries(projectScenes)) {
					wordCounts[projectId] = data.totalWords;
					completionPercentages[projectId] =
						data.count > 0 ? Math.round((data.totalWeight / data.count) * 100) : 0;
				}
			}
		}
	}

	return {
		projects: projects ?? [],
		wordCounts,
		completionPercentages
	};
};

export const actions: Actions = {
	create: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = (formData.get('description') as string) || null;
		const status = (formData.get('status') as string) || 'planning';
		const genre = (formData.get('genre') as string) || null;
		const targetStr = formData.get('target_word_count') as string;
		const target_word_count = targetStr ? parseInt(targetStr, 10) : null;
		const deadlineStr = formData.get('deadline') as string;
		const deadline = deadlineStr || null;

		if (!title?.trim()) {
			return fail(400, { error: 'Title is required' });
		}

		const { data: project, error } = await supabase
			.from('projects')
			.insert({
				user_id: user.id,
				title: title.trim(),
				description,
				status,
				genre,
				target_word_count,
				deadline
			})
			.select()
			.single();

		if (error) {
			return fail(500, { error: 'Failed to create project' });
		}

		// Create a default "First Draft" for the new project
		await supabase.from('drafts').insert({
			user_id: user.id,
			project_id: project.id,
			name: 'First Draft',
			is_active: true
		});

		redirect(303, `/projects/${project.id}`);
	},

	archive: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabase
			.from('projects')
			.update({ archived_at: new Date().toISOString() })
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to archive project' });
		}

		return { success: true };
	},

	delete: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const id = formData.get('id') as string;

		const { error } = await supabase
			.from('projects')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete project' });
		}

		return { success: true };
	}
};
