import { Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import './globals.css';
import { Providers } from './providers';
import Footer from '@/components/layout/Footer';
import Main from '@/components/layout/Main';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'FleetInspect',
  description: 'Fleet inspection management system',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FleetInspect',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Favicon and icon links for better browser support */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icons/icon-16x16.png"
          type="image/png"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/icons/icon-32x32.png"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link
          rel="apple-touch-icon"
          sizes="152x152"
          href="/icons/icon-152x152.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/icon-192x192.png"
        />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Microsoft tiles */}
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />

        {/* Additional PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FleetInspect" />
      </head>
      <body
        className={`h-full bg-gradient-to-b from-blue-50 to-white dark:from-blue-900 dark:to-blue-800 ${inter.className}`}
      >
        <Providers>
          <div className="min-h-full flex flex-col">
            {/* Top accent line */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600" />

            <div className="relative z-[1000]">
              <Header />
            </div>
            <Main>{children}</Main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
