-- Categories table
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT UNIQUE NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: project <-> category (many to many)
CREATE TABLE project_categories (
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

-- Paths table: ordered group of projects
CREATE TABLE paths (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Junction: project <-> path (with ordering)
CREATE TABLE project_paths (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  path_id    UUID REFERENCES paths(id) ON DELETE CASCADE,
  path_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, path_id)
);

-- Indexes
CREATE INDEX idx_project_categories_project ON project_categories(project_id);
CREATE INDEX idx_project_categories_category ON project_categories(category_id);
CREATE INDEX idx_project_paths_project ON project_paths(project_id);
CREATE INDEX idx_project_paths_path ON project_paths(path_id);
CREATE INDEX idx_project_paths_index ON project_paths(path_id, path_index);

-- Seed categories
INSERT INTO categories (name, slug) VALUES
  ('Animation', 'animation'),
  ('Game', 'game'),
  ('Music', 'music'),
  ('Art', 'art');

-- Seed path: Scratch Fundamental
INSERT INTO paths (name, slug, description) VALUES
  ('Scratch Fundamental', 'scratch-fundamental', 'Belajar Scratch dari dasar dengan proyek-proyek interaktif');
