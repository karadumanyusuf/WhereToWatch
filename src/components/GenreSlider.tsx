import { useEffect, useState } from 'react';
import { Movie } from '@/types/tmdb';
import { getImageUrl, enrichMoviesWithProviders } from '@/lib/tmdb';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TMDB_API_KEY = 'fbf6e8e7efbd0e215ee831868505f6f8';

interface GenreSliderProps {
  genreId: number;
  genreKey: string;
  onViewPlatforms: (movie: Movie) => void;
}

export const GenreSlider = ({ genreId, genreKey, onViewPlatforms }: GenreSliderProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchGenreMovies = async () => {
      try {
        const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&language=${langCode}&page=1`
        );
        const data = await response.json();
        const moviesWithType = data.results.slice(0, 10).map((m: any) => ({ ...m, media_type: 'movie' as const }));
        setMovies(moviesWithType);
        setIsLoading(false);
        
        // Enrich with providers
        const enriched = await enrichMoviesWithProviders(moviesWithType);
        setMovies(enriched);
      } catch (error) {
        console.error('Error fetching genre movies:', error);
        setIsLoading(false);
      }
    };

    fetchGenreMovies();
  }, [genreId, language]);

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`genre-${genreId}`);
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
        <h3 className="font-display text-xl font-bold mb-4">{t(`section.${genreKey}`)}</h3>
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-40 h-60 rounded-xl bg-muted animate-shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="font-display text-xl font-bold mb-4">{t(`section.${genreKey}`)}</h3>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <div
          id={`genre-${genreId}`}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <motion.div
              key={movie.id}
              className="flex-shrink-0 w-40 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => onViewPlatforms(movie)}
            >
              <div className="relative rounded-xl overflow-hidden aspect-[2/3]">
                {movie.poster_path ? (
                  <img
                    src={getImageUrl(movie.poster_path, 'w300') || ''}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
                {movie.vote_average > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg rating-badge text-xs font-bold text-background">
                    <Star className="h-3 w-3 fill-current" />
                    {movie.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm font-medium line-clamp-1">{movie.title || movie.name}</p>
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
