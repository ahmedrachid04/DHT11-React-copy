import React from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { LanguageProvider } from '@/components/language-provider.tsx'

import '@/index.css'
import AppShell from './components/app-shell'
import Dashboard from './pages/dashboard'
import Tasks from './pages/tasks'
import SignIn2 from './pages/auth/sign-in-2'
import { RequireAuth, RequireNoAuth } from './components/require-auth'
import { AuthProvider } from './hooks/auth-provider'
import Chats from './pages/chats/index.tsx'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider storageKey='vite-ui-theme'>
        <LanguageProvider defaultLanguage='fr' storageKey='vite-ui-language'>
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path='/auth/sign-in'
                  element={
                    <RequireNoAuth>
                      <SignIn2 />
                    </RequireNoAuth>
                  }
                />
                <Route
                  path='/'
                  element={
                    <RequireAuth>
                      <AppShell />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path='tasks' element={<Tasks />} />
                  <Route path='incident/:id' element={<Chats />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
