import { Card } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6 hover:border-gold/50 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-papyrus/70 text-sm font-lato mb-2">{title}</p>
          <h3 className="text-3xl font-cinzel text-gold mb-1">{value}</h3>
          {description && (
            <p className="text-papyrus/50 text-xs font-lato">{description}</p>
          )}
          {trend && (
            <p
              className={`text-xs font-lato mt-2 ${
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center">
          <Icon className="h-6 w-6 text-gold" />
        </div>
      </div>
    </Card>
  )
}

export default StatCard
