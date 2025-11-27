import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { adminAPI } from '@/services/api'
import type { Admin, AdminContextValue } from '@/types/admin'

const AdminContext = createContext<AdminContextValue | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

interface AdminProviderProps {
  children: ReactNode
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored admin token and data
    const storedToken = localStorage.getItem('adminToken')
    const storedAdmin = localStorage.getItem('admin')

    if (storedToken && storedAdmin) {
      try {
        const adminData: Admin = JSON.parse(storedAdmin)
        setAdmin(adminData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to restore admin session:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('admin')
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await adminAPI.login(username, password)
      const { token, admin: adminData } = response.data

      setAdmin(adminData)
      setIsAuthenticated(true)
      localStorage.setItem('adminToken', token)
      localStorage.setItem('admin', JSON.stringify(adminData))

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setAdmin(null)
    setIsAuthenticated(false)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
  }

  const refreshAuth = () => {
    const storedToken = localStorage.getItem('adminToken')
    const storedAdmin = localStorage.getItem('admin')

    if (storedToken && storedAdmin) {
      try {
        const adminData: Admin = JSON.parse(storedAdmin)
        setAdmin(adminData)
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Failed to refresh admin session:', error)
        logout()
      }
    }
  }

  const value: AdminContextValue = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
