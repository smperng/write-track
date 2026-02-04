import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ parent }) => {
	const { project, drafts, activeDraft, structure } = await parent();
	return { project, drafts, activeDraft, structure };
};

export const actions: Actions = {
	update: async ({ request, params, locals: { supabase, safeGetSession } }) => {
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

		const { error } = await supabase
			.from('projects')
			.update({
				title: title.trim(),
				description,
				status,
				genre,
				target_word_count,
				deadline
			})
			.eq('id', params.projectId)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to update project' });
		}

		return { success: true };
	},

	create_draft: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const sourceDraftId = formData.get('source_draft_id') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Draft name is required' });
		}

		// Deactivate current active draft
		await supabase
			.from('drafts')
			.update({ is_active: false })
			.eq('project_id', params.projectId)
			.eq('is_active', true);

		// Create new draft
		const { data: newDraft, error: draftError } = await supabase
			.from('drafts')
			.insert({
				user_id: user.id,
				project_id: params.projectId,
				name: name.trim(),
				is_active: true
			})
			.select()
			.single();

		if (draftError || !newDraft) {
			return fail(500, { error: 'Failed to create draft' });
		}

		// Duplicate scenes from source draft if provided
		if (sourceDraftId) {
			const { data: sourceScenes } = await supabase
				.from('scenes')
				.select('*')
				.eq('draft_id', sourceDraftId);

			if (sourceScenes && sourceScenes.length > 0) {
				const newScenes = sourceScenes.map((scene) => ({
					user_id: user.id,
					chapter_id: scene.chapter_id,
					draft_id: newDraft.id,
					title: scene.title,
					content: scene.content,
					word_count: scene.word_count,
					status: scene.status,
					sort_order: scene.sort_order
				}));

				await supabase.from('scenes').insert(newScenes);
			}
		}

		return { success: true };
	},

	switch_draft: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const draftId = formData.get('draft_id') as string;

		// Deactivate all drafts for this project
		await supabase
			.from('drafts')
			.update({ is_active: false })
			.eq('project_id', params.projectId)
			.eq('user_id', user.id);

		// Activate selected draft
		const { error } = await supabase
			.from('drafts')
			.update({ is_active: true })
			.eq('id', draftId)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to switch draft' });
		}

		return { success: true };
	},

	rename_draft: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const draftId = formData.get('draft_id') as string;
		const name = formData.get('name') as string;

		if (!name?.trim()) {
			return fail(400, { error: 'Draft name is required' });
		}

		const { error } = await supabase
			.from('drafts')
			.update({ name: name.trim() })
			.eq('id', draftId)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to rename draft' });
		}

		return { success: true };
	},

	update_draft_notes: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const draftId = formData.get('draft_id') as string;
		const notes = formData.get('notes') as string;

		const { error } = await supabase
			.from('drafts')
			.update({ notes: notes || null })
			.eq('id', draftId)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to update draft notes' });
		}

		return { success: true };
	},

	delete_draft: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const draftId = formData.get('draft_id') as string;

		const { error } = await supabase
			.from('drafts')
			.delete()
			.eq('id', draftId)
			.eq('user_id', user.id);

		if (error) {
			return fail(500, { error: 'Failed to delete draft' });
		}

		// If we deleted the active draft, activate the first remaining one
		const { data: remaining } = await supabase
			.from('drafts')
			.select('id')
			.eq('project_id', params.projectId)
			.order('created_at', { ascending: true })
			.limit(1);

		if (remaining && remaining.length > 0) {
			await supabase
				.from('drafts')
				.update({ is_active: true })
				.eq('id', remaining[0].id);
		}

		return { success: true };
	}
};
