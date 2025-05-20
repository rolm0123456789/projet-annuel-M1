import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './root'
import { ProfilePage } from '@/components/profile/ProfilePage'

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'profile',
  component: () => <ProfilePage />,
}) 