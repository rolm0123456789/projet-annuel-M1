import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/data/mockProducts';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const platform = navigator?.userAgentData?.platform.toLowerCase() || "no-platform";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const handleCategorySelect = (categorySlug: string) => {
    setOpen(false);
    navigate({ to: `/categories/${categorySlug}` });
  };

  const handleProductSelect = (productId: string) => {
    setOpen(false);
    navigate({ to: `/products/${productId}` });
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Rechercher...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-6 select-none items-center gap-1 rounded mr-2 border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">{platform.includes('mac') ? '⌘K' : 'Ctrl+K'}</span>
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher des produits ou catégories..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          {/* Catégories */}
          <CommandGroup heading="Catégories">
            {mockCategories.map((category) => {
              const IconComponent = getCategoryIcon(category.id);
              return (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => handleCategorySelect(category.slug)}
                  className="flex items-center cursor-pointer"
                >
                  <div className="rounded-md bg-primary/10 p-1.5 mr-3">
                    <IconComponent className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span>{category.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {/* Produits */}
          <CommandGroup heading="Produits">
            {mockProducts.slice(0, 8).map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.brand} ${product.category}`}
                onSelect={() => handleProductSelect(product.id)}
                className="flex items-center cursor-pointer"
              >
                <Package className="mr-2 h-4 w-4" />
                <div className="flex items-center justify-between w-full">
                  <div>
                    <span className="font-medium">{product.name}</span>
                    {product.brand && (
                      <span className="text-muted-foreground ml-2 text-sm">
                        {product.brand}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {formatPrice(product.price)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
} 