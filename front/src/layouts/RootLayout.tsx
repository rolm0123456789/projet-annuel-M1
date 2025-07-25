// src/layouts/RootLayout.tsx
import { Outlet } from '@tanstack/react-router';
import { Header, Footer } from '@/components/layout';
import { CartProvider } from '@/contexts/CartContext';

export function RootLayout() {
  return (
    <CartProvider>
      <div className="relative flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-6">
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  );
}
