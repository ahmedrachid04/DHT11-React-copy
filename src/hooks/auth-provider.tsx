import Cookies from 'js-cookie'
import { ReactNode, useEffect, useState } from 'react'
import { UserInfo } from '@/lib/types/login-response'
import { useQuery } from '@tanstack/react-query'
import { djangoRequest } from '@/lib/django-service'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo | null>(null)
  //make a query to the api to check if the user is authenticated
  const { data, isLoading } = useQuery({
    queryKey: ['get-user'],
    queryFn: async () => {
      const { data } = await djangoRequest<UserInfo>({
        endpoint: '/auth/current-user/current_user/',
        method: 'GET',
      })
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (data) {
      setUser(data)
      setIsAuthenticated(true)
    }
  }, [data])

  const logout = () => {
    //delete the cookie
    Cookies.remove('auth')
    Cookies.remove('refresh')
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        setIsAuthenticated,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
