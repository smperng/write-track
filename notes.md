I ask perplexity.ai (idea is to adapt the response to a init.md file to give Claude Code to come up with a roadmap of the project):

Help me come up with a feature set for an app that helps a writer track his work, progress, draft, ideas, writer assistant, research, etc.

RESPONSE:

Here’s a concrete feature set you could build around that use case. Think of it as modules you can prioritize or cut.

## Core project & draft management

- Project dashboard: list of works-in-progress with status (idea, outlining, drafting, revising, done), genre, target word count, deadline.  
- Hierarchical structure: projects → parts → chapters → scenes/sections, with drag-and-drop reordering.  
- Multiple drafts per piece: v1, v2, “agent draft,” “beta draft,” with a diff view (highlight added/removed text) and notes per draft.  
- Snapshot system: quick “snapshot” of a scene/chapter before major edits, with the ability to restore or compare.  
- Draft status tags: per scene/chapter (brainstormed, rough, revised, polished, final) and per-project completion percentage based on tag weights.

## Progress tracking & analytics

- Word count tracking: per session, per project, per day/week/month, broken down by draft vs revision (e.g., new words vs edited words).  
- Session timer: start/stop writing sessions, with optional auto-detection of “real” typing vs idle.  
- Goals system:  
  - Project goals (e.g., 90k words by Aug 1).  
  - Daily/weekly word-count goals.  
  - Time goals (e.g., 60 minutes writing per day).  
- Streaks & consistency: streak counter, “days written vs days off,” calendar heatmap of activity.  
- Productivity analytics:  
  - Average words per session/day, best and worst days.  
  - Most productive times of day, days of week.  
  - Forecasting: “At your current pace, you’ll finish this project by X.”  
- Visualizations (lightweight):  
  - Line chart of words per day/week.  
  - Pie chart of time spent per project or per activity (drafting vs revising vs research).  

## Ideas, notes, and research

- Idea inbox: quick capture for ideas (plot, characters, titles, scenes, lines, themes) with tags and later sorting.  
- Note types:  
  - General notes.  
  - Character bios, locations, worldbuilding, with custom fields (age, role, timeline events, etc.).  
  - Research notes, each linked to a source (URL, book, PDF, etc.).  
- Linking: link notes/characters/locations to specific scenes or chapters; see “what scenes use this character/place.”  
- Web clipper or share-to-app: fast way to send links or text snippets into a specific project’s research bucket.  
- Inline research pane: side panel in the writing view where you pin reference notes/character sheets for the current scene.

## Writing assistant (AI & non-AI)

- Context-aware suggestions:  
  - Rephrase / tighten / expand a paragraph.  
  - Tone/style adjustment (e.g., more suspenseful, more formal, middle-grade voice).  
  - “Explain this in simpler language.”  
- Story-level helpers:  
  - Summarize a chapter or scene.  
  - Generate alt endings/scene variants.  
  - Beat suggestions based on a chosen structure (three-act, Save the Cat, etc.).  
- Brainstorming tools:  
  - Prompted idea generator (plot twists, character flaws, conflicts).  
  - “What happens next?” suggestions, given last scene summary.  
- Editing helpers:  
  - Passive voice / adverb / filler word detector.  
  - Readability and pacing suggestions (e.g., short/long sentence mix, dialogue vs narration ratio).  
- Style memory: per-project style guide (e.g., tense, POV, spellings, banned words) that the assistant uses when suggesting edits.

## Research workflow support

- Source tracking: each research note can store citation-like details (title, author, link, page), plus “confidence” or “to verify” flags.  
- Reading queue: list of articles/books to read for each project, with status (to read, reading, summarized, integrated).  
- Highlight & summarize: paste or import text and create short summaries, plus “pull quotes” for future reference.  
- Fact-check list: lightweight checklist for facts to verify before publishing.  
- Timeline view: chronological events for the story and for real-world historical events you’re using, merged visually.

## Planning & outlining

- Outline modes:  
  - Linear outline (bulleted scenes/chapters).  
  - Card/corkboard view with synopsis cards for scenes.  
  - Plot grid (rows for characters or plot threads, columns for beats/chapters).  
- Beat templates: predefined structures (3-act, 4-act, hero’s journey) that you can customize and attach scenes to.  
- Character arcs: track key beats for each character and link them to scenes; see gaps in their arc.  
- Theme & motif tracker: list themes/motifs; tag scenes where they appear; view coverage over the book.

## Habit, motivation, and accountability

- Milestones & achievements: e.g., “10k words on a project,” “30-day streak,” “first draft complete,” with optional badges.  
- Gentle gamification: XP or “progress bar” per project, tied to actual work (words, time, completed scenes) without being childish.  
- Reminders & notifications:  
  - Daily/weekly “writing window” reminders based on user-set schedule.  
  - Nudges when a streak is at risk.  
- Check-in prompts: optional end-of-day questions like “What worked?” “What to try tomorrow?” stored as a reflective log.  

## Collaboration & export

- Export formats: clean export to .docx, .pdf, .txt, Markdown, and maybe a “submission-ready” template.  
- Versioned share links: share read-only links for a particular draft or chapter with comments enabled.  
- Commenting & feedback: inline comments, global comments per scene/chapter; “resolved” state.  
- Beta reader view: simplified reader UI with commenting, reactions (e.g., “confused,” “loved this”), and basic analytics (dropoff points).  

## Organization, search, and cross-project view

- Global library view: all works, sorted by status, word count, genre; filters for “drafting now,” “on hold,” “ideas only.”  
- Powerful search: full-text search across drafts and notes; filters by type (scene, character, research).  
- Cross-project metrics: total words written this month, total time writing, projects by phase.  
- Tags and collections: customizable tags (e.g., “short story,” “memoir,” “NaNoWriMo 2026”) and smart collections (saved filters).  

## Nice-to-have “pro” features

- Offline-capable editor with auto-sync.  
- Mobile capture app focused on ideas, notes, and quick writing sprints.  
- Distraction-free mode with customizable theme and typography.  
- API/webhooks so advanced users can plug into external tools (e.g., spreadsheets, automation workflows).  

If you tell me more about the target user (novelist vs blogger vs academic, solo vs team) and whether you want heavy AI or more “pure tracker,” I can help you narrow this into a v1 feature set and a roadmap.
