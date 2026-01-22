import { useEffect, useState } from 'react';
import { Movie, WatchProviderCountry, WatchProvider } from '@/types/tmdb';
import { getWatchProviders, getImageUrl, getPopularPlatformNames } from '@/lib/tmdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Loader2, AlertCircle, Tv, Play, ShoppingCart, Radio, Clapperboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareButtons } from './ShareButtons';
import { useLanguage } from '@/contexts/LanguageContext';

interface PlatformModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

// Platform search URL patterns - these will search for the specific content
const getPlatformSearchUrl = (providerId: number, title: string, mediaType: 'movie' | 'tv'): string => {
  const encodedTitle = encodeURIComponent(title);
  
  const platformSearchUrls: Record<number, string> = {
    8: `https://www.netflix.com/search?q=${encodedTitle}`, // Netflix
    1796: `https://www.netflix.com/search?q=${encodedTitle}`, // Netflix with Ads
    337: `https://www.disneyplus.com/search?q=${encodedTitle}`, // Disney+
    119: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodedTitle}`, // Amazon Prime
    9: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodedTitle}`, // Amazon Prime Video
    350: `https://tv.apple.com/search?term=${encodedTitle}`, // Apple TV+
    2: `https://tv.apple.com/search?term=${encodedTitle}`, // Apple TV
    531: `https://www.paramountplus.com/search/?q=${encodedTitle}`, // Paramount+
    341: `https://www.blutv.com/arama?q=${encodedTitle}`, // BluTV
    1899: `https://www.max.com/search?q=${encodedTitle}`, // Max (HBO)
    384: `https://www.max.com/search?q=${encodedTitle}`, // HBO Max
    3: `https://play.google.com/store/search?q=${encodedTitle}&c=movies`, // Google Play
    192: `https://www.youtube.com/results?search_query=${encodedTitle}+${mediaType === 'movie' ? 'full+movie' : 'full+series'}`, // YouTube
    10: `https://www.amazon.com/s?k=${encodedTitle}&i=instant-video`, // Amazon Video
    73: `https://tubitv.com/search/${encodedTitle}`, // Tubi
    386: `https://www.peacocktv.com/search?q=${encodedTitle}`, // Peacock
    387: `https://www.hulu.com/search?q=${encodedTitle}`, // Hulu
    15: `https://www.hulu.com/search?q=${encodedTitle}`, // Hulu
    283: `https://www.crunchyroll.com/search?q=${encodedTitle}`, // Crunchyroll
    11: `https://mubi.com/search?query=${encodedTitle}`, // MUBI
    1870: `https://www.exxen.com/arama?q=${encodedTitle}`, // Exxen
    2139: `https://www.gain.tv/arama?q=${encodedTitle}`, // Gain
  };
  
  return platformSearchUrls[providerId] || '';
};

// Get IMDB search URL
const getImdbSearchUrl = (title: string, year?: string): string => {
  const searchQuery = year ? `${title} ${year}` : title;
  return `https://www.imdb.com/find/?q=${encodeURIComponent(searchQuery)}&s=tt&ttype=ft,tv`;
};

// Get Google search URL for streaming
const getGoogleStreamingSearchUrl = (title: string): string => {
  return `https://www.google.com/search?q=${encodeURIComponent(title + ' izle nereden')}`;
};

const ProviderBadge = ({ 
  provider, 
  title, 
  mediaType 
}: { 
  provider: WatchProvider; 
  title: string;
  mediaType: 'movie' | 'tv';
}) => {
  const logoUrl = getImageUrl(provider.logo_path, 'w200');
  const { shortName } = getPopularPlatformNames(provider.provider_name);
  const platformUrl = getPlatformSearchUrl(provider.provider_id, title, mediaType);
  const { t } = useLanguage();
  
  const handleClick = () => {
    if (platformUrl) {
      window.open(platformUrl, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={!platformUrl}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-primary/20 hover:scale-[1.02] transition-all duration-200 group cursor-pointer border border-transparent hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={provider.provider_name}
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
          <Tv className="h-6 w-6 text-primary" />
        </div>
      )}
      <div className="flex-1 text-left">
        <p className="font-medium group-hover:text-primary transition-colors">
          {shortName}
        </p>
        <p className="text-xs text-muted-foreground">
          {platformUrl ? t('modal.clickToWatch') : 'Platform'}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </button>
  );
};

const ProviderSection = ({ 
  providers, 
  icon: Icon, 
  label,
  title,
  mediaType
}: { 
  providers: WatchProvider[] | undefined; 
  icon: React.ElementType;
  label: string;
  title: string;
  mediaType: 'movie' | 'tv';
}) => {
  if (!providers?.length) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="grid gap-2">
        {providers.map((provider) => (
          <ProviderBadge 
            key={provider.provider_id} 
            provider={provider} 
            title={title}
            mediaType={mediaType}
          />
        ))}
      </div>
    </div>
  );
};

export const PlatformModal = ({ movie, isOpen, onClose }: PlatformModalProps) => {
  const [providers, setProviders] = useState<WatchProviderCountry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (movie && isOpen) {
      setIsLoading(true);
      setError(null);
      setProviders(null);
      
      getWatchProviders(movie.id, movie.media_type)
        .then((data) => {
          // Try Turkey first, then US as fallback
          const trProviders = data.results?.TR;
          const usProviders = data.results?.US;
          setProviders(trProviders || usProviders || null);
        })
        .catch(() => {
          setError(t('modal.noPlatform'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [movie, isOpen, t]);

  const title = movie?.title || movie?.name || 'Unknown';
  const posterUrl = movie?.poster_path ? getImageUrl(movie.poster_path, 'w300') : null;
  const releaseDate = movie?.release_date || movie?.first_air_date;
  
  // Check if in cinemas
  const isInCinema = movie?.media_type === 'movie' && releaseDate && 
    new Date(releaseDate) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
  
  const hasAnyProvider = providers && (
    providers.flatrate?.length || 
    providers.rent?.length || 
    providers.buy?.length ||
    providers.ads?.length ||
    providers.free?.length
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg glass-strong border-border/50 max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-xl gradient-text">
            {t('app.title')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-4 mb-4">
          {posterUrl && (
            <img
              src={posterUrl}
              alt={title}
              className="w-24 h-36 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h3 className="font-display font-semibold text-lg">{title}</h3>
            {movie?.overview && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-5">
                {movie.overview}
              </p>
            )}
            
            {/* Cinema badge */}
            {isInCinema && !hasAnyProvider && (
              <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-accent/20 text-accent-foreground text-sm">
                <Clapperboard className="h-4 w-4" />
                {t('card.inCinema')}
              </div>
            )}
            
            {/* Share buttons */}
            <div className="mt-3">
              <ShareButtons title={title} />
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[50vh] pr-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">{t('provider.loading')}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-3" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : !hasAnyProvider ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <Tv className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-medium">{t('modal.noPlatform')}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {isInCinema ? t('card.inCinema') : t('modal.noPlatform')}
                </p>
              </div>
              
              {/* Fallback buttons */}
              <div className="flex flex-col gap-2 w-full max-w-xs">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getImdbSearchUrl(title, releaseDate?.split('-')[0]), '_blank')}
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg" 
                    alt="IMDB" 
                    className="h-4 w-auto mr-2"
                  />
                  {t('modal.searchImdb')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(getGoogleStreamingSearchUrl(title), '_blank')}
                >
                  <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {t('modal.searchGoogle')}
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="stream" className="w-full">
              <TabsList className="w-full mb-4 bg-muted/50">
                {providers?.flatrate?.length && (
                  <TabsTrigger value="stream" className="flex-1">
                    <Play className="h-4 w-4 mr-1" />
                    {t('modal.subscription')}
                  </TabsTrigger>
                )}
                {(providers?.free?.length || providers?.ads?.length) && (
                  <TabsTrigger value="free" className="flex-1">
                    <Radio className="h-4 w-4 mr-1" />
                    {t('modal.free')}
                  </TabsTrigger>
                )}
                {providers?.rent?.length && (
                  <TabsTrigger value="rent" className="flex-1">
                    {t('modal.rent')}
                  </TabsTrigger>
                )}
                {providers?.buy?.length && (
                  <TabsTrigger value="buy" className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {t('modal.buy')}
                  </TabsTrigger>
                )}
              </TabsList>
              
              {providers?.flatrate?.length && (
                <TabsContent value="stream" className="space-y-3">
                  <ProviderSection 
                    providers={providers.flatrate} 
                    icon={Play} 
                    label={t('modal.subscription')} 
                    title={title}
                    mediaType={movie?.media_type || 'movie'}
                  />
                </TabsContent>
              )}
              
              {(providers?.free?.length || providers?.ads?.length) && (
                <TabsContent value="free" className="space-y-3">
                  <ProviderSection 
                    providers={[...(providers.free || []), ...(providers.ads || [])]} 
                    icon={Radio} 
                    label={t('modal.free')} 
                    title={title}
                    mediaType={movie?.media_type || 'movie'}
                  />
                </TabsContent>
              )}
              
              {providers?.rent?.length && (
                <TabsContent value="rent" className="space-y-3">
                  <ProviderSection 
                    providers={providers.rent} 
                    icon={ExternalLink} 
                    label={t('modal.rent')} 
                    title={title}
                    mediaType={movie?.media_type || 'movie'}
                  />
                </TabsContent>
              )}
              
              {providers?.buy?.length && (
                <TabsContent value="buy" className="space-y-3">
                  <ProviderSection 
                    providers={providers.buy} 
                    icon={ShoppingCart} 
                    label={t('modal.buy')} 
                    title={title}
                    mediaType={movie?.media_type || 'movie'}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
        
      </DialogContent>
    </Dialog>
  );
};
