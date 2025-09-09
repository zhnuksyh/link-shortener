# KnuckleLink

A modern, full-stack link shortening application built with Next.js 15 and Supabase. Create short, shareable links using TinyURL integration with comprehensive user authentication and link management features.

## Features

- 🔗 **TinyURL Integration**: Leverages TinyURL's reliable shortening service for consistent, working short links
- 👤 **User Authentication**: Secure user accounts with Supabase Auth, email/password authentication, and protected routes
- 📋 **Advanced Link Management**: View, activate, deactivate, and delete your shortened links with full CRUD operations
- 🔍 **Smart Search & Filter**: Find your links quickly with built-in search functionality across titles, URLs, and short codes
- 📝 **Custom Titles**: Add descriptive titles to your links for better organization and identification
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS 4.x and shadcn/ui components
- 📱 **Mobile Friendly**: Fully responsive design with mobile-optimized tables and forms
- 🚀 **Fast & Reliable**: Built with Next.js 15, React 19, and optimized for performance
- 🔄 **Real-time Updates**: Instant feedback with toast notifications, loading states, and smooth animations
- 🛡️ **Secure**: Row-level security, proper authentication handling, and data protection
- 📊 **Link Statistics**: Track your link usage with comprehensive dashboard analytics
- 🔗 **One-Click Sharing**: Copy to clipboard and native Web Share API support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4.x, shadcn/ui components, Radix UI primitives
- **Backend**: Next.js API Routes with server-side rendering
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with SSR support and cookie-based sessions
- **Link Shortening**: TinyURL API integration with fallback error handling
- **UI Components**: Radix UI, Lucide React icons, React Hook Form, Sonner toasts
- **State Management**: React hooks with comprehensive error handling
- **Deployment**: Vercel-ready with environment variable configuration

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
   - `001_create_links_table.sql` - Creates the initial links table with RLS
   - `002_update_links_table_for_tinyurl.sql` - Adds TinyURL integration columns
   - `003_fix_links_table_schema.sql` - Fixes schema constraints for TinyURL
   - `004_add_title_to_links_table.sql` - Adds custom title support
   - `005_remove_tinyurl_alias_unique_constraint.sql` - Allows multiple users per alias

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

1. **Shorten a Link**: Enter a long URL in the input field and click "Shorten" (requires account)
2. **Create Account**: Sign up with email/password to track your links and view analytics
3. **Add Custom Titles**: Give your links descriptive titles for better organization
4. **Manage Links**: View, search, activate/deactivate, and delete your links in the dashboard
5. **View Analytics**: See total links, active links, and detailed link statistics
6. **Copy & Share**: One-click copying and native Web Share API support
7. **Mobile Friendly**: Full functionality available on mobile devices with responsive design

### For Developers

The application architecture:

- **TinyURL Integration**: Uses TinyURL's public API for reliable link shortening
- **Supabase Backend**: PostgreSQL database with Row Level Security for data protection
- **Next.js API Routes**: Server-side API endpoints with proper error handling
- **Authentication Flow**: Supabase Auth with SSR support and cookie-based sessions
- **shadcn/ui Components**: Consistent, accessible UI with Radix UI primitives
- **React Hook Form**: Form validation and handling with Zod schemas
- **Toast Notifications**: User feedback with Sonner toast system
- **TypeScript**: Full type safety throughout the application

### Key Components

- `UrlShortenerForm` - Main link shortening interface
- `LinksTable` - Advanced table with search, filtering, and actions
- `LinkStatsCard` - Statistics display components
- `SiteHeader` - Navigation with authentication state
- `Toast/Toaster` - Notification system for user feedback

## API Endpoints

### Authentication Required

- `POST /api/links` - Create a new shortened link (authenticated users only)
- `GET /api/links` - Get user's links with pagination and search
- `DELETE /api/links/[id]` - Delete a specific link permanently
- `PUT /api/links/[id]` - Update link status (activate/deactivate)

### Public Endpoints

- `POST /api/shorten` - Create a shortened link (requires authentication)
- `GET /s/[code]` - Redirect to original URL (handles TinyURL aliases)

### Authentication Pages

- `GET /auth/login` - User login page with email/password
- `GET /auth/sign-up` - User registration page with email confirmation
- `POST /auth/logout` - User logout endpoint
- `GET /auth/sign-up-success` - Registration success confirmation page

## Database Schema

The `links` table includes:

- `id` - UUID primary key (auto-generated)
- `original_url` - The original long URL (TEXT, required)
- `short_code` - Internal short code (VARCHAR(50), nullable)
- `tinyurl_alias` - TinyURL alias (TEXT, nullable)
- `external_short_url` - Full TinyURL (TEXT, nullable)
- `title` - Custom title for the link (TEXT, nullable)
- `user_id` - User who created the link (UUID, references auth.users)
- `clicks` - Click count (INTEGER, default 0)
- `is_active` - Whether the link is active (BOOLEAN, default true)
- `created_at` - Creation timestamp (TIMESTAMP WITH TIME ZONE)
- `updated_at` - Last update timestamp (TIMESTAMP WITH TIME ZONE)

### Database Features

- **Row Level Security (RLS)** enabled for data protection
- **Automatic timestamps** with triggers for created_at/updated_at
- **Optimized indexes** for fast lookups on tinyurl_alias, user_id, title, and created_at
- **Cascade deletion** when users are deleted
- **Composite unique constraint** on (tinyurl_alias, user_id) to allow multiple users per alias
- **Flexible schema** supporting both custom short codes and TinyURL aliases

## Deployment

### Deploy to Production

1. Push your code to your preferred hosting platform
2. Set up environment variables in your hosting platform
3. Deploy!

### Environment Variables

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `TINYURL_API_TOKEN` - (Optional) TinyURL API token for authenticated requests
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - (Optional) Custom redirect URL for auth

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

- ✨ **TinyURL Integration**: Complete integration with TinyURL API for reliable link shortening
- 🔍 **Advanced Link Management**: Comprehensive search functionality across titles, URLs, and codes
- 📝 **Custom Titles**: Added ability to give custom titles to links for better organization
- 📊 **Enhanced Analytics**: Improved link statistics with dedicated dashboard cards
- 🎨 **Modern Design**: Updated to Tailwind CSS 4.x with smooth animations and responsive design
- 🔄 **Better UX**: Comprehensive error handling, loading states, and real-time feedback
- 🛡️ **Enhanced Security**: Improved authentication flow with Supabase SSR and protected routes
- 📱 **Mobile Optimization**: Fully responsive design with mobile-optimized tables and forms
- 🚀 **Performance**: Optimized API routes, database queries, and client-side rendering
- 🔧 **Developer Experience**: Full TypeScript support, proper error boundaries, and clean code organization

### Technical Improvements

- **TinyURL API Integration**: Robust error handling and fallback mechanisms
- **Database Schema Evolution**: 5 migration scripts for progressive schema improvements
- **Authentication System**: Supabase Auth with SSR support and cookie-based sessions
- **UI Component Library**: Complete shadcn/ui integration with Radix UI primitives
- **Form Handling**: React Hook Form with comprehensive validation
- **Toast System**: Sonner integration for consistent user feedback
- **Search & Filter**: Advanced table functionality with real-time search
- **Mobile Responsiveness**: Optimized for all device sizes with touch-friendly interfaces
