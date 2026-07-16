-- Enable Row Level Security on all public tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_paths ENABLE ROW LEVEL SECURITY;

-- Categories: public read, authenticated write
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories"
  ON public.categories FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete categories"
  ON public.categories FOR DELETE
  USING (auth.role() = 'authenticated');

-- Project Categories: public read, authenticated write
CREATE POLICY "Project categories are viewable by everyone"
  ON public.project_categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage project categories"
  ON public.project_categories FOR ALL
  USING (auth.role() = 'authenticated');

-- Projects: public read, authenticated write
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE
  USING (auth.role() = 'authenticated');

-- Steps: public read, authenticated write
CREATE POLICY "Steps are viewable by everyone"
  ON public.steps FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage steps"
  ON public.steps FOR ALL
  USING (auth.role() = 'authenticated');

-- Assets: public read, authenticated write
CREATE POLICY "Assets are viewable by everyone"
  ON public.assets FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage assets"
  ON public.assets FOR ALL
  USING (auth.role() = 'authenticated');

-- Paths: public read, authenticated write
CREATE POLICY "Paths are viewable by everyone"
  ON public.paths FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage paths"
  ON public.paths FOR ALL
  USING (auth.role() = 'authenticated');

-- Project Paths: public read, authenticated write
CREATE POLICY "Project paths are viewable by everyone"
  ON public.project_paths FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage project paths"
  ON public.project_paths FOR ALL
  USING (auth.role() = 'authenticated');
