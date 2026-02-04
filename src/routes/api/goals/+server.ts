import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const body = await request.json();

	const { data, error: insertError } = await supabase
		.from('goals')
		.insert({
			user_id: user.id,
			project_id: body.project_id || null,
			title: body.title,
			goal_type: body.goal_type,
			goal_scope: body.goal_scope,
			target_value: body.target_value,
			target_date: body.target_date || null,
			is_recurring: body.is_recurring ?? false
		})
		.select()
		.single();

	if (insertError) {
		throw error(500, 'Failed to create goal');
	}

	return json({ goal: data });
};

export const GET: RequestHandler = async ({ url, locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) throw error(401, 'Unauthorized');

	const projectId = url.searchParams.get('project_id');
	const status = url.searchParams.get('status');
	const scope = url.searchParams.get('scope');

	let query = supabase
		.from('goals')
		.select('*')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (projectId) {
		query = query.eq('project_id', projectId);
	}

	if (status) {
		query = query.eq('status', status);
	}

	if (scope) {
		query = query.eq('goal_scope', scope);
	}

	const { data, error: selectError } = await query;

	if (selectError) {
		throw error(500, 'Failed to fetch goals');
	}

	return json({ goals: data });
};
