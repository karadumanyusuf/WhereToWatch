import { useEffect, useState } from 'react';
import { Movie } from '@/types/tmdb';
import { getTrending, enrichMoviesWithProviders, matchesPlatformFilter, matchesPriceFilter } from '@/lib/tmdb';
import { MovieCard } from './MovieCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { TrendingUp, AlertCircle, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { FilterBar, FilterState } from './FilterBar';
import { Button } from './ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface TrendingSectionProps {
  onViewPlatforms: (movie: Movie) => void;
}

export const TrendingSection = ({ onViewPlatforms }: TrendingSectionProps) => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [filteredTrending, setFilteredTrending] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrichingProviders, setIsEnrichingProviders] = useState(false);
  const [visibleCount, setVisibleCount] = useState(18);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    platform: null,
    priceType: 'all',
  });
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Fetch multiple pages to get up to 100 items
        const [page1, page2, page3, page4, page5] = await Promise.all([
          getTrending('all', 'week', 1, language),
          getTrending('all', 'week', 2, language),
          getTrending('all', 'week', 3, language),
          getTrending('all', 'week', 4, language),
          getTrending('all', 'week', 5, language),
        ]);
        
        const allResults = [
          ...page1.results,
          ...page2.results,
          ...page3.results,
          ...page4.results,
          ...page5.results,
        ];
        
        const filtered = allResults
          .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 100);
        setTrending(filtered);
        setFilteredTrending(filtered);
        setIsLoading(false);
        
        if (filtered.length > 0) {
          setIsEnrichingProviders(true);
          const enrichedResults = await enrichMoviesWithProviders(filtered);
          setTrending(enrichedResults);
          setIsEnrichingProviders(false);
        }
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        setIsEnrichingProviders(false);
      }
    };
    
    fetchTrending();
  }, [language]);

  useEffect(() => {
    let result = [...trending];
    
    if (filters.type !== 'all') {
      result = result.filter(item => item.media_type === filters.type);
    }
    
    if (filters.platform !== null) {
      result = result.filter(item => matchesPlatformFilter(item, filters.platform));
    }
    
    if (filters.priceType !== 'all') {
      result = result.filter(item => matchesPriceFilter(item, filters.priceType));
    }
    
    setFilteredTrending(result);
  }, [filters, trending]);

  const handleRandomContent = () => {
    if (filteredTrending.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredTrending.length);
      const randomMovie = filteredTrending[randomIndex];
      onViewPlatforms(randomMovie);
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  const hasActiveFilters = filters.platform !== null || filters.priceType !== 'all' || filters.type !== 'all';
  const displayedItems = filteredTrending.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTrending.length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div>
      <FilterBar 
        filters={filters} 
        onFilterChange={setFilters}
        onRandomContent={handleRandomContent}
      />

      {isEnrichingProviders && (
        <motion.div 
          className="mb-4 flex items-center gap-2 text-sm text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          {t('provider.loading')}
        </motion.div>
      )}

      <motion.div 
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="p-2 rounded-lg gradient-primary">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold">{t('trending.title')}</h2>
        {filteredTrending.length !== trending.length && (
          <span className="text-sm text-muted-foreground">
            ({filteredTrending.length} {t('search.results')})
          </span>
        )}
      </motion.div>
      
      {filteredTrending.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t('filter.noMatch')}</p>
          {hasActiveFilters && (
            <button 
              onClick={() => setFilters({ type: 'all', platform: null, priceType: 'all' })}
              className="text-primary hover:underline"
            >
              {t('filter.clearAll')}
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayedItems.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onViewPlatforms={onViewPlatforms}
                index={index}
              />
            ))}
          </div>
          
          {hasMore && (
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <ChevronDown className="h-5 w-5" />
                {t('trending.loadMore')}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};
