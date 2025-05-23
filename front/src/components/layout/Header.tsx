import { Link } from '@tanstack/react-router';
import { ShoppingBag, User, Menu } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SearchCommand } from '@/components/search/SearchCommand';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="text-xl font-bold">MyShop</span>
        </Link>

        {/* Navigation Desktop - Centré */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-10">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Catégories
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {mockCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category.id);
                      return (
                        <NavigationMenuLink key={category.id} asChild>
                          <Link
                            to={`/categories/${category.slug}`}
                            className="flex items-start space-x-3 select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="rounded-md bg-primary/10 p-2">
                              <IconComponent className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium leading-none">
                                {category.name}
                              </div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {category.description}
                              </p>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center space-x-2">
          {/* Recherche */}
          <SearchCommand />

          {/* Mon compte - Desktop */}
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/account" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Mon compte</span>
            </Link>
          </Button>

          {/* Menu Mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center space-x-2">
                  <ShoppingBag className="h-5 w-5" />
                  <span>MyShop</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-6">
                {/* Catégories dans le menu mobile */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Catégories
                  </h3>
                  {mockCategories.map((category) => {
                    const IconComponent = getCategoryIcon(category.id);
                    return (
                      <Link
                        key={category.id}
                        to={`/categories/${category.slug}`}
                        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <div className="rounded-md bg-primary/10 p-1.5">
                          <IconComponent className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span>{category.name}</span>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Autres liens */}
                <div className="border-t pt-4">
                  <Link
                    to="/account"
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <User className="h-4 w-4" />
                    <span>Mon compte</span>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 