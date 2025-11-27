import { useAdmin } from '@/context/AdminContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Bell, Menu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AdminHeaderProps {
  onMenuClick?: () => void
}

function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { admin, logout } = useAdmin()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('dashboard')) return 'Dashboard'
    if (path.includes('teams')) return 'Team Management'
    if (path.includes('stations')) return 'Station Management'
    if (path.includes('verifications')) return 'Verification Queue'
    if (path.includes('event')) return 'Event Control'
    if (path.includes('statistics')) return 'Statistics'
    return 'Admin Panel'
  }

  return (
    <header className="bg-blue-deep border-b-2 border-gold/30 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Menu button (mobile) + Page Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden text-gold hover:bg-gold/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-2xl font-cinzel text-gold">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right: Notification Bell + Admin Info + Logout */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-gold hover:bg-gold/10"
          >
            <Bell className="h-5 w-5" />
            {/* Badge for pending notifications */}
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white p-0 flex items-center justify-center text-xs">
              0
            </Badge>
          </Button>

          {/* Admin Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gold/30">
              <AvatarFallback className="bg-gold/20 text-gold font-cinzel">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-papyrus font-lato text-sm font-medium">
                {admin?.username}
              </p>
              <p className="text-papyrus/60 text-xs font-lato capitalize">
                {admin?.role}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
