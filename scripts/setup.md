# Setup Guide

Follow these steps to set up your link shortener application:

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the following SQL scripts in order:

### Step 1: Create the links table

```sql
-- Run scripts/001_create_links_table.sql
```

### Step 2: Add TinyURL support

```sql
-- Run scripts/002_update_links_table_for_tinyurl.sql
```

## 3. Verify Setup

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Try shortening a URL
4. Check that the redirect works by visiting the shortened URL

## 4. Troubleshooting

### Common Issues:

1. **"Unauthorized" error**: Check your Supabase environment variables
2. **"Link not found" error**: Ensure the database schema is properly set up
3. **TinyURL API errors**: The service uses HTTPS and should work in production
4. **Redirect not working**: Check that both `short_code` and `tinyurl_alias` columns exist

### Database Verification:

Run this query in Supabase SQL Editor to verify your table structure:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'links'
ORDER BY ordinal_position;
```

You should see columns: `id`, `original_url`, `short_code`, `tinyurl_alias`, `external_short_url`, `user_id`, `created_at`, `updated_at`, `clicks`, `is_active`.

## 5. Production Deployment

1. Set environment variables in your hosting platform
2. Ensure HTTPS is enabled
3. Test the TinyURL API integration
4. Verify redirects work properly
