import { Movie } from '@/types/tmdb';
import { getImageUrl, getPrimaryPlatforms } from '@/lib/tmdb';
import { Star, Tv, Film, Play, Monitor, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShareButtons } from './ShareButtons';
import { useLanguage } from '@/contexts/LanguageContext';

interface MovieCardProps {
  movie: Movie;
  onViewPlatforms: (movie: Movie) => void;
  index: number;
}

export const MovieCard = ({ movie, onViewPlatforms, index }: MovieCardProps) => {
  const { t } = useLanguage();
  const title = movie.title || movie.name || 'Unknown';
  const releaseDate = movie.release_date || movie.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const posterUrl = getImageUrl(movie.poster_path, 'w500');
  const rating = movie.vote_average?.toFixed(1);
  const isMovie = movie.media_type === 'movie';
  
  // Check if movie is in cinemas (released within last 2 months and no streaming providers)
  const isInCinema = isMovie && releaseDate && 
    new Date(releaseDate) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
    movie.watchProviders && 
    !movie.watchProviders.flatrate?.length &&
    !movie.watchProviders.free?.length;
  
  // Get primary platforms for display
  const platforms = getPrimaryPlatforms(movie, 4);
  const hasProviders = movie.watchProviders && (
    (movie.watchProviders.flatrate?.length || 0) > 0 ||
    (movie.watchProviders.free?.length || 0) > 0 ||
    (movie.watchProviders.ads?.length || 0) > 0 ||
    (movie.watchProviders.rent?.length || 0) > 0 ||
    (movie.watchProviders.buy?.length || 0) > 0
  );

  return (
    <motion.div 
      className="group relative gradient-border rounded-xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onClick={() => onViewPlatforms(movie)}
      style={{
        boxShadow: 'var(--card-shadow, 0 4px 20px rgba(0,0,0,0.1))'
      }}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {posterUrl ? (
          <motion.img
            src={posterUrl}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {isMovie ? (
              <Film className="h-16 w-16 text-muted-foreground" />
            ) : (
              <Tv className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
        
        {/* Rating badge */}
        {rating && parseFloat(rating) > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg rating-badge text-xs font-bold text-background">
            <Star className="h-3 w-3 fill-current" />
            {rating}
          </div>
        )}
        
        {/* Type badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-sm text-xs font-medium">
          {isMovie ? (
            <>
              <Film className="h-3 w-3" />
              {t('filter.movie')}
            </>
          ) : (
            <>
              <Tv className="h-3 w-3" />
              {t('filter.tv')}
            </>
          )}
        </div>
        
        {/* Cinema badge */}
        {isInCinema && (
          <div className="absolute top-12 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">
            <Clapperboard className="h-3 w-3" />
            {t('card.inCinema')}
          </div>
        )}
        
        {/* Share buttons */}
        <motion.div 
          className="absolute top-12 right-3"
          initial={{ opacity: 0, x: 10 }}
          whileHover={{ opacity: 1, x: 0 }}
        >
          <ShareButtons title={title} compact />
        </motion.div>
        
        {/* Platform badges at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          {hasProviders && platforms.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              {platforms.map((platform, idx) => (
                <motion.div
                  key={idx}
                  className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-lg border border-border/50"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  title={platform.name}
                >
                  {platform.logo ? (
                    <img 
                      src={platform.logo} 
                      alt={platform.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-xs font-bold">
                      {platform.name.charAt(0)}
                    </div>
                  )}
                </motion.div>
              ))}
              {movie.watchProviders && (
                (movie.watchProviders.flatrate?.length || 0) +
                (movie.watchProviders.free?.length || 0) +
                (movie.watchProviders.ads?.length || 0) +
                (movie.watchProviders.rent?.length || 0) +
                (movie.watchProviders.buy?.length || 0)
              ) > platforms.length && (
                <div className="px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm text-xs font-medium">
                  +{(
                    (movie.watchProviders?.flatrate?.length || 0) +
                    (movie.watchProviders?.free?.length || 0) +
                    (movie.watchProviders?.ads?.length || 0) +
                    (movie.watchProviders?.rent?.length || 0) +
                    (movie.watchProviders?.buy?.length || 0)
                  ) - platforms.length}
                </div>
              )}
            </div>
          ) : isInCinema ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-accent/80 backdrop-blur-sm text-accent-foreground text-xs">
              <Clapperboard className="h-3 w-3" />
              <span>{t('card.inCinema')}</span>
            </div>
          ) : movie.watchProviders === undefined ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/70 backdrop-blur-sm text-xs text-muted-foreground">
              <Monitor className="h-3 w-3 animate-pulse" />
              <span>{t('card.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/10 text-destructive text-xs">
              <Monitor className="h-3 w-3" />
              <span>{t('card.noPlatform')}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-4 bg-card">
        <h3 className="font-display font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        {year && (
          <p className="text-sm text-muted-foreground mt-1">{year}</p>
        )}
        
        {movie.overview && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">
            {movie.overview}
          </p>
        )}
        
        {/* Mobile button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewPlatforms(movie);
          }}
          variant="outline"
          className="w-full mt-3 md:hidden border-primary/50 hover:bg-primary hover:text-primary-foreground"
        >
          <Play className="h-4 w-4 mr-2" />
          {t('card.platforms')}
        </Button>
      </div>
    </motion.div>
  );
};
