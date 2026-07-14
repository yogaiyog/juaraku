-- Projects table: stores metadata from meta.yml
CREATE TABLE projects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  dir_name          TEXT UNIQUE NOT NULL,
  dir_index         INTEGER NOT NULL DEFAULT 0,
  title             TEXT NOT NULL,
  hero_image        TEXT,
  description       TEXT,
  meta_title        TEXT,
  meta_description  TEXT,
  pdf               TEXT,
  listed            BOOLEAN DEFAULT true,
  copyedit          BOOLEAN DEFAULT false,
  last_tested       DATE,
  version           INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- Steps table: stores step entries from meta.yml steps array
CREATE TABLE steps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number         INTEGER NOT NULL,
  title               TEXT NOT NULL,
  completion          JSONB,
  has_quiz            BOOLEAN DEFAULT false,
  quiz_path           TEXT,
  quiz_version        INTEGER,
  quiz_questions      INTEGER,
  quiz_passing_score  INTEGER,
  is_challenge        BOOLEAN DEFAULT false,
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, step_number)
);

-- Assets table: tracks all files uploaded to MinIO
CREATE TABLE assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_path       TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  mime_type       TEXT NOT NULL,
  size            BIGINT,
  minio_key       TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, file_path)
);

-- Indexes
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_dir ON projects(dir_name);
CREATE INDEX idx_steps_project ON steps(project_id);
CREATE INDEX idx_steps_number ON steps(project_id, step_number);
CREATE INDEX idx_assets_project ON assets(project_id);
CREATE INDEX idx_assets_path ON assets(project_id, file_path);
