import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <motion.div
      className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 backdrop-blur-sm border border-border/50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Globe className="h-4 w-4 text-muted-foreground ml-1" />
      <button
        onClick={() => setLanguage('tr')}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors",
          language === 'tr'
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        TR
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          "px-2 py-1 text-xs font-medium rounded transition-colors",
          language === 'en'
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
    </motion.div>
  );
};
