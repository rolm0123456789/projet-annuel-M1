import { createRoute, redirect, Outlet } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { rootRoute } from './root'

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'app',
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: () => (
    <>
      <Outlet />
    </>
  ),
}) 