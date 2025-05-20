import { createRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/auth/LoginForm'
import { rootRoute } from './root'

export const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'auth',
  component: () => (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  ),
}) 