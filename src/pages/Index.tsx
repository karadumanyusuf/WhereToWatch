import { useState, useEffect } from 'react';
import { Movie } from '@/types/tmdb';
import { searchMulti, enrichMoviesWithProviders, matchesPlatformFilter, matchesPriceFilter } from '@/lib/tmdb';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchBar } from '@/components/SearchBar';
import { MovieCard } from '@/components/MovieCard';
import { PlatformModal } from '@/components/PlatformModal';
import { BuyMeCoffee } from '@/components/BuyMeCoffee';
import { AdPlaceholder } from '@/components/AdPlaceholder';
import { Footer } from '@/components/Footer';
import { TrendingSection } from '@/components/TrendingSection';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { GenreSlider } from '@/components/GenreSlider';
import { TopRatedSeriesSlider } from '@/components/TopRatedSeriesSlider';
import { AdvancedFilterSidebar, AdvancedFilterState } from '@/components/AdvancedFilterSidebar';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Film, Search, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PLATFORM_IDS } from '@/types/tmdb';
import logo from '@/assets/logo.jpg';

// Genre IDs for sliders
const GENRE_SLIDERS = [
  { id: 10752, key: 'war' },
  { id: 10749, key: 'romance' },
  { id: 10751, key: 'family' },
  { id: 35, key: 'comedy' },
  { id: 878, key: 'scifi' },
];

const currentYear = new Date().getFullYear();

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [filteredResults, setFilteredResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnrichingProviders, setIsEnrichingProviders] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilterState>({
    type: 'all',
    platforms: [],
    priceType: 'all',
    genres: [],
    minRating: 0,
    yearFrom: 1900,
    yearTo: currentYear,
  });
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();

  const debouncedQuery = useDebounce(searchQuery, 400);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsLoading(true);
      setIsEnrichingProviders(false);
      searchMulti(debouncedQuery, 1, language)
        .then(async (data) => {
          setResults(data.results);
          setFilteredResults(data.results);
          setIsLoading(false);
          
          // Enrich with provider data
          if (data.results.length > 0) {
            setIsEnrichingProviders(true);
            const enrichedResults = await enrichMoviesWithProviders(data.results);
            setResults(enrichedResults);
            setIsEnrichingProviders(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
          setIsEnrichingProviders(false);
        });
    } else {
      setResults([]);
      setFilteredResults([]);
    }
  }, [debouncedQuery, language]);

  // Apply advanced filters to search results
  useEffect(() => {
    let result = [...results];
    
    // Filter by type
    if (advancedFilters.type !== 'all') {
      result = result.filter(item => item.media_type === advancedFilters.type);
    }
    
    // Filter by platforms (multiple selection)
    if (advancedFilters.platforms.length > 0) {
      result = result.filter(item => {
        if (!item.watchProviders) return false;
        
        const allProviders = [
          ...(item.watchProviders.flatrate || []),
          ...(item.watchProviders.rent || []),
          ...(item.watchProviders.buy || []),
          ...(item.watchProviders.ads || []),
          ...(item.watchProviders.free || []),
        ];
        
        return advancedFilters.platforms.some(platformKey => {
          const platformIds = PLATFORM_IDS[platformKey];
          if (!platformIds) return false;
          return allProviders.some(provider => platformIds.includes(provider.provider_id));
        });
      });
    }
    
    // Filter by genres
    if (advancedFilters.genres.length > 0) {
      result = result.filter(item => {
        if (!item.genre_ids) return false;
        return advancedFilters.genres.some(genreId => item.genre_ids?.includes(genreId));
      });
    }
    
    // Filter by rating
    if (advancedFilters.minRating > 0) {
      result = result.filter(item => (item.vote_average || 0) >= advancedFilters.minRating);
    }
    
    // Filter by year
    if (advancedFilters.yearFrom > 1900 || advancedFilters.yearTo < currentYear) {
      result = result.filter(item => {
        const releaseDate = item.release_date || item.first_air_date;
        if (!releaseDate) return true;
        const year = new Date(releaseDate).getFullYear();
        return year >= advancedFilters.yearFrom && year <= advancedFilters.yearTo;
      });
    }
    
    setFilteredResults(result);
  }, [advancedFilters, results]);

  const handleViewPlatforms = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  const handleRandomContent = () => {
    const source = filteredResults.length > 0 ? filteredResults : results;
    if (source.length > 0) {
      const randomIndex = Math.floor(Math.random() * source.length);
      const randomMovie = source[randomIndex];
      handleViewPlatforms(randomMovie);
    }
  };

  // Insert ad placeholders every 8 items
  const resultsWithAds = filteredResults.reduce<(Movie | 'ad')[]>((acc, item, index) => {
    acc.push(item);
    if ((index + 1) % 8 === 0 && index < filteredResults.length - 1) {
      acc.push('ad');
    }
    return acc;
  }, []);

  const hasSearched = debouncedQuery.trim().length > 0;
  const hasActiveFilters = advancedFilters.platforms.length > 0 || 
    advancedFilters.genres.length > 0 || 
    advancedFilters.minRating > 0 ||
    advancedFilters.yearFrom > 1900 ||
    advancedFilters.yearTo < currentYear ||
    advancedFilters.type !== 'all';

  const activeFilterCount = [
    advancedFilters.type !== 'all',
    advancedFilters.platforms.length > 0,
    advancedFilters.genres.length > 0,
    advancedFilters.minRating > 0,
    advancedFilters.yearFrom > 1900 || advancedFilters.yearTo < currentYear,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      {/* Fixed Controls - Top Right */}
      <motion.div 
        className="fixed top-4 right-4 z-50 flex items-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <LanguageSwitcher />
        <ThemeSwitcher />
      </motion.div>

      {/* Hero Section */}
      <header className="relative pt-12 pb-16 px-4 overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative container mx-auto">
          {/* Logo/Title */}
          <motion.div 
            className="text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-3 mb-4">
              <motion.div 
                className="rounded-2xl overflow-hidden glow-primary"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={logo} alt="Logo" className="h-14 w-14 object-cover" />
              </motion.div>
              <h1 className="font-display text-4xl md:text-5xl font-bold gradient-text">
                {t('app.title')}
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {t('app.description')}
            </p>
          </motion.div>
          
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            isLoading={isLoading && hasSearched}
          />
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <main className="flex-1 container mx-auto px-4 pb-12">
        <div className="flex gap-6">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {hasSearched ? (
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Mobile Filter Button */}
                  {isMobile && (
                    <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="mb-4 gap-2">
                          <SlidersHorizontal className="h-4 w-4" />
                          {t('filter.filters')}
                          {activeFilterCount > 0 && (
                            <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                              {activeFilterCount}
                            </span>
                          )}
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full max-w-sm p-0 overflow-y-auto">
                        <div className="p-4">
                          <AdvancedFilterSidebar
                            filters={advancedFilters}
                            onFilterChange={setAdvancedFilters}
                            onRandomContent={() => {
                              handleRandomContent();
                              setMobileFilterOpen(false);
                            }}
                            isMobile
                          />
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}

                  {/* Loading indicator for provider enrichment */}
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

                  {/* Search Results */}
                  {isLoading ? (
                    <LoadingSkeleton />
                  ) : filteredResults.length > 0 ? (
                    <>
                      <motion.div 
                        className="flex items-center gap-3 mb-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h2 className="font-display text-xl font-semibold">
                          "{debouncedQuery}" - {filteredResults.length} {t('search.results')}
                        </h2>
                      </motion.div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {resultsWithAds.map((item, index) => 
                          item === 'ad' ? (
                            <AdPlaceholder key={`ad-${index}`} variant="inline" />
                          ) : (
                            <MovieCard
                              key={item.id}
                              movie={item}
                              onViewPlatforms={handleViewPlatforms}
                              index={index}
                            />
                          )
                        )}
                      </div>
                    </>
                  ) : hasActiveFilters && results.length > 0 ? (
                    <motion.div 
                      className="text-center py-20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2">
                        {t('filter.noMatch')}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        "{debouncedQuery}" {results.length} {t('filter.noMatchSearch')}
                      </p>
                      <button 
                        onClick={() => setAdvancedFilters({
                          type: 'all',
                          platforms: [],
                          priceType: 'all',
                          genres: [],
                          minRating: 0,
                          yearFrom: 1900,
                          yearTo: currentYear,
                        })}
                        className="text-primary hover:underline"
                      >
                        {t('filter.clearAll')}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="text-center py-20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold mb-2">
                        {t('search.noResults')}
                      </h3>
                      <p className="text-muted-foreground">
                        "{debouncedQuery}" {t('search.noResultsFor')}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Trending Section + Genre Sliders when no search */
                <motion.div
                  key="trending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <TrendingSection onViewPlatforms={handleViewPlatforms} />
                  
                  {/* Bottom Ad Banner */}
                  <div className="my-12">
                    <AdPlaceholder variant="banner" />
                  </div>
                  
                  {/* Genre Sliders Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h2 className="font-display text-2xl font-bold mb-6">{t('section.genres')}</h2>
                    {GENRE_SLIDERS.map((genre) => (
                      <GenreSlider
                        key={genre.id}
                        genreId={genre.id}
                        genreKey={genre.key}
                        onViewPlatforms={handleViewPlatforms}
                      />
                    ))}
                  </motion.div>
                  
                  {/* Top Rated Series Slider */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8"
                  >
                    <TopRatedSeriesSlider onViewPlatforms={handleViewPlatforms} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Bottom Ad Banner for search results */}
            {hasSearched && (
              <div className="mt-12">
                <AdPlaceholder variant="banner" />
              </div>
            )}
          </div>

          {/* Desktop Sidebar - Only visible when searching */}
          {hasSearched && !isMobile && (
            <motion.aside
              className="hidden lg:block w-72 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AdvancedFilterSidebar
                filters={advancedFilters}
                onFilterChange={setAdvancedFilters}
                onRandomContent={handleRandomContent}
              />
            </motion.aside>
          )}
        </div>
      </main>

      {/* Platform Modal */}
      <PlatformModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Buy Me a Coffee Button */}
      <BuyMeCoffee />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
