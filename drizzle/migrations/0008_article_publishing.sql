ALTER TABLE public.posts
 ADD COLUMN category text NOT NULL DEFAULT 'Foundation News',
 ADD COLUMN author text NOT NULL DEFAULT '',
 ADD COLUMN tags text[] NOT NULL DEFAULT '{}',
 ADD COLUMN seo_title text NOT NULL DEFAULT '',
 ADD COLUMN seo_description text NOT NULL DEFAULT '',
 ADD COLUMN status text NOT NULL DEFAULT 'draft',
 ADD COLUMN featured boolean NOT NULL DEFAULT false,
 ADD COLUMN content jsonb,
 ADD COLUMN gallery jsonb NOT NULL DEFAULT '[]',
 ADD COLUMN related_article_ids uuid[] NOT NULL DEFAULT '{}';
UPDATE public.posts SET status = CASE WHEN published THEN 'published' ELSE 'draft' END, published_at = CASE WHEN published THEN COALESCE(published_at, created_at) ELSE published_at END;
ALTER TABLE public.posts ADD CONSTRAINT posts_status_valid CHECK (status IN ('draft','published','scheduled'));
CREATE OR REPLACE FUNCTION public.validate_article_publication() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF TG_OP = 'UPDATE' THEN
  IF NEW.status IS NOT DISTINCT FROM OLD.status AND NEW.published IS DISTINCT FROM OLD.published THEN
   NEW.status := CASE WHEN NEW.published THEN 'published' ELSE 'draft' END;
  END IF;
 END IF;
 IF NEW.status = 'scheduled' AND NEW.published_at IS NULL THEN
  RAISE EXCEPTION 'Scheduled articles require a publication date';
 END IF;
 NEW.published := NEW.status IN ('published','scheduled');
 IF NEW.status = 'published' AND NEW.published_at IS NULL THEN NEW.published_at := now(); END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER article_publication BEFORE INSERT OR UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.validate_article_publication();
ALTER POLICY "public read published" ON public.posts USING (public.is_staff(auth.uid()) OR (published AND status IN ('published','scheduled') AND published_at IS NOT NULL AND published_at <= now()));
CREATE INDEX posts_publication_idx ON public.posts (published_at DESC) WHERE published;
CREATE INDEX posts_category_idx ON public.posts (category);