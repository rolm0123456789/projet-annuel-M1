import { createRouter, RouterProvider } from '@tanstack/react-router'
import { rootRoute } from './routes/root'
import { authRoute } from './routes/auth'
import { protectedRoute } from './routes/protected'
import { profileRoute } from './routes/profile'

const routeTree = rootRoute.addChildren([
  authRoute,
  protectedRoute.addChildren([
    profileRoute
  ]),
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function Router() {
  return <RouterProvider router={router} />
} 