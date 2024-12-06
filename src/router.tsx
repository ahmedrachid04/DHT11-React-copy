import { createBrowserRouter } from 'react-router-dom'
import NotFoundError from './pages/errors/not-found-error.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const AppShell = await import('./components/app-shell')
      return { Component: AppShell.default }
    },
    //todo uncomment this
    // errorElement: <GeneralError />,
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import('./pages/dashboard')).default,
        }),
      },
      {
        path: 'tasks',
        lazy: async () => ({
          Component: (await import('@/pages/tasks')).default,
        }),
      },
    ],
  },

  { path: '*', Component: NotFoundError },
])

export default router
