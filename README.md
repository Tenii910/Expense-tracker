# Expense Tracker

A Next.js expense-tracking application with Supabase Auth and a PostgreSQL backend protected by row-level security.

## Supabase setup

1. Create a Supabase project.
2. Apply the migration in one of these ways:
   - In the Supabase SQL Editor, run the SQL migrations in `supabase/migrations/` in filename order. The second migration adds the authenticated-user default needed for custom categories.
   - With the Supabase CLI, authenticate, link this workspace to your project, and run `supabase db push`. The project config and migration history are under `supabase/`.
3. Put your project URL and **publishable** key in the root `.env` file (the existing local `.env` is git-ignored):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
   ```

   Do not put a service-role key in a `NEXT_PUBLIC_` variable or in browser code.
4. In Supabase Authentication settings, configure the site URL and allowed redirect URLs for your local and deployed app. Choose whether email confirmation is required. When confirmation is enabled, users must confirm before signing in.
5. Install dependencies and run `npm run dev`. The app uses port 3005.

The database schema includes profiles/preferences, expenses, budgets, recurring expenses, templates, custom and built-in categories, row-level security policies, analytics views, and an idempotent recurring-expense RPC. Recurring entries are generated when an authenticated account loads its data. Supabase Auth handles passwords; the old local Base64 password values are not used or migrated. The checked-in migration is the local source of truth; it is not applied to a remote project until you link and push it (or execute it in the SQL Editor).

## Development

```bash
npm install
npm run dev
```

Other scripts: `npm run lint`, `npm run build`, and `npm start`.

## Existing local data

The app now reads and writes account data through Supabase. It does not automatically import existing browser localStorage records into a Supabase account. Export a local backup before switching backends; the in-app restore action imports its data into the currently signed-in account.
