# WriteTrack Roadmap

## Overview

WriteTrack is a web application for writers to track their work, progress, drafts, ideas, research, and more. This roadmap breaks the full feature set into incremental phases, each delivering a usable product increment.

**Tech stack:** Node.js, TypeScript, SvelteKit, TailwindCSS, Supabase, Vercel AI SDK (OpenAI / Anthropic / Gemini).

---

## Phase 0 — Project Scaffolding & Infrastructure

Set up the foundation before any feature work begins.

- [ ] Initialize SvelteKit project with TypeScript
- [ ] Configure TailwindCSS
- [ ] Set up Supabase project (auth, database, storage)
- [ ] Define database schema conventions and migration tooling
- [ ] Configure environment variables for AI API keys (OpenAI, Anthropic, Gemini)
- [ ] Set up Vercel AI SDK integration
- [ ] CI pipeline (lint, type-check, test)
- [ ] Basic layout shell: sidebar nav, top bar, responsive container

---

## Phase 1 — Core Project & Draft Management

The minimum viable writing tool: create projects, organize content, and write.

### 1a: Project Dashboard
- [ ] Project CRUD (create, rename, archive, delete)
- [ ] Project metadata: status (idea / outlining / drafting / revising / done), genre, target word count, deadline
- [ ] Dashboard view listing all projects with status indicators

### 1b: Hierarchical Structure
- [ ] Data model: Project > Part > Chapter > Scene/Section
- [ ] Tree-view navigation in the sidebar
- [ ] Drag-and-drop reordering of parts, chapters, and scenes
- [ ] Rich-text or Markdown editor for scene content

### 1c: Drafts & Snapshots
- [ ] Multiple named drafts per project (v1, v2, etc.)
- [ ] Diff view between drafts (highlight added/removed text)
- [ ] Notes per draft
- [ ] Snapshot system: one-click snapshot before major edits, restore or compare

### 1d: Draft Status Tags
- [ ] Per-scene/chapter status tags (brainstormed, rough, revised, polished, final)
- [ ] Per-project completion percentage calculated from tag weights

---

## Phase 2 — Progress Tracking & Analytics

Turn raw writing activity into motivation and insight.

### 2a: Word Count & Session Tracking
- [ ] Word count tracking: per session, per project, per day/week/month
- [ ] Differentiate new words vs edited words
- [ ] Session timer with start/stop and optional idle detection

### 2b: Goals System
- [ ] Project-level goals (e.g., 90k words by Aug 1)
- [ ] Daily/weekly word-count goals
- [ ] Time-based goals (e.g., 60 min/day)
- [ ] Goal progress indicators on the dashboard

### 2c: Streaks & Visualizations
- [ ] Streak counter with "days written vs days off"
- [ ] Calendar heatmap of writing activity
- [ ] Line chart: words per day/week
- [ ] Pie chart: time per project or per activity type

### 2d: Productivity Analytics
- [ ] Average words per session/day, best and worst days
- [ ] Most productive time-of-day and day-of-week analysis
- [ ] Forecasting: "At your current pace, you'll finish by X"

---

## Phase 3 — Ideas, Notes & Research

Give writers a place for everything that isn't the manuscript itself.

### 3a: Idea Inbox
- [ ] Quick-capture interface for ideas (plot, characters, titles, scenes, themes)
- [ ] Tagging and sorting
- [ ] Promote idea to project or link to existing project

### 3b: Structured Notes
- [ ] General notes
- [ ] Character bios with custom fields (age, role, timeline events)
- [ ] Location and worldbuilding notes with custom fields
- [ ] Research notes linked to sources (URL, book, PDF)

### 3c: Linking & Reference
- [ ] Link notes/characters/locations to specific scenes or chapters
- [ ] Reverse lookup: "what scenes use this character/place"
- [ ] Inline research pane: side panel in the editor for pinning reference material

### 3d: Web Clipper
- [ ] Browser extension or share-to-app flow for saving links/snippets into a project's research bucket

---

## Phase 4 — Planning & Outlining

Tools for structuring a story before and during writing.

- [ ] Linear outline mode (bulleted scenes/chapters)
- [ ] Card/corkboard view with synopsis cards
- [ ] Plot grid (rows = characters/threads, columns = beats/chapters)
- [ ] Beat templates: 3-act, 4-act, hero's journey, Save the Cat — customizable
- [ ] Character arcs: track key beats per character, link to scenes, detect gaps
- [ ] Theme & motif tracker: tag scenes, view coverage across the book

---

## Phase 5 — Writing Assistant (AI)

AI-powered features using Vercel AI SDK with provider-agnostic model selection.

### 5a: Context-Aware Suggestions
- [ ] Rephrase / tighten / expand a paragraph
- [ ] Tone/style adjustment (suspenseful, formal, middle-grade, etc.)
- [ ] "Explain this in simpler language"

### 5b: Story-Level Helpers
- [ ] Summarize a chapter or scene
- [ ] Generate alternative endings / scene variants
- [ ] Beat suggestions based on chosen story structure

### 5c: Brainstorming Tools
- [ ] Prompted idea generator (plot twists, character flaws, conflicts)
- [ ] "What happens next?" given last scene summary

### 5d: Editing Helpers
- [ ] Passive voice / adverb / filler word detector (rule-based, no AI needed)
- [ ] Readability and pacing suggestions (sentence length mix, dialogue/narration ratio)
- [ ] Per-project style memory (tense, POV, spellings, banned words) used by AI suggestions

---

## Phase 6 — Research Workflow Support

Deeper research tooling for non-fiction and research-heavy fiction.

- [ ] Source tracking with citation fields (title, author, link, page) and confidence/verify flags
- [ ] Reading queue per project (to read, reading, summarized, integrated)
- [ ] Highlight & summarize: paste text, create summaries and pull quotes
- [ ] Fact-check checklist for pre-publication verification
- [ ] Timeline view: story events + real-world historical events merged visually

---

## Phase 7 — Habit, Motivation & Accountability

Keep writers coming back.

- [ ] Milestones & achievements (10k words, 30-day streak, first draft complete)
- [ ] Gentle gamification: XP / progress bar tied to real work output
- [ ] Reminders & notifications: daily/weekly writing-window reminders, streak-at-risk nudges
- [ ] Check-in prompts: end-of-day reflective questions stored as a log

---

## Phase 8 — Collaboration & Export

Share work and get feedback.

### 8a: Export
- [ ] Export to .docx, .pdf, .txt, Markdown
- [ ] Submission-ready formatting template

### 8b: Sharing & Feedback
- [ ] Versioned read-only share links with comments enabled
- [ ] Inline and global comments per scene/chapter with "resolved" state
- [ ] Beta reader view: simplified UI with commenting, reactions (confused, loved this), and drop-off analytics

---

## Phase 9 — Organization, Search & Cross-Project Views

Power-user features for writers managing multiple projects.

- [ ] Global library view: all works sorted/filtered by status, word count, genre
- [ ] Full-text search across drafts and notes with type filters
- [ ] Cross-project metrics: total words this month, total time, projects by phase
- [ ] Customizable tags and smart collections (saved filter presets)

---

## Phase 10 — Pro / Nice-to-Have Features

Polish and expand for power users.

- [ ] Offline-capable editor with auto-sync (service worker + Supabase realtime)
- [ ] Mobile capture app (ideas, notes, quick writing sprints)
- [ ] Distraction-free writing mode with customizable theme and typography
- [ ] API / webhooks for external tool integration

---

## Phase Dependency Graph

```
Phase 0  (infra)
  |
Phase 1  (core writing)
  |
  +--- Phase 2  (progress tracking)
  |
  +--- Phase 3  (ideas & notes)
  |       |
  |       +--- Phase 6  (research workflow)
  |
  +--- Phase 4  (planning & outlining)
  |
  +--- Phase 5  (AI assistant) — needs Phase 1b editor + Phase 3b notes for context
  |
  +--- Phase 7  (habits) — needs Phase 2 for streak/goal data
  |
  +--- Phase 8  (collaboration & export)
  |
  +--- Phase 9  (search & organization)
  |
  Phase 10  (pro features) — independent, can be tackled anytime after Phase 1
```

## Guiding Principles

1. **Ship incrementally.** Each phase should produce a usable product. Phase 1 alone is a functional writing tool.
2. **Writer-first design.** The editor and navigation must feel fast and distraction-free. Analytics and AI are secondary to the core writing experience.
3. **AI as opt-in.** AI features should assist, never intrude. Every AI suggestion should be easy to accept, reject, or ignore.
4. **Data ownership.** All content lives in the user's Supabase instance. Export should always work without AI or network access.
5. **Avoid premature abstraction.** Build the simplest thing that works for each phase. Refactor when real usage patterns emerge.
