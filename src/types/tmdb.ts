export interface Movie {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  // Platform data (enriched)
  watchProviders?: WatchProviderData;
}

export interface WatchProviderData {
  flatrate?: WatchProvider[]; // Subscription (Netflix, Disney+ etc)
  rent?: WatchProvider[];     // Rent
  buy?: WatchProvider[];      // Buy
  ads?: WatchProvider[];      // Free with ads
  free?: WatchProvider[];     // Completely free
  link?: string;
}

export interface SearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
  ads?: WatchProvider[];
  free?: WatchProvider[];
}

export interface WatchProvidersResponse {
  id: number;
  results: {
    [countryCode: string]: WatchProviderCountry;
  };
}

export interface Genre {
  id: number;
  name: string;
}

// Platform IDs for filtering
export const PLATFORM_IDS: Record<string, number[]> = {
  netflix: [8],
  disney: [337],
  prime: [9, 119],
  apple: [2, 350],
  hbo: [384, 1899],
  blutv: [341],
  exxen: [1870],
  mubi: [11],
  gain: [2139],
};
