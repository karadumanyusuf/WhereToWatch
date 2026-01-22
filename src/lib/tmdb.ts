import { SearchResponse, WatchProvidersResponse, Movie, WatchProviderData, PLATFORM_IDS } from '@/types/tmdb';

const TMDB_API_KEY = 'fbf6e8e7efbd0e215ee831868505f6f8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const searchMulti = async (query: string, page: number = 1, language: string = 'tr'): Promise<SearchResponse> => {
  if (!query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  
  const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=${langCode}&include_adult=false`
  );
  
  if (!response.ok) {
    throw new Error('TMDB API hatası');
  }
  
  const data = await response.json();
  
  // Filter out person results, keep only movie and tv
  data.results = data.results.filter(
    (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
  );
  
  return data;
};

export const getWatchProviders = async (
  id: number, 
  mediaType: 'movie' | 'tv'
): Promise<WatchProvidersResponse> => {
  const response = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${id}/watch/providers?api_key=${TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('TMDB API hatası');
  }
  
  return response.json();
};

// Fetch watch providers for a single movie/show
export const fetchWatchProvidersForItem = async (item: Movie): Promise<WatchProviderData | null> => {
  try {
    const data = await getWatchProviders(item.id, item.media_type);
    // Prefer TR, fallback to US
    const providers = data.results?.TR || data.results?.US || null;
    if (providers) {
      return {
        flatrate: providers.flatrate,
        rent: providers.rent,
        buy: providers.buy,
        ads: providers.ads,
        free: providers.free,
        link: providers.link,
      };
    }
    return null;
  } catch {
    return null;
  }
};

// Enrich movies with watch provider data (batch)
export const enrichMoviesWithProviders = async (movies: Movie[]): Promise<Movie[]> => {
  const enrichedMovies = await Promise.all(
    movies.map(async (movie) => {
      const watchProviders = await fetchWatchProvidersForItem(movie);
      return { ...movie, watchProviders: watchProviders || undefined };
    })
  );
  return enrichedMovies;
};

export const getTrending = async (
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  timeWindow: 'day' | 'week' = 'week',
  page: number = 1,
  language: string = 'tr'
): Promise<SearchResponse> => {
  const langCode = language === 'tr' ? 'tr-TR' : 'en-US';
  
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=${langCode}&page=${page}`
  );
  
  if (!response.ok) {
    throw new Error('TMDB API hatası');
  }
  
  return response.json();
};

export const getPopularPlatformNames = (providerName: string): { color: string; shortName: string } => {
  const platforms: Record<string, { color: string; shortName: string }> = {
    'Netflix': { color: 'platform-netflix', shortName: 'Netflix' },
    'Disney Plus': { color: 'platform-disney', shortName: 'Disney+' },
    'Apple TV Plus': { color: 'platform-apple', shortName: 'Apple TV+' },
    'Apple TV': { color: 'platform-apple', shortName: 'Apple TV' },
    'Amazon Prime Video': { color: 'platform-amazon', shortName: 'Prime' },
    'Amazon Video': { color: 'platform-amazon', shortName: 'Amazon' },
    'HBO Max': { color: 'platform-hbo', shortName: 'HBO Max' },
    'Max': { color: 'platform-hbo', shortName: 'Max' },
    'BluTV': { color: 'bg-secondary', shortName: 'BluTV' },
    'Exxen': { color: 'bg-accent', shortName: 'Exxen' },
    'Gain': { color: 'bg-primary', shortName: 'Gain' },
    'MUBI': { color: 'bg-muted', shortName: 'MUBI' },
    'Puhu TV': { color: 'bg-secondary', shortName: 'Puhu TV' },
  };
  
  return platforms[providerName] || { color: 'bg-muted', shortName: providerName };
};

// Check if movie matches platform filter
export const matchesPlatformFilter = (movie: Movie, platformKey: string | null): boolean => {
  if (!platformKey) return true;
  if (!movie.watchProviders) return false;
  
  const platformIds = PLATFORM_IDS[platformKey];
  if (!platformIds) return false;
  
  const allProviders = [
    ...(movie.watchProviders.flatrate || []),
    ...(movie.watchProviders.rent || []),
    ...(movie.watchProviders.buy || []),
    ...(movie.watchProviders.ads || []),
    ...(movie.watchProviders.free || []),
  ];
  
  return allProviders.some(provider => platformIds.includes(provider.provider_id));
};

// Check if movie matches price filter
export const matchesPriceFilter = (movie: Movie, priceType: 'all' | 'free' | 'paid'): boolean => {
  if (priceType === 'all') return true;
  if (!movie.watchProviders) return false;
  
  const hasFree = (movie.watchProviders.free?.length || 0) > 0 || 
                  (movie.watchProviders.ads?.length || 0) > 0;
  const hasFlatrate = (movie.watchProviders.flatrate?.length || 0) > 0;
  const hasPaid = (movie.watchProviders.rent?.length || 0) > 0 || 
                  (movie.watchProviders.buy?.length || 0) > 0;
  
  if (priceType === 'free') {
    return hasFree;
  }
  
  if (priceType === 'paid') {
    return hasFlatrate || hasPaid;
  }
  
  return true;
};

// Get primary platforms for a movie (for display on cards)
export const getPrimaryPlatforms = (movie: Movie, limit: number = 3): { name: string; logo: string }[] => {
  if (!movie.watchProviders) return [];
  
  // Priority: flatrate > free/ads > rent > buy
  const allProviders = [
    ...(movie.watchProviders.flatrate || []),
    ...(movie.watchProviders.free || []),
    ...(movie.watchProviders.ads || []),
    ...(movie.watchProviders.rent || []),
    ...(movie.watchProviders.buy || []),
  ];
  
  // Remove duplicates by provider_id
  const uniqueProviders = allProviders.filter(
    (provider, index, self) => 
      index === self.findIndex(p => p.provider_id === provider.provider_id)
  );
  
  return uniqueProviders.slice(0, limit).map(p => ({
    name: p.provider_name,
    logo: getImageUrl(p.logo_path, 'w200') || '',
  }));
};
