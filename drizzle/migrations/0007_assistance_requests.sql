CREATE TABLE public.assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_type text NOT NULL DEFAULT 'individual' CHECK (requester_type IN ('individual','community_representative')),
  full_name text NOT NULL,
  community_name text,
  email text,
  phone text,
  district text,
  country text NOT NULL DEFAULT 'Uganda',
  preferred_contact text NOT NULL DEFAULT 'phone' CHECK (preferred_contact IN ('phone','email')),
  category text NOT NULL CHECK (category IN ('education','healthcare','youth','community','other')),
  description text NOT NULL,
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','under_review','info_requested','approved','declined','closed')),
  assigned_to text NOT NULL DEFAULT '',
  internal_notes text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT assistance_contact_required CHECK (coalesce(email,'') <> '' OR coalesce(phone,'') <> '')
);
GRANT INSERT ON public.assistance_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.assistance_requests TO authenticated;
GRANT ALL ON public.assistance_requests TO service_role;
ALTER TABLE public.assistance_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit assistance requests" ON public.assistance_requests FOR INSERT TO anon, authenticated
  WITH CHECK (consent = true AND status = 'new' AND archived = false AND assigned_to = '' AND internal_notes = '' AND outcome = '');
CREATE POLICY "Staff read assistance requests" ON public.assistance_requests FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update assistance requests" ON public.assistance_requests FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins delete assistance requests" ON public.assistance_requests FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER assistance_requests_touch BEFORE UPDATE ON public.assistance_requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();