import { createRoute } from '@tanstack/react-router'
import { protectedRoute } from './protected'
import { ProfilePage } from '@/components/profile/ProfilePage'

export const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: 'profile',
  component: () => <ProfilePage />,
}) 