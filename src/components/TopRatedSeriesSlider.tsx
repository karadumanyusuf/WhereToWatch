import { useEffect, useState } from 'react';
import { Movie } from '@/types/tmdb';
import { getImageUrl, enrichMoviesWithProviders } from '@/lib/tmdb';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface TopRatedSeriesSliderProps {
  onViewPlatforms: (movie: Movie) => void;
}

export const TopRatedSeriesSlider = ({ onViewPlatforms }: TopRatedSeriesSliderProps) => {
  const [series, setSeries] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchTopRatedSeries = async () => {
      try {
        const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
        // Fetch top rated TV series with rating >= 7.5
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=500&vote_average.gte=7.5&first_air_date.gte=2023-01-01&language=${langCode}&page=1`
        );
        const data = await response.json();
        const seriesWithType = data.results.slice(0, 10).map((s: any) => ({ ...s, media_type: 'tv' as const }));
        setSeries(seriesWithType);
        setIsLoading(false);
        
        // Enrich with providers
        const enriched = await enrichMoviesWithProviders(seriesWithType);
        setSeries(enriched);
      } catch (error) {
        console.error('Error fetching top rated series:', error);
        setIsLoading(false);
      }
    };

    fetchTopRatedSeries();
  }, [language]);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('top-rated-series');
    if (container) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-yellow-500/20">
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
          <h3 className="font-display text-xl font-bold">{t('section.topRated')}</h3>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-48 h-72 rounded-xl bg-muted animate-shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (series.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-yellow-500/20">
          <TrendingUp className="h-5 w-5 text-yellow-500" />
        </div>
        <h3 className="font-display text-xl font-bold">{t('section.topRated')}</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">IMDB 7.5+</span>
      </div>
      
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div
          id="top-rated-series"
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {series.map((show, index) => (
            <motion.div
              key={show.id}
              className="flex-shrink-0 w-48 cursor-pointer"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onViewPlatforms(show)}
            >
              <div className="relative rounded-xl overflow-hidden aspect-[2/3] ring-2 ring-yellow-500/30">
                {show.poster_path ? (
                  <img
                    src={getImageUrl(show.poster_path, 'w300') || ''}
                    alt={show.name || show.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                {show.vote_average > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500 text-black text-sm font-bold">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {show.vote_average.toFixed(1)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-medium line-clamp-2">{show.name || show.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
