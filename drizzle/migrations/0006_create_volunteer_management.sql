CREATE TABLE public.volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  district text,
  country text NOT NULL DEFAULT 'Uganda',
  interests text NOT NULL DEFAULT '',
  skills text NOT NULL DEFAULT '',
  availability text NOT NULL DEFAULT '',
  experience text NOT NULL DEFAULT '',
  motivation text NOT NULL DEFAULT '',
  consent boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'inactive')),
  admin_notes text NOT NULL DEFAULT '',
  assigned_activities text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_applications TO authenticated;
GRANT INSERT ON public.volunteer_applications TO anon;
GRANT ALL ON public.volunteer_applications TO service_role;

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visitors can apply as volunteers"
ON public.volunteer_applications FOR INSERT TO anon
WITH CHECK (consent = true AND status = 'pending');

CREATE POLICY "Staff can manage volunteer applications"
ON public.volunteer_applications FOR ALL TO authenticated
USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER touch_volunteer_applications
BEFORE UPDATE ON public.volunteer_applications
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

CREATE TABLE public.volunteer_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.volunteer_applications(id) ON DELETE CASCADE,
  activity text NOT NULL,
  hours numeric NOT NULL CHECK (hours > 0),
  date date NOT NULL DEFAULT current_date,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.volunteer_hours TO authenticated;
GRANT ALL ON public.volunteer_hours TO service_role;

ALTER TABLE public.volunteer_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage volunteer hours"
ON public.volunteer_hours FOR ALL TO authenticated
USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));