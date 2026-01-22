import { Megaphone } from 'lucide-react';

interface AdPlaceholderProps {
  variant?: 'inline' | 'banner';
}

export const AdPlaceholder = ({ variant = 'inline' }: AdPlaceholderProps) => {
  if (variant === 'banner') {
    return (
      <div className="w-full py-8 px-4 border border-dashed border-border/50 rounded-xl bg-muted/20 flex flex-col items-center justify-center gap-2">
        <Megaphone className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Reklam Alanı</p>
        <p className="text-xs text-muted-foreground/60">728x90 Banner</p>
      </div>
    );
  }

  return (
    <div className="col-span-full sm:col-span-1 aspect-[2/3] border border-dashed border-border/50 rounded-xl bg-muted/20 flex flex-col items-center justify-center gap-2 gradient-border">
      <div className="text-center p-4">
        <Megaphone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium">Sponsorlu İçerik</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Reklam alanı</p>
      </div>
    </div>
  );
};
