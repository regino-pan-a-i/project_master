create table projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('quick', 'short', 'medium')),
  description text,
  inspiration text,
  expected_outcomes text,
  status text not null default 'active' check (status in ('active', 'done')),
  started_at timestamptz,
  what_was_possible text,
  what_was_not_possible text,
  what_you_learned text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table steps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  position int not null default 0
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'stuck', 'done')),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
