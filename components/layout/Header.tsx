'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Languages, LogOut, User, BookOpen } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { createClient } from '@/lib/supabase/client';
import { useSignOut } from '@/lib/auth/hooks/useSignOut';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

export default function Header() {
  const supabase = createClient();
  const signOut = useSignOut();
  const { language, setLanguage, t } = useTranslations();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const email = session?.user?.email;
  const initial = email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header className="border-b border-border/60 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <div className="flex items-center gap-2">
          {/* Language selector - available to everyone */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label={t('language')}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <Languages className="size-4" />
                <span>{language.toUpperCase()}</span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-44 border border-border bg-background shadow-xl"
            >
              <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuRadioGroup
                value={language}
                onValueChange={(value) => {
                  if (value === 'en' || value === 'uk') {
                    setLanguage(value);
                  }
                }}
              >
                <DropdownMenuRadioItem value="en">
                  {t('english')}
                </DropdownMenuRadioItem>

                <DropdownMenuRadioItem value="uk">
                  {t('ukrainian')}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Authentication controls */}
          {loading ? (
            <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('openAccountMenu')}
                  className="flex items-center rounded-full border border-border/70 bg-background p-1 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initial}
                  </span>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 border border-border bg-background shadow-xl"
              >
                <DropdownMenuLabel className="font-normal">
                  <h1 className="font-medium">{t('account')}</h1>

                  {email && (
                    <p className="mt-1 truncate text-body text-muted-foreground">
                      {email}
                    </p>
                  )}
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="text-md">
                  <Link href="/profile">
                    <User />
                    {t('profile')}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="text-md">
                  <Link href="/driver-journal">
                    <BookOpen />
                    {t('driverJournal')}
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={signOut} className="text-md">
                  <LogOut />
                  {t('signOut')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
