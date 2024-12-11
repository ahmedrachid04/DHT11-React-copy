import { useAuth } from '@/hooks/use-auth'
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from './custom/button'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='absolute flex h-screen w-screen flex-col items-center justify-center'>
        <Button variant={'ghost'} size={'lg'} loading />
        {/* Loading text in french */}
        <p>Chargement</p>
      </div>
    )
  }
  return isAuthenticated === true ? (
    children
  ) : (
    <Navigate to='/auth/sign-in' replace />
  )
}

export function RequireNoAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='absolute flex h-screen w-screen flex-col items-center justify-center'>
        <Button variant={'ghost'} size={'lg'} loading />
        {/* Loading text in french */}
        <p>Chargement</p>
      </div>
    )
  }

  return isAuthenticated === false ? children : <Navigate to='/' replace />
}
