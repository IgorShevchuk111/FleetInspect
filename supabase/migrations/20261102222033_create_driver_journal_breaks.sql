
-- Create manual break intervals for Driver Journal shifts.

create extension if not exists btree_gist;

-- Ensure that a shift can be referenced together with its owner.
alter table public.driver_journal_shifts
  add constraint driver_journal_shifts_user_id_id_key
  unique (user_id, id);

create table public.driver_journal_breaks (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id)
    on delete cascade,

  shift_id uuid not null,

  start_at timestamptz not null,
  end_at timestamptz not null,

  created_at timestamptz not null default now(),

  constraint driver_journal_breaks_shift_owner_fkey
    foreign key (user_id, shift_id)
    references public.driver_journal_shifts (user_id, id)
    on delete cascade,

  constraint driver_journal_breaks_valid_duration
    check (end_at > start_at),

  constraint driver_journal_breaks_no_overlap
    exclude using gist (
      shift_id with =,
      tstzrange(start_at, end_at, '[)') with &&
    )
);

create index driver_journal_breaks_user_shift_idx
  on public.driver_journal_breaks (user_id, shift_id, start_at);

alter table public.driver_journal_breaks enable row level security;

revoke all on table public.driver_journal_breaks from anon;

grant select, insert, update, delete
  on table public.driver_journal_breaks
  to authenticated;

create policy "Users can read their own breaks"
on public.driver_journal_breaks
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own breaks"
on public.driver_journal_breaks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own breaks"
on public.driver_journal_breaks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own breaks"
on public.driver_journal_breaks
for delete
to authenticated
using (auth.uid() = user_id);
