import { calculateWordDelta } from '$lib/utils/diff';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

interface SessionState {
	id: string | null;
	projectId: string | null;
	sceneId: string | null;
	startTime: number;
	startingWordCount: number;
	currentWordCount: number;
	wordsAdded: number;
	wordsDeleted: number;
	lastActivityTime: number;
	idleSeconds: number;
	lastContent: string;
}

let state: SessionState | null = null;
let idleCheckInterval: ReturnType<typeof setInterval> | null = null;
let listeners: Set<(session: SessionState | null) => void> = new Set();

function notifyListeners() {
	for (const listener of listeners) {
		listener(state);
	}
}

export function subscribe(listener: (session: SessionState | null) => void): () => void {
	listeners.add(listener);
	listener(state);
	return () => listeners.delete(listener);
}

export function getSession(): SessionState | null {
	return state;
}

export async function startSession(options: {
	projectId: string;
	sceneId: string;
	startingWordCount: number;
	initialContent: string;
}): Promise<string | null> {
	// If there's already an active session, end it first
	if (state) {
		await endSession();
	}

	try {
		const response = await fetch('/api/sessions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				project_id: options.projectId,
				scene_id: options.sceneId,
				starting_word_count: options.startingWordCount
			})
		});

		if (!response.ok) {
			console.error('Failed to start session');
			return null;
		}

		const data = await response.json();
		const now = Date.now();

		state = {
			id: data.id,
			projectId: options.projectId,
			sceneId: options.sceneId,
			startTime: now,
			startingWordCount: options.startingWordCount,
			currentWordCount: options.startingWordCount,
			wordsAdded: 0,
			wordsDeleted: 0,
			lastActivityTime: now,
			idleSeconds: 0,
			lastContent: options.initialContent
		};

		// Start idle check interval
		startIdleCheck();
		notifyListeners();

		return data.id;
	} catch (err) {
		console.error('Failed to start session:', err);
		return null;
	}
}

export function recordActivity(newContent: string, newWordCount: number): void {
	if (!state) return;

	const now = Date.now();

	// Calculate word delta from last content
	const delta = calculateWordDelta(state.lastContent, newContent);

	state = {
		...state,
		currentWordCount: newWordCount,
		wordsAdded: state.wordsAdded + delta.added,
		wordsDeleted: state.wordsDeleted + delta.deleted,
		lastActivityTime: now,
		lastContent: newContent
	};

	notifyListeners();
}

export async function endSession(): Promise<void> {
	if (!state || !state.id) return;

	stopIdleCheck();

	const now = Date.now();
	const durationSeconds = Math.floor((now - state.startTime) / 1000);

	try {
		await fetch(`/api/sessions/${state.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				ended_at: new Date().toISOString(),
				ending_word_count: state.currentWordCount,
				words_added: state.wordsAdded,
				words_deleted: state.wordsDeleted,
				duration_seconds: durationSeconds,
				idle_seconds: state.idleSeconds
			})
		});
	} catch (err) {
		console.error('Failed to end session:', err);
	}

	state = null;
	notifyListeners();
}

function startIdleCheck(): void {
	if (idleCheckInterval) return;

	idleCheckInterval = setInterval(() => {
		if (!state) return;

		const now = Date.now();
		const idleTime = now - state.lastActivityTime;

		if (idleTime >= IDLE_TIMEOUT_MS) {
			// Auto-end session after 5 minutes idle
			endSession();
		} else if (idleTime >= 1000) {
			// Track idle seconds (only count after 1 second of inactivity)
			state = {
				...state,
				idleSeconds: state.idleSeconds + 1
			};
			notifyListeners();
		}
	}, 1000);
}

function stopIdleCheck(): void {
	if (idleCheckInterval) {
		clearInterval(idleCheckInterval);
		idleCheckInterval = null;
	}
}

export function getElapsedSeconds(): number {
	if (!state) return 0;
	return Math.floor((Date.now() - state.startTime) / 1000);
}

export function getActiveSeconds(): number {
	if (!state) return 0;
	return getElapsedSeconds() - state.idleSeconds;
}
