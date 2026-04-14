import { Inter } from 'next/font/google';
import Header from '@/app/components/shared/Header';
import './globals.css';
import { Providers } from './providers';

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

            <Header />

            <main className="flex-1">
              {/* Hero section background */}
              <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-blue-50 via-transparent to-transparent dark:from-blue-900/20" />
              </div>

              <div className="relative">{children}</div>
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-border dark:border-border bg-white dark:bg-background">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground dark:text-white">
                      FleetInspect
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground dark:text-muted-foreground">
                      Smart fleet management for modern businesses
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">
                      Features
                    </h4>
                    <ul className="mt-4 space-y-2">
                      <li>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                        >
                          Vehicle Management
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                        >
                          Inspections
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                        >
                          Maintenance
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground dark:text-white uppercase tracking-wider">
                      Support
                    </h4>
                    <ul className="mt-4 space-y-2">
                      <li>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                        >
                          Help Center
                        </a>
                      </li>
                      <li>
                        <a
                          href="#"
                          className="text-sm text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-muted-foreground"
                        >
                          Contact
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-border dark:border-border">
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    © {new Date().getFullYear()} FleetInspect
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
