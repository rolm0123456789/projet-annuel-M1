// src/layouts/RootLayout.tsx
import { Outlet, Link } from '@tanstack/react-router';

export function RootLayout() {

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">MyShop</Link>
        <nav className="space-x-4">
          <Link to="/categories" className="text-blue-600 hover:underline">Catégories</Link>
          <Link to="/account" className="text-blue-600 hover:underline">Mon compte</Link>
        </nav>
      </header>

      <main className="flex-grow px-4 py-6">
        <Outlet />
      </main>

      <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} MyShop. Tous droits réservés.
      </footer>
    </div>
  );
}
