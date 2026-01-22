import { Github, Twitter, Instagram, Heart, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left - Project info */}
          <div className="text-center md:text-left">
            <h3 className="font-display font-semibold text-lg gradient-text">
              {t('app.title').replace('?', '')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1">
              {t('footer.community')}
              <Heart className="h-3 w-3 text-destructive inline fill-current" />
            </p>
          </div>
          
          {/* Right - Social icons */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="mailto:hello@example.com"
              className="p-2 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-primary transition-all"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            TMDB API
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            © {new Date().getFullYear()} {t('app.title').replace('?', '')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};
