import { createRoute, redirect } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/LoginForm'
import { rootRoute } from './root'
import { supabase } from '@/lib/supabase'

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      throw redirect({
        to: '/app/profile',
      })
    }
  },
  component: () => (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  ),
}) 