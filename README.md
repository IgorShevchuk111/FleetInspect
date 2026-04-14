# FleetInspect 🚛

A modern fleet management and vehicle inspection application built with Next.js, Supabase, and TypeScript.

## 🚀 Features

- **Vehicle Management**: Add, edit, and manage fleet vehicles
- **Inspection System**: Comprehensive pre-trip and post-trip inspections
- **User Authentication**: Secure login with Google OAuth and credentials
- **Real-time Updates**: Live data synchronization with Supabase
- **Mobile Responsive**: Optimized for mobile and desktop use
- **PWA Support**: Progressive Web App capabilities
- **Image Upload**: Photo documentation for inspections
- **Digital Signatures**: Electronic signature capture
- **Timesheet Management**: Employee time tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Authentication**: NextAuth.js
- **Forms**: React Hook Form, Zod validation
- **Icons**: Heroicons, Lucide React
- **PWA**: Next PWA

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fleetInspect
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   AUTH_SECRET=your_auth_secret
   AUTH_GOOGLE_ID=your_google_client_id
   AUTH_GOOGLE_SECRET=your_google_client_secret
   ```

4. **Set up Supabase**

   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`
   - Configure authentication providers

5. **Run the development server**
   ```bash
   pnpm dev
   ```

## 🏗️ Project Structure

```
fleetInspect/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (inspections)/     # Inspection routes
│   ├── api/               # API routes
│   ├── components/        # React components
│   │   ├── forms/         # Form components
│   │   ├── inspection/    # Inspection components
│   │   ├── layout/        # Layout components
│   │   ├── ui/            # UI components
│   │   └── vehicle/       # Vehicle components
│   ├── features/          # Feature-specific code
│   ├── lib/               # Utility functions
│   └── utils/             # Helper functions
├── components/            # Shared UI components (shadcn/ui)
├── public/                # Static assets
├── supabase/              # Database migrations
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm generate-types` - Generate Supabase types

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📱 PWA Features

- Offline support
- Installable on mobile devices
- Push notifications (configured but not implemented)
- App-like experience

## 🔐 Security

- Row Level Security (RLS) enabled on Supabase
- JWT-based authentication
- Secure session management
- Input validation with Zod
- XSS protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
