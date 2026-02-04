import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ params, request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();
	const { action } = body;

	switch (action) {
		case 'create_part': {
			const { title } = body;
			// Get max sort order
			const { data: existing } = await supabase
				.from('parts')
				.select('sort_order')
				.eq('project_id', params.projectId)
				.order('sort_order', { ascending: false })
				.limit(1);

			const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

			const { error: insertError } = await supabase.from('parts').insert({
				user_id: user.id,
				project_id: params.projectId,
				title,
				sort_order: sortOrder
			});

			if (insertError) throw error(500, 'Failed to create part');
			break;
		}

		case 'create_chapter': {
			const { title, part_id } = body;
			const { data: existing } = await supabase
				.from('chapters')
				.select('sort_order')
				.eq('project_id', params.projectId)
				.order('sort_order', { ascending: false })
				.limit(1);

			const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

			const { error: insertError } = await supabase.from('chapters').insert({
				user_id: user.id,
				project_id: params.projectId,
				part_id: part_id || null,
				title,
				sort_order: sortOrder
			});

			if (insertError) throw error(500, 'Failed to create chapter');
			break;
		}

		case 'create_scene': {
			const { title, chapter_id } = body;

			// Get active draft
			const { data: activeDraft } = await supabase
				.from('drafts')
				.select('id')
				.eq('project_id', params.projectId)
				.eq('is_active', true)
				.single();

			if (!activeDraft) throw error(400, 'No active draft');

			const { data: existing } = await supabase
				.from('scenes')
				.select('sort_order')
				.eq('chapter_id', chapter_id)
				.eq('draft_id', activeDraft.id)
				.order('sort_order', { ascending: false })
				.limit(1);

			const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

			const { error: insertError } = await supabase.from('scenes').insert({
				user_id: user.id,
				chapter_id: chapter_id,
				draft_id: activeDraft.id,
				title,
				sort_order: sortOrder
			});

			if (insertError) throw error(500, 'Failed to create scene');
			break;
		}

		case 'rename': {
			const { type, id, title } = body;
			const table = type === 'part' ? 'parts' : type === 'chapter' ? 'chapters' : 'scenes';

			const { error: updateError } = await supabase
				.from(table)
				.update({ title })
				.eq('id', id)
				.eq('user_id', user.id);

			if (updateError) throw error(500, `Failed to rename ${type}`);
			break;
		}

		case 'delete': {
			const { type, id } = body;
			const table = type === 'part' ? 'parts' : type === 'chapter' ? 'chapters' : 'scenes';

			const { error: deleteError } = await supabase
				.from(table)
				.delete()
				.eq('id', id)
				.eq('user_id', user.id);

			if (deleteError) throw error(500, `Failed to delete ${type}`);
			break;
		}

		case 'reorder': {
			const { type, items } = body as { type: string; items: { id: string; sort_order: number }[] };
			const table = type === 'part' ? 'parts' : type === 'chapter' ? 'chapters' : 'scenes';

			for (const item of items) {
				await supabase
					.from(table)
					.update({ sort_order: item.sort_order })
					.eq('id', item.id)
					.eq('user_id', user.id);
			}
			break;
		}

		default:
			throw error(400, `Unknown action: ${action}`);
	}

	return json({ success: true });
};
