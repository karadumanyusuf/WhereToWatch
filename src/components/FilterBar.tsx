import { useState } from 'react';
import { Film, Tv, Monitor, X, Shuffle, DollarSign, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface FilterState {
  type: 'all' | 'movie' | 'tv';
  platform: string | null;
  priceType: 'all' | 'free' | 'paid';
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onRandomContent: () => void;
}

const platformOptions = [
  { value: null, labelKey: 'filter.all', logo: null },
  { value: 'netflix', label: 'Netflix', logo: 'https://image.tmdb.org/t/p/w200/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
  { value: 'disney', label: 'Disney+', logo: 'https://image.tmdb.org/t/p/w200/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
  { value: 'prime', label: 'Prime', logo: 'https://image.tmdb.org/t/p/w200/dQeAar5H991VYporEjUspolDarG.jpg' },
  { value: 'apple', label: 'Apple TV+', logo: 'https://image.tmdb.org/t/p/w200/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
  { value: 'hbo', label: 'Max', logo: 'https://image.tmdb.org/t/p/w200/6Q3ZYUNA9Hsgj6iWnVsw2gR5V77.jpg' },
  { value: 'mubi', label: 'MUBI', logo: 'https://image.tmdb.org/t/p/w200/bVR4Z1LCHY7gidXAJF5pMa4QrDS.jpg' },
];

export const FilterBar = ({ filters, onFilterChange, onRandomContent }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  const typeOptions = [
    { value: 'all', label: t('filter.all'), icon: Monitor },
    { value: 'movie', label: t('filter.movie'), icon: Film },
    { value: 'tv', label: t('filter.tv'), icon: Tv },
  ];

  const priceOptions = [
    { value: 'all', label: t('filter.all'), icon: null },
    { value: 'free', label: t('filter.free'), icon: Gift },
    { value: 'paid', label: t('filter.paid'), icon: DollarSign },
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.platform !== null || filters.priceType !== 'all';

  const clearFilters = () => {
    onFilterChange({ type: 'all', platform: null, priceType: 'all' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-4 mb-6 border border-border/50"
    >
      {/* Mobile toggle */}
      <div className="flex items-center justify-between md:hidden mb-4">
        <span className="text-sm font-medium text-muted-foreground">{t('filter.filters')}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary"
        >
          {isExpanded ? t('filter.hide') : t('filter.show')}
        </Button>
      </div>

      {/* Filter content */}
      <div className={cn(
        "grid gap-4 md:grid-cols-4",
        !isExpanded && "hidden md:grid"
      )}>
        {/* Type filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {t('filter.type')}
          </label>
          <div className="flex gap-1 flex-wrap">
            {typeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = filters.type === option.value;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => updateFilter('type', option.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Platform filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {t('filter.platform')}
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {platformOptions.map((option) => {
              const isActive = filters.platform === option.value;
              const displayLabel = option.labelKey ? t(option.labelKey) : option.label;
              return (
                <motion.button
                  key={option.value ?? 'all'}
                  onClick={() => updateFilter('platform', option.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.logo && (
                    <img 
                      src={option.logo} 
                      alt={displayLabel} 
                      className="w-5 h-5 rounded object-cover"
                    />
                  )}
                  {displayLabel}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Price filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">
            {t('filter.price')}
          </label>
          <div className="flex gap-1">
            {priceOptions.map((option) => {
              const isActive = filters.priceType === option.value;
              const Icon = option.icon;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => updateFilter('priceType', option.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {option.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <motion.button
            onClick={onRandomContent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Shuffle className="h-4 w-4" />
            {t('filter.random')}
          </motion.button>
          
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearFilters}
                className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
