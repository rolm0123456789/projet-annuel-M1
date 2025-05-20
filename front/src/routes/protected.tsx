import { createRoute, redirect } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { rootRoute } from './root'

export const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'protected',
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({
        to: '/auth',
      })
    }
  },
  component: () => (
    <div>
      <h1 className="text-2xl font-bold mb-4">Page Protégée</h1>
      <p>Cette page n'est accessible qu'aux utilisateurs connectés.</p>
    </div>
  ),
}) 