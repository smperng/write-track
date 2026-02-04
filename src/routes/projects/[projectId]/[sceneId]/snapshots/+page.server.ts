import type { PageServerLoad, Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	params,
	locals: { supabase, safeGetSession }
}) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	// Load scene
	const { data: scene } = await supabase
		.from('scenes')
		.select('*')
		.eq('id', params.sceneId)
		.single();

	if (!scene) throw error(404, 'Scene not found');

	// Load snapshots
	const { data: snapshots } = await supabase
		.from('snapshots')
		.select('*')
		.eq('scene_id', params.sceneId)
		.order('created_at', { ascending: false });

	return {
		scene,
		snapshots: snapshots ?? [],
		projectId: params.projectId
	};
};

export const actions: Actions = {
	restore: async ({ request, params, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const snapshotId = formData.get('snapshot_id') as string;

		const { data: snapshot } = await supabase
			.from('snapshots')
			.select('content, word_count')
			.eq('id', snapshotId)
			.single();

		if (!snapshot) {
			return fail(404, { error: 'Snapshot not found' });
		}

		const { error: updateError } = await supabase
			.from('scenes')
			.update({
				content: snapshot.content,
				word_count: snapshot.word_count
			})
			.eq('id', params.sceneId)
			.eq('user_id', user.id);

		if (updateError) {
			return fail(500, { error: 'Failed to restore snapshot' });
		}

		return { success: true };
	},

	delete_snapshot: async ({ request, locals: { supabase, safeGetSession } }) => {
		const { user } = await safeGetSession();
		if (!user) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const snapshotId = formData.get('snapshot_id') as string;

		const { error: deleteError } = await supabase
			.from('snapshots')
			.delete()
			.eq('id', snapshotId)
			.eq('user_id', user.id);

		if (deleteError) {
			return fail(500, { error: 'Failed to delete snapshot' });
		}

		return { success: true };
	}
};
