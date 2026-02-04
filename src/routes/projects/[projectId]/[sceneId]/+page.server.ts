import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	params,
	parent,
	locals: { supabase, safeGetSession }
}) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const { project } = await parent();

	const { data: scene, error: sceneError } = await supabase
		.from('scenes')
		.select('*')
		.eq('id', params.sceneId)
		.single();

	if (sceneError || !scene) throw error(404, 'Scene not found');

	return {
		scene,
		project
	};
};

export const actions: Actions = {
	update_status: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const status = formData.get('status') as string;

		const { error: updateError } = await supabase
			.from('scenes')
			.update({ status })
			.eq('id', params.sceneId)
			.eq('user_id', user.id);

		if (updateError) {
			return fail(500, { error: 'Failed to update status' });
		}

		return { success: true };
	},

	create_snapshot: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const label = formData.get('label') as string;
		const description = (formData.get('description') as string) || null;

		if (!label?.trim()) {
			return fail(400, { error: 'Snapshot label is required' });
		}

		// Get current scene content
		const { data: scene } = await supabase
			.from('scenes')
			.select('content, word_count, draft_id')
			.eq('id', params.sceneId)
			.single();

		if (!scene) {
			return fail(404, { error: 'Scene not found' });
		}

		const { error: insertError } = await supabase.from('snapshots').insert({
			user_id: user.id,
			scene_id: params.sceneId,
			draft_id: scene.draft_id,
			content: scene.content,
			word_count: scene.word_count,
			label: label.trim(),
			description
		});

		if (insertError) {
			return fail(500, { error: 'Failed to create snapshot' });
		}

		return { success: true };
	}
};
