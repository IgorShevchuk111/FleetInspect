'use client';

import { Languages } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from '@/features/driver-journal/i18n/use-translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslations();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Languages className="size-4 text-muted-foreground" aria-hidden="true" />

      <Select
        value={language}
        onValueChange={(value) => {
          if (value === 'en' || value === 'uk') {
            setLanguage(value);
          }
        }}
      >
        <SelectTrigger
          className="h-control w-32 rounded-control"
          aria-label="Select language"
        >
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="uk">Українська</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
