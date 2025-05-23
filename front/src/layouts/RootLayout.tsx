// src/layouts/RootLayout.tsx
import { Outlet } from '@tanstack/react-router';
import { Header, Footer } from '@/components/layout';

export function RootLayout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
