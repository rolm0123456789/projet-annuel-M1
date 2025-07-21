import { Link } from '@tanstack/react-router';
import { ShoppingBag, User, Menu, LogOut, LogIn, Shield } from 'lucide-react';
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
import { Cart } from '@/components/cart';
import { mockCategories, getCategoryIcon } from '@/data/mockCategories';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { isAuthenticated, user, isAdmin, signOut } = useAuth();

  console.log("isAdmin",isAdmin);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

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
                  <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-3 lg:w-[600px]">
                    {mockCategories.map((category) => {
                      const IconComponent = getCategoryIcon(category.id);
                      return (
                        <NavigationMenuLink key={category.id} asChild>
                          <Link
                            to={`/categories/${category.slug}`}
                            className="group grid h-auto w-full items-center justify-start gap-1 rounded-md bg-background p-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                          >
                            <div className="flex items-center gap-2">
                              <div className="rounded bg-primary/10 p-1">
                                <IconComponent className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-sm font-medium leading-none">
                                {category.name}
                              </div>
                            </div>
                            <div className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {category.description}
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

          {/* Panier */}
          <Cart />

          {isAdmin && (
            <Button variant="ghost" asChild>
              <Link to="/admin" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Administration</span>
              </Link>
            </Button>
          )}

          {/* Authentification - Desktop */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link to="/account" className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-[100px] truncate">{user?.email}</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login" className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Connexion</span>
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/signup">S'inscrire</Link>
              </Button>
            </div>
          )}

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
                
                {/* Menu utilisateur mobile */}
                <div className="border-t pt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-3 py-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{user?.email}</p>
                          <p className="text-xs text-muted-foreground">{user?.role}</p>
                        </div>
                      </div>
                                              <Link
                          to="/account"
                          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <User className="h-4 w-4" />
                          <span>Mon compte</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>Mes commandes</span>
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-blue-600"
                          >
                            <Shield className="h-4 w-4" />
                            <span>Administration</span>
                          </Link>
                        )}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-red-600 w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>Connexion</span>
                      </Link>
                      <Link
                        to="/signup"
                        className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        <User className="h-4 w-4" />
                        <span>S'inscrire</span>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 