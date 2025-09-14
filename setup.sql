-- Create a table for public user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  points integer default 0 not null
);

-- Set up Row Level Security (RLS) for profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- Create a table for community stats
create table community_stats (
  id int primary key,
  total_bottles_recycled bigint default 0 not null,
  active_recyclers bigint default 0 not null,
  constraint single_row check (id = 1)
);

-- Insert the single row for stats with initial values from the app
insert into community_stats (id, total_bottles_recycled, active_recyclers)
values (1, 125432, 876);

-- Set up RLS for community_stats
alter table community_stats enable row level security;

create policy "Community stats are viewable by everyone." on community_stats
  for select using (true);

-- In a production app, you'd use a server-side function (Edge Function) for security.
create policy "Allow authenticated users to update stats" on community_stats
  for update using (auth.role() = 'authenticated');