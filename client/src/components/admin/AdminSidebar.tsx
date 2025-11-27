import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  MapPin,
  CheckCircle,
  Settings,
  BarChart3
} from 'lucide-react'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/teams', label: 'Teams', icon: Users },
  { path: '/admin/stations', label: 'Stations', icon: MapPin },
  { path: '/admin/verifications', label: 'Verifications', icon: CheckCircle },
  { path: '/admin/event', label: 'Event Control', icon: Settings },
  { path: '/admin/statistics', label: 'Statistics', icon: BarChart3 },
]

function AdminSidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-blue-dark border-r-2 border-gold/30 flex flex-col">
      {/* Logo/Title */}
      <div className="p-6 border-b border-gold/20">
        <h2 className="text-xl font-cinzel text-gold">Admin Panel</h2>
        <p className="text-papyrus/60 text-sm mt-1 font-lato">Treasure Hunt</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-lato',
                isActive
                  ? 'bg-gold/20 border-l-4 border-gold text-gold'
                  : 'text-papyrus/70 hover:bg-gold/10 hover:text-gold border-l-4 border-transparent'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gold/20">
        <p className="text-papyrus/50 text-xs text-center font-lato">
          Treasure of the Nile V2
        </p>
      </div>
    </aside>
  )
}

export default AdminSidebar
