// src/routes.tsx
import { createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { RootLayout } from '@/layouts/RootLayout';
import Home from '@/pages/Home';
import ProductPage from '@/pages/ProductPage';
import CategoryPage from '@/pages/CategoryPage';
import CategoriesPage from '@/pages/CategoriesPage';
import AccountPage from '@/pages/AccountPage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';

const rootRoute = createRootRoute({
  component: RootLayout,
});

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

const categoryRoute = createRoute({  getParentRoute: () => rootRoute,  path: '/categorie/$name',  component: CategoryPage,});const categorySlugRoute = createRoute({  getParentRoute: () => rootRoute,  path: '/categories/$slug',  component: CategoryPage,});

const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoriesPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUpPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: AccountPage,
});

export const routeTree = rootRoute.addChildren([  homeRoute,  productRoute,  categoryRoute,  categorySlugRoute,  categoriesRoute,  loginRoute,  signUpRoute,  accountRoute,]);

export const router = createRouter({ 
  routeTree,
  scrollRestoration: true,
});
