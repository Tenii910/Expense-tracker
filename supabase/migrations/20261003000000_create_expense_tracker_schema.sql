-- Expense Tracker backend schema for Supabase.
-- Authentication credentials remain in Supabase Auth; never store the app's old
-- localStorage passwordHash values in this database.

begin;

-- User profile and account-level preferences.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null check (length(trim(display_name)) > 0),
  currency_code text not null default 'NGN'
    check (currency_code in ('NGN', 'USD', 'EUR', 'GBP', 'GHS')),
  is_dark boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles as existing_profile (id, email, display_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'User'
    )
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(
          nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
          existing_profile.display_name
        ),
        updated_at = now();
  return new;
end;
$$;

create trigger on_auth_user_created_or_updated
  after insert or update on auth.users
  for each row execute function public.handle_new_auth_user();

-- Built-in categories are global/read-only rows. Custom categories belong to one user.
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  constraint categories_system_owner_check check (
    (is_system and user_id is null) or (not is_system and user_id is not null)
  )
);

create unique index categories_system_name_unique
  on public.categories (lower(name)) where is_system;
create unique index categories_user_name_unique
  on public.categories (user_id, lower(name)) where not is_system;

insert into public.categories (user_id, name, color, is_system) values
  (null, 'Food', '#EF4444', true),
  (null, 'Transport', '#F59E0B', true),
  (null, 'Shopping', '#8B5CF6', true),
  (null, 'Bills', '#3B82F6', true),
  (null, 'Entertainment', '#EC4899', true),
  (null, 'Health', '#10B981', true),
  (null, 'Education', '#6366F1', true),
  (null, 'Other', '#6B7280', true);

create or replace function public.prevent_reserved_category_name()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.is_system or new.user_id is null then
    raise exception 'Only user-owned custom categories can be changed';
  end if;

  if exists (
    select 1
    from public.categories as builtin
    where builtin.is_system
      and lower(builtin.name) = lower(trim(new.name))
  ) then
    raise exception 'Custom category name conflicts with a built-in category';
  end if;

  new.name := trim(new.name);
  return new;
end;
$$;

create trigger categories_reject_reserved_names
  before insert or update of name, user_id, is_system on public.categories
  for each row execute function public.prevent_reserved_category_name();

-- Expenses support CRUD, pinning, import/export, and recurring-generated entries.
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null check (length(trim(category)) between 1 and 60),
  description text not null default '',
  spent_on date not null default current_date,
  pinned boolean not null default false,
  recurring_id uuid,
  occurrence_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_recurring_occurrence_pair_check check (
    recurring_id is null or occurrence_date is not null
  )
);
create index expenses_user_spent_on_idx
  on public.expenses (user_id, spent_on desc, created_at desc);
create index expenses_user_category_idx
  on public.expenses (user_id, category);
create unique index expenses_recurring_occurrence_unique
  on public.expenses (recurring_id, occurrence_date)
  where recurring_id is not null and occurrence_date is not null;

-- Budgets are monthly targets, one per category per user, matching the current app model.
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null check (length(trim(category)) between 1 and 60),
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index budgets_user_category_unique
  on public.budgets (user_id, lower(category));

-- Recurring definitions only; occurrence creation is performed by the RPC below.
create table public.recurring_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null check (length(trim(category)) between 1 and 60),
  description text not null default '',
  frequency text not null check (frequency in ('weekly', 'monthly')),
  day_of_month smallint,
  day_of_week smallint,
  active boolean not null default true,
  starts_on date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_expenses_schedule_check check (
    (
      frequency = 'monthly'
      and day_of_month is not null
      and day_of_month between 1 and 31
      and day_of_week is null
    )
    or (
      frequency = 'weekly'
      and day_of_week is not null
      and day_of_week between 0 and 6
      and day_of_month is null
    )
  )
);
create index recurring_expenses_user_active_idx
  on public.recurring_expenses (user_id, active, starts_on);

alter table public.expenses
  add constraint expenses_recurring_id_fkey
  foreign key (recurring_id) references public.recurring_expenses (id) on delete set null;

create or replace function public.enforce_expense_recurring_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  recurring_owner uuid;
begin
  if new.recurring_id is null then
    return new;
  end if;

  select user_id into recurring_owner
  from public.recurring_expenses
  where id = new.recurring_id;

  if recurring_owner is distinct from new.user_id then
    raise exception 'Recurring expense must belong to the expense owner'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger expenses_recurring_owner_check
  before insert or update of recurring_id, user_id on public.expenses
  for each row execute function public.enforce_expense_recurring_owner();

create table public.expense_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  category text not null check (length(trim(category)) between 1 and 60),
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index expense_templates_user_created_idx
  on public.expense_templates (user_id, created_at desc);

-- Keep updated_at consistent for mutable records.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger expenses_set_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();
create trigger budgets_set_updated_at before update on public.budgets
  for each row execute function public.set_updated_at();
create trigger recurring_expenses_set_updated_at before update on public.recurring_expenses
  for each row execute function public.set_updated_at();
create trigger expense_templates_set_updated_at before update on public.expense_templates
  for each row execute function public.set_updated_at();

-- All user-owned data is isolated by Supabase Auth Row Level Security.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_expenses enable row level security;
alter table public.expense_templates enable row level security;

create policy "Users can read own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));
create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Users can read built-in and own categories"
  on public.categories for select to authenticated
  using (is_system or user_id = (select auth.uid()));
create policy "Users can create own custom categories"
  on public.categories for insert to authenticated
  with check (user_id = (select auth.uid()) and not is_system);
create policy "Users can update own custom categories"
  on public.categories for update to authenticated
  using (user_id = (select auth.uid()) and not is_system)
  with check (user_id = (select auth.uid()) and not is_system);
create policy "Users can delete own custom categories"
  on public.categories for delete to authenticated
  using (user_id = (select auth.uid()) and not is_system);

create policy "Users can manage own expenses"
  on public.expenses for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users can manage own budgets"
  on public.budgets for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users can manage own recurring expenses"
  on public.recurring_expenses for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users can manage own expense templates"
  on public.expense_templates for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Recurring schedules are idempotent. Call this RPC from the signed-in app (or
-- a trusted scheduler using the service role) to create occurrences through a date.
-- Monthly day 29-31 schedules run on the last day of shorter months; weekly day 0 is Sunday.
create or replace function public.generate_recurring_expenses(
  p_through_date date default current_date,
  p_user_id uuid default auth.uid()
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  if p_user_id is null then
    raise exception 'A user id is required';
  end if;

  if p_user_id is distinct from auth.uid()
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authorized to generate expenses for this user'
      using errcode = '42501';
  end if;

  if p_through_date is null then
    raise exception 'Through date cannot be null';
  end if;

  with monthly_occurrences as (
    select
      r.id as recurring_id,
      r.user_id,
      r.amount,
      r.category,
      r.description,
      (
        months.month_start::date
        + least(
            r.day_of_month,
            extract(day from (months.month_start + interval '1 month' - interval '1 day'))::integer
          ) - 1
      )::date as occurrence_date
    from public.recurring_expenses as r
    cross join lateral generate_series(
      date_trunc('month', r.starts_on::timestamp),
      date_trunc('month', p_through_date::timestamp),
      interval '1 month'
    ) as months(month_start)
    where r.user_id = p_user_id
      and r.active
      and r.frequency = 'monthly'
      and r.starts_on <= p_through_date
  ), weekly_occurrences as (
    select
      r.id as recurring_id,
      r.user_id,
      r.amount,
      r.category,
      r.description,
      weeks.occurrence::date as occurrence_date
    from public.recurring_expenses as r
    cross join lateral generate_series(
      (
        r.starts_on
        + ((r.day_of_week - extract(dow from r.starts_on)::integer + 7) % 7)
      )::timestamp,
      p_through_date::timestamp,
      interval '7 days'
    ) as weeks(occurrence)
    where r.user_id = p_user_id
      and r.active
      and r.frequency = 'weekly'
      and r.starts_on <= p_through_date
  ), due_occurrences as (
    select * from monthly_occurrences
    union all
    select * from weekly_occurrences
  )
  insert into public.expenses (
    user_id,
    amount,
    category,
    description,
    spent_on,
    recurring_id,
    occurrence_date
  )
  select
    due.user_id,
    due.amount,
    due.category,
    due.description,
    due.occurrence_date,
    due.recurring_id,
    due.occurrence_date
  from due_occurrences as due
  where due.occurrence_date between (
    select starts_on from public.recurring_expenses where id = due.recurring_id
  ) and p_through_date
  on conflict (recurring_id, occurrence_date)
    where recurring_id is not null and occurrence_date is not null
    do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end;
$$;

revoke all on function public.generate_recurring_expenses(date, uuid) from public, anon;
grant execute on function public.generate_recurring_expenses(date, uuid) to authenticated, service_role;

-- Analytics summaries use the caller's permissions and honor expenses RLS.
create view public.monthly_expense_summary
with (security_invoker = true)
as
select
  user_id,
  date_trunc('month', spent_on)::date as month_start,
  sum(amount)::numeric(14, 2) as total_amount,
  count(*)::bigint as expense_count
from public.expenses
group by user_id, date_trunc('month', spent_on)::date;

create view public.category_expense_summary
with (security_invoker = true)
as
select
  user_id,
  category,
  sum(amount)::numeric(14, 2) as total_amount,
  count(*)::bigint as expense_count
from public.expenses
group by user_id, category;

grant select on public.profiles to authenticated;
grant update (display_name, currency_code, is_dark) on public.profiles to authenticated;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.budgets to authenticated;
grant select, insert, update, delete on public.recurring_expenses to authenticated;
grant select, insert, update, delete on public.expense_templates to authenticated;
grant select on public.monthly_expense_summary, public.category_expense_summary to authenticated;

commit;
