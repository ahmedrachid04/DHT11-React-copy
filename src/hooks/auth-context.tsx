import { UserInfo } from '@/lib/types/login-response'
import { createContext, Dispatch, SetStateAction } from 'react'

export const AuthContext = createContext<{
  isAuthenticated: boolean
  user: UserInfo | null
  isLoading: boolean
  setIsAuthenticated: Dispatch<SetStateAction<boolean>> | null
  setUser: Dispatch<SetStateAction<UserInfo | null>> | null
  logout: () => void
}>({
  isAuthenticated: false,
  user: null,
  setIsAuthenticated: null,
  isLoading: true,
  setUser: null,
  logout: () => {},
})
