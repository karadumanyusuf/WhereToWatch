import { Coffee } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const BuyMeCoffee = () => {
  const { t } = useLanguage();

  return (
    <a
      href="https://buymeacoffee.com/yuzarsif"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-coffee hover:bg-coffee-hover text-background font-semibold shadow-lg animate-pulse-glow hover:animate-wiggle transition-all duration-300 hover:scale-105"
    >
      <Coffee className="h-5 w-5" />
      <span className="hidden sm:inline">{t('coffee.button')}</span>
      <span className="sm:hidden">☕</span>
    </a>
  );
};
