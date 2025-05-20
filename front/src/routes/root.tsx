import { createRootRoute, Outlet } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <Outlet />
      </div>
    </div>
  ),
}) 