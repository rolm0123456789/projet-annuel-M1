// src/routes.tsx
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { authService } from '@/lib/auth-service';
import { RootLayout } from '@/layouts/RootLayout';
import Home from '@/pages/Home';
import ProductPage from '@/pages/ProductPage';
import CategoryPage from '@/pages/CategoryPage';
import CategoriesPage from '@/pages/CategoriesPage';
import AccountPage from '@/pages/AccountPage';
import OrdersPage from '@/pages/OrdersPage';
import AdminPage from '@/pages/AdminPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';

const rootRoute = createRootRoute({
  component: RootLayout,
});

// Routes publiques (pas besoin d'authentification)
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$id',
  component: ProductPage,
});

const categoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categorie/$name',
  component: CategoryPage,
});

const categorySlugRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories/$slug',
  component: CategoryPage,
});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoriesPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: () => {
    // Rediriger vers /account si déjà connecté
    if (authService.isAuthenticated()) {
      throw redirect({
        to: '/account',
      });
    }
  },
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
  beforeLoad: () => {
    // Rediriger vers /account si déjà connecté
    if (authService.isAuthenticated()) {
      throw redirect({
        to: '/account',
      });
    }
  },
});

// Routes protégées (authentification requise)
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  beforeLoad: () => {
    // Vérifier l'authentification
    if (!authService.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          // Optionnel: ajouter une redirection après connexion
          redirect: '/account',
        },
      });
    }
  },
  component: AccountPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  beforeLoad: () => {
    // Vérifier l'authentification pour accéder aux commandes
    if (!authService.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/orders',
        },
      });
    }
  },
  component: OrdersPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    // Vérifier l'authentification et le rôle admin
    if (!authService.isAuthenticated()) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/admin',
        },
      });
    }
    
    if (!authService.isAdmin()) {
      throw redirect({
        to: '/',
      });
    }
  },
  component: AdminPage,
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  productRoute,
  categoryRoute,
  categorySlugRoute,
  categoriesRoute,
  loginRoute,
  signUpRoute,
  accountRoute,
  ordersRoute,
  adminRoute,
]);

export const router = createRouter({ 
  routeTree,
  scrollRestoration: true,
});
