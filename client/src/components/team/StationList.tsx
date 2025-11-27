import { Loader2, CheckCircle } from 'lucide-react'
import StationCard from './StationCard'
import type { Station } from '@/types'

interface StationListProps {
  stations: Station[]
  teamCode: string
}

function StationList({ stations, teamCode }: StationListProps) {
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-16 w-16 text-gold animate-spin mx-auto mb-4" />
        <p className="text-papyrus/70">Loading stations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-cinzel text-gold mb-4 md:mb-6 text-center">
        The Path to the Treasure
      </h2>

      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            progress={station.progress!}
            teamCode={teamCode}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-4 md:mt-6 lg:mt-8 text-center">
        <div className="inline-flex items-center gap-1 md:gap-2 text-papyrus/70 flex-wrap justify-center">
          {stations.map((station, index) => (
            <div
              key={station.id}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                station.progress?.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : station.progress?.status === 'unlocked' || station.progress?.status === 'in_progress'
                  ? 'bg-gold text-blue-dark animate-pulse-glow'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              {station.progress?.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StationList
