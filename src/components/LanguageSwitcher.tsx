'use client';

import { Globe, Check } from 'lucide-react';
import { useLanguageStore, translations } from '@/store/languageStore';
import { useState, useRef, useEffect } from 'react';

const languageLabels = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = ['en', 'zh-CN', 'zh-TW'] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{languageLabels[language]}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg ${
                language === lang ? 'text-primary font-medium' : 'text-slate-600'
              }`}
            >
              {languageLabels[lang]}
              {language === lang && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  return (key: keyof typeof translations.en) => translations[language][key] || translations.en[key] || key;
}