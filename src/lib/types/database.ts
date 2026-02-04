export type ProjectStatus = 'planning' | 'drafting' | 'revising' | 'complete' | 'on_hold';
export type SceneStatus = 'brainstormed' | 'rough' | 'revised' | 'polished' | 'final';

export interface Database {
	public: {
		Tables: {
			projects: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					description: string | null;
					status: ProjectStatus;
					genre: string | null;
					target_word_count: number | null;
					deadline: string | null;
					archived_at: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					description?: string | null;
					status?: ProjectStatus;
					genre?: string | null;
					target_word_count?: number | null;
					deadline?: string | null;
					archived_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					description?: string | null;
					status?: ProjectStatus;
					genre?: string | null;
					target_word_count?: number | null;
					deadline?: string | null;
					archived_at?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			parts: {
				Row: {
					id: string;
					user_id: string;
					project_id: string;
					title: string;
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					project_id: string;
					title: string;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					project_id?: string;
					title?: string;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			drafts: {
				Row: {
					id: string;
					user_id: string;
					project_id: string;
					name: string;
					notes: string | null;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					project_id: string;
					name: string;
					notes?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					project_id?: string;
					name?: string;
					notes?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			chapters: {
				Row: {
					id: string;
					user_id: string;
					project_id: string;
					part_id: string | null;
					title: string;
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					project_id: string;
					part_id?: string | null;
					title: string;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					project_id?: string;
					part_id?: string | null;
					title?: string;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			scenes: {
				Row: {
					id: string;
					user_id: string;
					chapter_id: string;
					draft_id: string;
					title: string;
					content: string;
					word_count: number;
					status: SceneStatus;
					sort_order: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					chapter_id: string;
					draft_id: string;
					title: string;
					content?: string;
					word_count?: number;
					status?: SceneStatus;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					chapter_id?: string;
					draft_id?: string;
					title?: string;
					content?: string;
					word_count?: number;
					status?: SceneStatus;
					sort_order?: number;
					created_at?: string;
					updated_at?: string;
				};
			};
			snapshots: {
				Row: {
					id: string;
					user_id: string;
					scene_id: string;
					draft_id: string | null;
					content: string;
					word_count: number;
					label: string;
					description: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					scene_id: string;
					draft_id?: string | null;
					content: string;
					word_count?: number;
					label: string;
					description?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					scene_id?: string;
					draft_id?: string | null;
					content?: string;
					word_count?: number;
					label?: string;
					description?: string | null;
					created_at?: string;
				};
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: {
			project_status: ProjectStatus;
			scene_status: SceneStatus;
		};
	};
}
