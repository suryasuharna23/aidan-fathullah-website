import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-body">Dibuat dengan</span>
            <Heart className="w-4 h-4 text-accent fill-accent" />
            <span className="font-body">untuk mengenang Mas Idan</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            Kenangan yang indah akan selalu hidup di hati kita
          </p>
        </div>
      </div>
    </footer>
  );
};
