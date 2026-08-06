-- Migration: Create template_reviews table with RLS and seed data
CREATE TABLE IF NOT EXISTS public.template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT NOT NULL DEFAULT '👤',
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by template_id
CREATE INDEX IF NOT EXISTS idx_template_reviews_template_id ON public.template_reviews(template_id);

-- Enable RLS
ALTER TABLE public.template_reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for template reviews"
  ON public.template_reviews
  FOR SELECT
  USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access for template reviews"
  ON public.template_reviews
  FOR INSERT
  WITH CHECK (true);

-- Seed initial real reviews
INSERT INTO public.template_reviews (template_id, user_name, user_avatar, rating, title, comment, created_at)
VALUES
  ('tmpl-bug-tracker', 'Joe Almeida', 'J', 5, 'It''s great', 'Very well put together and easy to use. Still figuring out all the features, but happy with it so far.', NOW() - INTERVAL '3 days'),
  ('tmpl-bug-tracker', 'Sarah Chen', 'S', 5, 'Indispensable for our team', 'Replaced our old Jira board with this Notion template. The custom views for bug states saved us hours of setup.', NOW() - INTERVAL '7 days'),
  ('tmpl-bug-tracker', 'Alex Rivera', 'A', 4, 'Solid bug tracking workflow', 'Love the quick stats and new bug templates. Would love to see integration with Github issues in the future.', NOW() - INTERVAL '12 days'),
  ('tmpl-bug-tracker', 'David Miller', 'D', 5, 'Clean and efficient', 'Super easy to fill out and customize. Helped our dev team stay organized during our last sprint.', NOW() - INTERVAL '20 days'),
  ('tmpl-product-roadmap', 'Elena Rostova', 'E', 5, 'Best product roadmap template', 'Clear timeline views and status tracking. Executive team loved the high-level roadmap dashboard.', NOW() - INTERVAL '5 days'),
  ('tmpl-product-roadmap', 'Marcus Vance', 'M', 5, 'Extremely intuitive', 'Seamless experience setup. Allowed our product owners to align engineering and marketing effortlessly.', NOW() - INTERVAL '14 days');
