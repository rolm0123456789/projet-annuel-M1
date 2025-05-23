import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-16 sm:py-24">
      {/* Décoration de fond */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,hsl(var(--background)),rgba(255,255,255,0.6))] dark:bg-grid-slate-700" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            Nouveautés disponibles
          </Badge>

          {/* Titre principal */}
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Découvrez nos
            <span className="text-primary"> produits </span>
            exceptionnels
          </h1>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Explorez notre sélection de produits high-tech, gaming et lifestyle. 
            Des marques premium aux meilleurs prix avec une livraison rapide.
          </p>

          {/* Boutons d'action */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg" className="px-8">
              <Link to="/categories">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Voir les produits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/account">
                Créer un compte
              </Link>
            </Button>
          </div>

          {/* Statistiques */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground">Produits disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">24h</div>
              <div className="text-sm text-muted-foreground">Livraison express</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">4.8★</div>
              <div className="text-sm text-muted-foreground">Note moyenne</div>
            </div>
          </div>

          {/* Section visuelle avec cartes */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium">En stock</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Livraison immédiate</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium">Garantie</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">2 ans minimum</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-sm font-medium">Support</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">7j/7 disponible</p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-sm font-medium">Retours</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">30 jours gratuits</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 