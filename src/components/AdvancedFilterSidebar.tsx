import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Tv, Monitor, Shuffle, X, ChevronDown, Star, Calendar, Tag } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface AdvancedFilterState {
  type: 'all' | 'movie' | 'tv';
  platforms: string[];
  priceType: 'all' | 'free' | 'paid';
  genres: number[];
  minRating: number;
  yearFrom: number;
  yearTo: number;
}

interface AdvancedFilterSidebarProps {
  filters: AdvancedFilterState;
  onFilterChange: (filters: AdvancedFilterState) => void;
  onRandomContent: () => void;
  isMobile?: boolean;
}

const platformOptions = [
  { value: 'netflix', label: 'Netflix', logo: 'https://image.tmdb.org/t/p/w200/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' },
  { value: 'disney', label: 'Disney+', logo: 'https://image.tmdb.org/t/p/w200/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg' },
  { value: 'prime', label: 'Prime Video', logo: 'https://image.tmdb.org/t/p/w200/dQeAar5H991VYporEjUspolDarG.jpg' },
  { value: 'apple', label: 'Apple TV+', logo: 'https://image.tmdb.org/t/p/w200/6uhKBfmtzFqOcLousHwZuzcrScK.jpg' },
  { value: 'hbo', label: 'Max', logo: 'https://image.tmdb.org/t/p/w200/6Q3ZYUNA9Hsgj6iWnVsw2gR5V77.jpg' },
  { value: 'mubi', label: 'MUBI', logo: 'https://image.tmdb.org/t/p/w200/bVR4Z1LCHY7gidXAJF5pMa4QrDS.jpg' },
  { value: 'blutv', label: 'BluTV', logo: 'https://image.tmdb.org/t/p/w200/fZGNRFGRLR4c0hLjKf6mZ4ULhF8.jpg' },
  { value: 'exxen', label: 'Exxen', logo: 'https://image.tmdb.org/t/p/w200/uPjLWpKj0rxphZECgtwSxXRK8vL.jpg' },
];

const genreOptions = [
  { id: 28, key: 'action', tr: 'Aksiyon', en: 'Action' },
  { id: 12, key: 'adventure', tr: 'Macera', en: 'Adventure' },
  { id: 16, key: 'animation', tr: 'Animasyon', en: 'Animation' },
  { id: 35, key: 'comedy', tr: 'Komedi', en: 'Comedy' },
  { id: 80, key: 'crime', tr: 'Suç', en: 'Crime' },
  { id: 99, key: 'documentary', tr: 'Belgesel', en: 'Documentary' },
  { id: 18, key: 'drama', tr: 'Drama', en: 'Drama' },
  { id: 10751, key: 'family', tr: 'Aile', en: 'Family' },
  { id: 14, key: 'fantasy', tr: 'Fantastik', en: 'Fantasy' },
  { id: 36, key: 'history', tr: 'Tarih', en: 'History' },
  { id: 27, key: 'horror', tr: 'Korku', en: 'Horror' },
  { id: 10402, key: 'music', tr: 'Müzik', en: 'Music' },
  { id: 9648, key: 'mystery', tr: 'Gizem', en: 'Mystery' },
  { id: 10749, key: 'romance', tr: 'Romantik', en: 'Romance' },
  { id: 878, key: 'scifi', tr: 'Bilim Kurgu', en: 'Sci-Fi' },
  { id: 53, key: 'thriller', tr: 'Gerilim', en: 'Thriller' },
  { id: 10752, key: 'war', tr: 'Savaş', en: 'War' },
  { id: 37, key: 'western', tr: 'Western', en: 'Western' },
];

const currentYear = new Date().getFullYear();

export const AdvancedFilterSidebar = ({ 
  filters, 
  onFilterChange, 
  onRandomContent,
  isMobile = false 
}: AdvancedFilterSidebarProps) => {
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    platform: true,
    genre: false,
    rating: false,
    year: false,
  });
  const { t, language } = useLanguage();

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    onFilterChange({ ...filters, platforms: newPlatforms });
  };

  const toggleGenre = (genreId: number) => {
    const newGenres = filters.genres.includes(genreId)
      ? filters.genres.filter(g => g !== genreId)
      : [...filters.genres, genreId];
    onFilterChange({ ...filters, genres: newGenres });
  };

  const clearFilters = () => {
    onFilterChange({
      type: 'all',
      platforms: [],
      priceType: 'all',
      genres: [],
      minRating: 0,
      yearFrom: 1900,
      yearTo: currentYear,
    });
  };

  const hasActiveFilters = 
    filters.type !== 'all' || 
    filters.platforms.length > 0 || 
    filters.priceType !== 'all' ||
    filters.genres.length > 0 ||
    filters.minRating > 0 ||
    filters.yearFrom > 1900 ||
    filters.yearTo < currentYear;

  const SectionHeader = ({ 
    title, 
    icon: Icon, 
    section,
    badge
  }: { 
    title: string; 
    icon: any; 
    section: keyof typeof expandedSections;
    badge?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full py-3 text-left"
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-sm">{title}</span>
        {badge !== undefined && badge > 0 && (
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
            {badge}
          </span>
        )}
      </div>
      <ChevronDown className={cn(
        "h-4 w-4 text-muted-foreground transition-transform",
        expandedSections[section] && "rotate-180"
      )} />
    </button>
  );

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border p-4",
      isMobile ? "w-full" : "w-72 sticky top-4"
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold">{t('filter.filters')}</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive h-8">
            <X className="h-4 w-4 mr-1" />
            {t('filter.clear')}
          </Button>
        )}
      </div>

      {/* Type Filter */}
      <div className="border-b border-border">
        <SectionHeader title={t('filter.type')} icon={Monitor} section="type" />
        <AnimatePresence>
          {expandedSections.type && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <div className="flex flex-col gap-2">
                {[
                  { value: 'all', label: t('filter.all'), icon: Monitor },
                  { value: 'movie', label: t('filter.movie'), icon: Film },
                  { value: 'tv', label: t('filter.tv'), icon: Tv },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange({ ...filters, type: option.value as any })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      filters.type === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Platform Filter */}
      <div className="border-b border-border">
        <SectionHeader 
          title={t('filter.platform')} 
          icon={Monitor} 
          section="platform" 
          badge={filters.platforms.length}
        />
        <AnimatePresence>
          {expandedSections.platform && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <div className="flex flex-col gap-2">
                {platformOptions.map((platform) => (
                  <label
                    key={platform.value}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={filters.platforms.includes(platform.value)}
                      onCheckedChange={() => togglePlatform(platform.value)}
                    />
                    <img 
                      src={platform.logo} 
                      alt={platform.label}
                      className="w-6 h-6 rounded object-cover"
                    />
                    <span className="text-sm">{platform.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Genre Filter */}
      <div className="border-b border-border">
        <SectionHeader 
          title={t('filter.genre')} 
          icon={Tag} 
          section="genre" 
          badge={filters.genres.length}
        />
        <AnimatePresence>
          {expandedSections.genre && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <div className="flex flex-wrap gap-2">
                {genreOptions.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-xs transition-colors",
                      filters.genres.includes(genre.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 hover:bg-muted"
                    )}
                  >
                    {language === 'tr' ? genre.tr : genre.en}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Rating Filter */}
      <div className="border-b border-border">
        <SectionHeader title={t('filter.rating')} icon={Star} section="rating" />
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <div className="px-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    {filters.minRating > 0 ? `${filters.minRating}+ ${t('filter.ratingAbove')}` : t('filter.all')}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{filters.minRating || '0'}</span>
                  </div>
                </div>
                <Slider
                  value={[filters.minRating]}
                  onValueChange={([value]) => onFilterChange({ ...filters, minRating: value })}
                  min={0}
                  max={9}
                  step={0.5}
                  className="w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Year Filter */}
      <div className="border-b border-border">
        <SectionHeader title={t('filter.year')} icon={Calendar} section="year" />
        <AnimatePresence>
          {expandedSections.year && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pb-3"
            >
              <div className="px-2 space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">{t('filter.yearFrom')}</label>
                  <input
                    type="number"
                    value={filters.yearFrom}
                    onChange={(e) => onFilterChange({ ...filters, yearFrom: parseInt(e.target.value) || 1900 })}
                    min={1900}
                    max={currentYear}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t('filter.yearTo')}</label>
                  <input
                    type="number"
                    value={filters.yearTo}
                    onChange={(e) => onFilterChange({ ...filters, yearTo: parseInt(e.target.value) || currentYear })}
                    min={1900}
                    max={currentYear}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Random Button */}
      <motion.button
        onClick={onRandomContent}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-xl gradient-primary text-primary-foreground font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Shuffle className="h-4 w-4" />
        {t('filter.random')}
      </motion.button>
    </div>
  );
};
