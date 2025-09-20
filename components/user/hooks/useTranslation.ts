import { useState, useCallback } from 'react';
import { getTranslation, Language, StringKeys } from '../services/localization';

export const useTranslation = (initialLanguage: Language = 'en') => {
    const [language, setLanguage] = useState<Language>(initialLanguage);

    const t = useCallback((key: string): string => {
        return getTranslation(language)(key as StringKeys);
    }, [language]);

    return { t, setLanguage, currentLanguage: language };
};
