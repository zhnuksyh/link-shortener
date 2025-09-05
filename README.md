# KnuckleLink

A modern, full-stack link shortening application built with Next.js and Supabase. Create short, shareable links with user authentication and link management.

## Features

- 🔗 **Instant Link Shortening**: Convert long URLs to short, memorable links with custom domain support
- 👤 **User Authentication**: Secure user accounts with Supabase Auth and protected routes
- 📋 **Advanced Link Management**: View, activate, deactivate, and delete your shortened links
- 📊 **Link Analytics**: Track click counts and view detailed link statistics
- 🔍 **Search & Filter**: Find your links quickly with built-in search functionality
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS and shadcn/ui components
- 📱 **Mobile Friendly**: Fully responsive design that works seamlessly on all devices
- 🚀 **Fast & Reliable**: Built with Next.js 15 and optimized for performance
- 🔄 **Real-time Updates**: Instant feedback with toast notifications and loading states
- 🛡️ **Secure**: Row-level security and proper authentication handling

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4.x, shadcn/ui components, Radix UI primitives
- **Backend**: Next.js API Routes with server-side rendering
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with SSR support
- **Link Shortening**: Custom short code generation with domain support
- **UI Components**: Radix UI, Lucide React icons, React Hook Form
- **State Management**: React hooks with toast notifications (Sonner)
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
3. **Manage Links**: View, search, activate/deactivate, and delete your links in the dashboard
4. **View Analytics**: See click counts and detailed link statistics
5. **Copy & Share**: One-click copying of shortened URLs with instant feedback
6. **Mobile Friendly**: Full functionality available on mobile devices

### For Developers

The application uses:

- **Custom Link Shortening** with domain support (no external API required)
- **Supabase** for user authentication and data storage
- **Next.js API Routes** for backend functionality
- **Row Level Security** for data protection
- **shadcn/ui Components** for consistent, accessible UI
- **React Hook Form** for form validation and handling
- **Toast Notifications** for user feedback

### Key Components

- `UrlShortenerForm` - Main link shortening interface
- `LinksTable` - Advanced table with search, filtering, and actions
- `LinkStatsCard` - Statistics display components
- `SiteHeader` - Navigation with authentication state
- `Toast/Toaster` - Notification system for user feedback

## API Endpoints

### Authentication Required

- `POST /api/links` - Create a new shortened link (authenticated users)
- `GET /api/links` - Get user's links with pagination
- `DELETE /api/links/[id]` - Delete a specific link
- `PUT /api/links/[id]` - Update link status (activate/deactivate)

### Public Endpoints

- `POST /api/shorten` - Create a shortened link (anonymous users)
- `GET /s/[code]` - Redirect to original URL (handles both short_code and tinyurl_alias)

### Authentication

- `GET /auth/login` - User login page
- `GET /auth/sign-up` - User registration page
- `POST /auth/logout` - User logout

## Database Schema

The `links` table includes:

- `id` - UUID primary key (auto-generated)
- `original_url` - The original long URL (TEXT, required)
- `short_code` - Internal short code (VARCHAR(10), unique, nullable)
- `tinyurl_alias` - TinyURL alias (TEXT, nullable)
- `external_short_url` - Full TinyURL (TEXT, nullable)
- `user_id` - User who created the link (UUID, references auth.users)
- `clicks` - Click count (INTEGER, default 0)
- `is_active` - Whether the link is active (BOOLEAN, default true)
- `created_at` - Creation timestamp (TIMESTAMP WITH TIME ZONE)
- `updated_at` - Last update timestamp (TIMESTAMP WITH TIME ZONE)

### Database Features

- **Row Level Security (RLS)** enabled for data protection
- **Automatic timestamps** with triggers for created_at/updated_at
- **Optimized indexes** for fast lookups on short_code, user_id, and created_at
- **Cascade deletion** when users are deleted

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

## Recent Updates & Improvements

### v0.1.0 - Latest Release

- ✨ **Enhanced UI Components**: Added comprehensive shadcn/ui components with toast notifications
- 🔍 **Advanced Link Management**: Implemented search functionality and link filtering in dashboard
- 📊 **Improved Analytics**: Enhanced link statistics display with dedicated stats cards
- 🎨 **Modern Design**: Updated to Tailwind CSS 4.x with improved responsive design
- 🔄 **Better UX**: Added loading states, error handling, and real-time feedback
- 🛡️ **Enhanced Security**: Improved authentication flow and protected routes
- 📱 **Mobile Optimization**: Better mobile experience with responsive tables and forms
- 🚀 **Performance**: Optimized API routes and database queries
- 🔧 **Developer Experience**: Added proper TypeScript types and improved code organization

### Technical Improvements

- Updated to Next.js 15 with React 19
- Integrated Radix UI primitives for better accessibility
- Added React Hook Form for better form handling
- Implemented Sonner for toast notifications
- Enhanced database schema with TinyURL integration
- Added proper error boundaries and validation
