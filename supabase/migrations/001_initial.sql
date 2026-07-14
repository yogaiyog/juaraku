-- Migration: Create projects and steps tables
-- Run this in Supabase SQL editor or via supabase CLI

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  sort_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  hero_image TEXT DEFAULT 'images/banner.png',
  description TEXT DEFAULT '',
  meta_title TEXT,
  meta_description TEXT,
  pdf TEXT,
  listed BOOLEAN DEFAULT true,
  copyedit BOOLEAN DEFAULT false,
  last_tested TEXT DEFAULT '',
  version INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS steps (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  completion JSONB DEFAULT '[]'::jsonb,
  knowledge_quiz JSONB,
  challenge BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_steps_project_id ON steps(project_id);
CREATE INDEX IF NOT EXISTS idx_steps_project_step ON steps(project_id, step_number);
CREATE INDEX IF NOT EXISTS idx_projects_sort ON projects(sort_index);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on steps" ON steps FOR ALL USING (true) WITH CHECK (true);
