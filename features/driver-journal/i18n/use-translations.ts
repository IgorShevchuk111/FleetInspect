
'use client';

import { useContext } from 'react';

import { LanguageContext } from './language-provider';
import en from './translations/en';
import uk from './translations/uk';

type TranslationKey = keyof typeof en;

export function useTranslations() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error(
            'useTranslations must be used within DriverJournalLanguageProvider',
        );
    }

    const translations = context.language === 'uk' ? uk : en;

    function t(key: TranslationKey): string {
        return translations[key];
    }

    return {
        language: context.language,
        setLanguage: context.setLanguage,
        t,
    };
}
