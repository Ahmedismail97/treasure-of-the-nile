import StationCard from './StationCard'

function StationList({ stations, teamCode }) {
  if (!stations || stations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-papyrus/70">Loading stations...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-cinzel text-gold mb-6 text-center">
        The Path to the Treasure
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {stations.map((station) => (
          <StationCard
            key={station.id}
            station={station}
            progress={station.progress}
            teamCode={teamCode}
          />
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-papyrus/70">
          {stations.map((station, index) => (
            <div
              key={station.id}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                station.progress.status === 'completed'
                  ? 'bg-green-500 text-white'
                  : station.progress.status === 'unlocked' || station.progress.status === 'in_progress'
                  ? 'bg-gold text-blue-dark animate-pulse-glow'
                  : 'bg-gray-600 text-gray-400'
              }`}
            >
              {station.progress.status === 'completed' ? '✓' : index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StationList
