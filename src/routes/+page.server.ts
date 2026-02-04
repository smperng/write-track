import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { user } = await safeGetSession();
	if (!user) {
		return {
			stats: { projectCount: 0, totalWords: 0, activeDrafts: 0 },
			recentProjects: []
		};
	}

	// Get non-archived project count
	const { count: projectCount } = await supabase
		.from('projects')
		.select('*', { count: 'exact', head: true })
		.is('archived_at', null)
		.eq('user_id', user.id);

	// Get active drafts count
	const { count: activeDrafts } = await supabase
		.from('drafts')
		.select('*', { count: 'exact', head: true })
		.eq('is_active', true)
		.eq('user_id', user.id);

	// Get total word count from scenes in active drafts
	const { data: activeDraftRows } = await supabase
		.from('drafts')
		.select('id')
		.eq('is_active', true)
		.eq('user_id', user.id);

	let totalWords = 0;
	if (activeDraftRows && activeDraftRows.length > 0) {
		const draftIds = activeDraftRows.map((d) => d.id);
		const { data: scenes } = await supabase
			.from('scenes')
			.select('word_count')
			.in('draft_id', draftIds);

		if (scenes) {
			totalWords = scenes.reduce((sum, s) => sum + s.word_count, 0);
		}
	}

	// Get recent projects
	const { data: recentProjects } = await supabase
		.from('projects')
		.select('*')
		.is('archived_at', null)
		.eq('user_id', user.id)
		.order('updated_at', { ascending: false })
		.limit(5);

	return {
		stats: {
			projectCount: projectCount ?? 0,
			totalWords,
			activeDrafts: activeDrafts ?? 0
		},
		recentProjects: recentProjects ?? []
	};
};
