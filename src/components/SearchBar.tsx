import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ value, onChange, isLoading }: SearchBarProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Glow effect */}
      <div className="absolute -inset-1 gradient-primary rounded-2xl opacity-30 blur-xl" />
      
      <div className="relative glass-strong rounded-2xl p-1 gradient-border">
        <div className="relative flex items-center">
          <div className="absolute left-5 text-muted-foreground">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              <Search className="h-6 w-6" />
            )}
          </div>
          
          <Input
            type="text"
            placeholder={t('search.placeholder')}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-16 pl-14 pr-14 text-xl bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
          />
          
          {value && (
            <button
              onClick={() => onChange('')}
              className="absolute right-5 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
      
      {/* Subtle hint text */}
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {t('app.platforms')} 🍿
      </p>
    </div>
  );
};
