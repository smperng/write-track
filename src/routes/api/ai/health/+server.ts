import { json } from '@sveltejs/kit';
import { providers } from '$lib/server/ai';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		providers
	});
};
