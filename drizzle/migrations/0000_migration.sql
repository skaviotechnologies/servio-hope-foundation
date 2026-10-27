create type public.app_role as enum ('admin','editor');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('admin','editor'))
$$;

create policy "own roles readable" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "admins manage roles" on public.user_roles for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- first user becomes admin
create or replace function public.handle_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.handle_first_admin();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create table public.site_settings (
  id int primary key default 1 check (id = 1),
  org_name text not null default 'Servio Hope Foundation',
  abbreviation text not null default 'SHF',
  motto text not null default 'Serving Humanity. Inspiring Hope.',
  country text not null default 'Uganda',
  legal_status text not null default 'Registration in progress',
  registration_number text,
  domain text default 'serviohopefoundation.org',
  email text, phone text, address text,
  hero_title text not null default 'Serving humanity. Inspiring hope.',
  hero_subtitle text not null default 'A Ugandan humanitarian foundation working in education, healthcare, youth empowerment and community development.',
  hero_image_url text,
  about_intro text, mission text, vision text, values text,
  donate_intro text, donate_instructions text,
  volunteer_intro text,
  logo_url text, header_logo_url text, footer_logo_url text, favicon_url text, og_image_url text,
  facebook_url text, x_url text, instagram_url text, linkedin_url text, youtube_url text,
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "settings public read" on public.site_settings for select to anon, authenticated using (true);
create policy "settings admin update" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create trigger t_settings before update on public.site_settings for each row execute function public.touch_updated_at();

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  image_url text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  location text,
  status text not null default 'planned' check (status in ('planned','ongoing','completed')),
  program_id uuid references public.programs(id) on delete set null,
  image_url text,
  sort_order int not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
do $$ declare t text; begin
  foreach t in array array['programs','projects','posts'] loop
    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read published" on public.%I for select to anon, authenticated using (published or public.is_staff(auth.uid()))', t);
    execute format('create policy "staff insert" on public.%I for insert to authenticated with check (public.is_staff(auth.uid()))', t);
    execute format('create policy "staff update" on public.%I for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()))', t);
    execute format('create policy "staff delete" on public.%I for delete to authenticated using (public.is_staff(auth.uid()))', t);
    execute format('create trigger t_upd before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'contact' check (kind in ('contact','volunteer','partner')),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 255),
  phone text check (phone is null or char_length(phone) <= 40),
  subject text check (subject is null or char_length(subject) <= 200),
  message text not null check (char_length(message) between 1 and 4000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;
grant all on public.messages to service_role;
alter table public.messages enable row level security;
create policy "anyone can submit" on public.messages for insert to anon, authenticated with check (is_read = false);
create policy "staff read" on public.messages for select to authenticated using (public.is_staff(auth.uid()));
create policy "staff update" on public.messages for update to authenticated using (public.is_staff(auth.uid()));
create policy "staff delete" on public.messages for delete to authenticated using (public.is_staff(auth.uid()));

insert into public.site_settings (id, about_intro, mission, vision, values, donate_intro, donate_instructions, volunteer_intro)
values (1,
 'Servio Hope Foundation (SHF) is a humanitarian and charitable foundation based in Uganda. We exist to serve vulnerable people and communities, beginning in Uganda, with the long-term ambition of extending our work across Africa and beyond.',
 'To serve vulnerable individuals and communities by improving access to education, healthcare, youth empowerment opportunities and sustainable community development.',
 'Communities across Africa where every person has the opportunity to live with dignity, health and hope.',
 'Compassion · Integrity · Accountability · Inclusion · Community ownership',
 'Your support helps us begin and sustain our work. Online giving is being set up — in the meantime, please contact us to arrange a contribution.',
 'Please contact the foundation directly for current giving options. We will only publish payment details once they have been verified.',
 'We welcome people who want to give their time and skills. Tell us a little about yourself and how you would like to help.');

insert into public.programs (slug, title, summary, body, sort_order, published) values
('education','Education','Helping children and young people access learning and stay in school.','Our education programme will focus on improving access to quality learning for children and young people in underserved communities. Programme details will be published here as activities are confirmed.',1,true),
('healthcare','Healthcare','Improving access to basic health services and health awareness.','Our healthcare programme aims to improve access to basic health services, health education and preventive care in communities with limited support.',2,true),
('youth-empowerment','Youth Empowerment','Equipping young people with skills, mentorship and opportunity.','Through mentorship, skills development and leadership opportunities, this programme seeks to help young people build productive, independent futures.',3,true),
('community-development','Community Development','Supporting community-led solutions for lasting change.','We work alongside communities to support locally led initiatives that strengthen livelihoods, wellbeing and resilience.',4,true);