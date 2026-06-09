create table click_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  voiture_id text references voitures(id) on delete set null,
  voiture_label text,
  voiture_url text,
  search_query text,
  created_at timestamptz default now()
);

alter table click_events enable row level security;

create policy "Public insert" on click_events for insert with check (true);
create policy "Public read" on click_events for select using (true);