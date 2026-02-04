import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '$env/dynamic/private';

export const openai = createOpenAI({
	apiKey: env.OPENAI_API_KEY
});

export const anthropic = createAnthropic({
	apiKey: env.ANTHROPIC_API_KEY
});

export const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY
});

export const defaultModel = anthropic('claude-sonnet-4-20250514');

export const providers = {
	openai: !!env.OPENAI_API_KEY,
	anthropic: !!env.ANTHROPIC_API_KEY,
	google: !!env.GOOGLE_GENERATIVE_AI_API_KEY
};
