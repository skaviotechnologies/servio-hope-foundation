CREATE TABLE public.about_sections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE,
 title text NOT NULL,
 body text NOT NULL DEFAULT '',
 image_url text,
 sort_order integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.about_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.about_sections TO authenticated;
GRANT ALL ON public.about_sections TO service_role;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published or admin read" ON public.about_sections FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin insert" ON public.about_sections FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update" ON public.about_sections FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete" ON public.about_sections FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER about_sections_updated BEFORE UPDATE ON public.about_sections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TABLE public.team_members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug text NOT NULL UNIQUE,
 title text NOT NULL,
 position text NOT NULL DEFAULT '',
 body text NOT NULL DEFAULT '',
 image_url text,
 sort_order integer NOT NULL DEFAULT 0,
 published boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published or admin read" ON public.team_members FOR SELECT TO anon, authenticated USING (published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin insert" ON public.team_members FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin update" ON public.team_members FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin delete" ON public.team_members FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER team_members_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();