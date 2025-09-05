# KnuckleLink

A modern, full-stack link shortening application built with Next.js, Supabase, and TinyURL API. Create short, shareable links with click tracking and analytics.

## Features

- 🔗 **Instant Link Shortening**: Convert long URLs to short, memorable links using TinyURL API
- 📊 **Click Analytics**: Track how many times your links are clicked
- 👤 **User Authentication**: Secure user accounts with Supabase Auth
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and shadcn/ui
- 🚀 **Fast & Reliable**: Built with Next.js 15 and optimized for performance
- 📱 **Mobile Friendly**: Responsive design that works on all devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Link Shortening**: TinyURL API
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd knucklelink
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL scripts in the `scripts/` folder in order:
   - `001_create_links_table.sql`
   - `002_update_links_table_for_tinyurl.sql`

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

### For Users

1. **Shorten a Link**: Enter a long URL in the input field and click "Shorten"
2. **Create Account**: Sign up to track your links and view analytics
3. **Custom Aliases**: Create custom short links (e.g., "my-link" → tinyurl.com/my-link)
4. **View Analytics**: See click counts and manage your links in the dashboard

### For Developers

The application uses:

- **TinyURL API** for link shortening (no authentication required)
- **Supabase** for user authentication and data storage
- **Next.js API Routes** for backend functionality
- **Row Level Security** for data protection

## API Endpoints

- `POST /api/links` - Create a new shortened link
- `GET /api/links` - Get user's links with pagination
- `GET /s/[code]` - Redirect to original URL
- `DELETE /api/links/[id]` - Delete a link

## Database Schema

The `links` table includes:

- `id` - Unique identifier
- `original_url` - The original long URL
- `short_code` - Internal short code (required)
- `tinyurl_alias` - TinyURL alias
- `external_short_url` - Full TinyURL
- `user_id` - User who created the link
- `clicks` - Click count
- `is_active` - Whether the link is active

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure the database schema is properly set up
4. Check that all environment variables are configured

## Recent Fixes

- Fixed redirect route to handle both `short_code` and `tinyurl_alias`
- Updated TinyURL service to use HTTPS
- Added proper short code generation for database compatibility
- Improved error handling and validation
