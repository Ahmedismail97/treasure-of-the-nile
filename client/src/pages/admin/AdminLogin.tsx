import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '@/context/AdminContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

function AdminLogin() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAdmin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password')
      return
    }

    setIsLoading(true)
    const result = await login(username.trim(), password)
    setIsLoading(false)

    if (result.success) {
      toast.success('Welcome to Admin Panel')
      navigate('/admin/dashboard')
    } else {
      toast.error(result.error || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-dark to-blue-deep flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-blue-deep/90 border-2 border-gold/30 egyptian-border">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gold/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-gold" />
              </div>
            </div>
            <h1 className="text-3xl font-cinzel text-gold mb-2">
              Admin Portal
            </h1>
            <p className="text-papyrus/70 font-lato">
              Treasure of the Nile Volume II
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-papyrus font-lato">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-papyrus font-lato">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold to-gold-dark text-blue-dark hover:shadow-glow font-cinzel text-lg py-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Admin Panel'
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-papyrus/50 text-sm mt-6 font-lato">
            Authorized personnel only
          </p>
        </div>
      </Card>
    </div>
  )
}

export default AdminLogin
