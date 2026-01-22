import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'tr' | 'en';

interface Translations {
  [key: string]: {
    tr: string;
    en: string;
  };
}

const translations: Translations = {
  // Header
  'app.title': { tr: 'Nereden İzlenir?', en: 'Where to Watch?' },
  'app.description': { tr: 'Film ve dizilerin hangi platformda yayınlandığını anında öğren.', en: 'Find out which platform streams your favorite movies and series.' },
  'app.platforms': { tr: 'Netflix, Disney+, Amazon Prime ve daha fazlası...', en: 'Netflix, Disney+, Amazon Prime and more...' },
  
  // Search
  'search.placeholder': { tr: 'Film veya dizi ara...', en: 'Search movies or series...' },
  'search.results': { tr: 'sonuç', en: 'results' },
  'search.noResults': { tr: 'Sonuç bulunamadı', en: 'No results found' },
  'search.noResultsFor': { tr: 'için herhangi bir film veya dizi bulamadık.', en: 'we couldn\'t find any movies or series.' },
  
  // Filters
  'filter.all': { tr: 'Tümü', en: 'All' },
  'filter.movie': { tr: 'Film', en: 'Movie' },
  'filter.tv': { tr: 'Dizi', en: 'TV Series' },
  'filter.type': { tr: 'Tür', en: 'Type' },
  'filter.platform': { tr: 'Platform', en: 'Platform' },
  'filter.price': { tr: 'Fiyat Durumu', en: 'Price' },
  'filter.free': { tr: 'Ücretsiz', en: 'Free' },
  'filter.paid': { tr: 'Abonelik/Kiralık', en: 'Subscription/Rent' },
  'filter.clear': { tr: 'Temizle', en: 'Clear' },
  'filter.random': { tr: 'Rastgele Öner', en: 'Random Pick' },
  'filter.filters': { tr: 'Filtreler', en: 'Filters' },
  'filter.show': { tr: 'Göster', en: 'Show' },
  'filter.hide': { tr: 'Gizle', en: 'Hide' },
  
  // Advanced filters
  'filter.genre': { tr: 'Tür/Kategori', en: 'Genre' },
  'filter.year': { tr: 'Yıl', en: 'Year' },
  'filter.rating': { tr: 'IMDB Puanı', en: 'IMDB Rating' },
  'filter.ratingAbove': { tr: 've üzeri', en: 'and above' },
  'filter.yearFrom': { tr: 'Yıldan', en: 'From' },
  'filter.yearTo': { tr: 'Yıla', en: 'To' },
  
  // Trending
  'trending.title': { tr: 'Trend Olanlar', en: 'Trending Now' },
  'trending.loadMore': { tr: 'Daha Fazlasını Göster', en: 'Load More' },
  'trending.loading': { tr: 'Yükleniyor...', en: 'Loading...' },
  
  // Card
  'card.platforms': { tr: 'Platformları Gör', en: 'View Platforms' },
  'card.loading': { tr: 'Yükleniyor...', en: 'Loading...' },
  'card.noPlatform': { tr: 'Platform bulunamadı', en: 'No platform found' },
  'card.inCinema': { tr: 'Sinemalarda', en: 'In Cinemas' },
  
  // Modal
  'modal.watchOn': { tr: 'İzleyebileceğiniz Platformlar', en: 'Available Platforms' },
  'modal.subscription': { tr: 'Abonelik', en: 'Subscription' },
  'modal.rent': { tr: 'Kiralık', en: 'Rent' },
  'modal.buy': { tr: 'Satın Al', en: 'Buy' },
  'modal.free': { tr: 'Ücretsiz', en: 'Free' },
  'modal.ads': { tr: 'Reklamlı', en: 'With Ads' },
  'modal.clickToWatch': { tr: 'Tıkla ve izle →', en: 'Click to watch →' },
  'modal.noPlatform': { tr: 'Platform bilgisi bulunamadı', en: 'No platform info found' },
  'modal.searchImdb': { tr: 'IMDB\'de Ara', en: 'Search on IMDB' },
  'modal.searchGoogle': { tr: 'Google\'da Ara', en: 'Search on Google' },
  
  // Sharing
  'share.whatsapp': { tr: 'WhatsApp\'ta Paylaş', en: 'Share on WhatsApp' },
  'share.twitter': { tr: 'X\'te Paylaş', en: 'Share on X' },
  'share.instagram': { tr: 'Instagram\'da Paylaş', en: 'Share on Instagram' },
  'share.vk': { tr: 'VK\'da Paylaş', en: 'Share on VK' },
  'share.telegram': { tr: 'Telegram\'da Paylaş', en: 'Share on Telegram' },
  'share.facebook': { tr: 'Facebook\'ta Paylaş', en: 'Share on Facebook' },
  'share.copy': { tr: 'Linki Kopyala', en: 'Copy Link' },
  'share.copied': { tr: 'Kopyalandı!', en: 'Copied!' },
  'share.text': { tr: 'nerede izlenir? Hemen öğren!', en: 'Where to watch? Find out now!' },
  
  // Sections
  'section.genres': { tr: 'Kategorilere Göre', en: 'By Genre' },
  'section.topRated': { tr: 'Yüksek Puanlı Diziler', en: 'Top Rated Series' },
  'section.war': { tr: 'Savaş', en: 'War' },
  'section.romance': { tr: 'Romantik', en: 'Romance' },
  'section.family': { tr: 'Aile', en: 'Family' },
  'section.comedy': { tr: 'Komedi', en: 'Comedy' },
  'section.scifi': { tr: 'Bilim Kurgu', en: 'Sci-Fi' },
  
  // Footer
  'footer.community': { tr: 'Tamamen ücretsiz bir topluluk projesidir', en: 'A completely free community project' },
  'footer.rights': { tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' },
  
  // Buy me coffee
  'coffee.button': { tr: 'Bana Kahve Ismarla', en: 'Buy Me a Coffee' },
  
  // Provider enrichment
  'provider.loading': { tr: 'Platform bilgileri yükleniyor...', en: 'Loading platform info...' },
  
  // No filter match
  'filter.noMatch': { tr: 'Bu filtrelere uygun içerik bulunamadı.', en: 'No content found for these filters.' },
  'filter.clearAll': { tr: 'Filtreleri temizle', en: 'Clear filters' },
  'filter.noMatchSearch': { tr: 'araması için sonuç bulundu, ancak seçili filtrelere uymuyor.', en: 'results found, but none match the selected filters.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'tr') ? saved : 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
