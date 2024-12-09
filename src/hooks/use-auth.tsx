import { useContext } from 'react'
import { AuthContext } from './auth-context'

// Create a context for the authentication state

export const useAuth = () => useContext(AuthContext)

// AuthProvider component to wrap your app with
