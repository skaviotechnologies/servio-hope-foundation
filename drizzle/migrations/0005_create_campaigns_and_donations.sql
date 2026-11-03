CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  funding_target NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'UGX',
  start_date DATE,
  end_date DATE,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  updates JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published campaigns"
  ON public.campaigns FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY "Staff can manage campaigns"
  ON public.campaigns FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  donor_name TEXT NOT NULL,
  donor_email TEXT NOT NULL,
  donor_phone TEXT,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UGX',
  frequency TEXT NOT NULL DEFAULT 'one_time',
  designation TEXT NOT NULL DEFAULT 'general',
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  method TEXT NOT NULL DEFAULT 'pledge',
  status TEXT NOT NULL DEFAULT 'pledged',
  reference TEXT,
  notes TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT false
);

GRANT INSERT ON public.donations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can submit donation pledges"
  ON public.donations FOR INSERT TO anon
  WITH CHECK (status = 'pledged' AND method = 'pledge');

CREATE POLICY "Staff can manage donations"
  ON public.donations FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE VIEW public.public_campaign_progress
  WITH (security_invoker = false) AS
  SELECT campaign_id, currency, SUM(amount) AS verified_total, COUNT(*) AS verified_count
  FROM public.donations
  WHERE status = 'verified' AND campaign_id IS NOT NULL
  GROUP BY campaign_id, currency;

GRANT SELECT ON public.public_campaign_progress TO anon, authenticated, service_role;