import { useState } from 'react'
import { motion } from 'framer-motion'
import ChallengeModal from './ChallengeModal'

function StationCard({ station, progress, teamCode }) {
  const [showChallenge, setShowChallenge] = useState(false)

  const getStatusStyle = () => {
    if (progress.status === 'completed') return 'card-completed'
    if (progress.status === 'unlocked' || progress.status === 'in_progress') return 'card-unlocked'
    return 'card-locked'
  }

  const getStatusIcon = () => {
    if (progress.status === 'completed') return '✅'
    if (progress.status === 'locked') return '🔒'
    if (progress.status === 'pending_verification') return '⏳'
    return '🏛️'
  }

  const getStatusText = () => {
    if (progress.status === 'completed') return 'Completed'
    if (progress.status === 'pending_verification') return 'Awaiting Verification'
    if (progress.status === 'in_progress') return 'In Progress'
    if (progress.status === 'unlocked') return 'Ready to Start'
    return 'Locked'
  }

  const getChallengeTypeIcon = (type) => {
    switch (type) {
      case 'riddle': return '🧩'
      case 'qr': return '📱'
      case 'photo': return '📸'
      case 'physical': return '💪'
      case 'checkin': return '✓'
      default: return '🏛️'
    }
  }

  const isLocked = progress.status === 'locked'
  const canInteract = !isLocked && progress.status !== 'pending_verification'

  return (
    <>
      <motion.div
        className={`card ${getStatusStyle()} ${canInteract ? 'cursor-pointer' : 'cursor-default'}`}
        whileHover={canInteract ? { scale: 1.01, y: -2 } : {}}
        onClick={() => canInteract && setShowChallenge(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{getStatusIcon()}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-gold/70 text-sm">Station {station.stationNumber}</span>
                <span className="text-lg">{getChallengeTypeIcon(station.challengeType)}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-cinzel text-gold">
                {station.title}
              </h3>
            </div>
          </div>

          {progress.pointsEarned > 0 && (
            <div className="bg-gold text-blue-dark px-3 py-1 rounded-full font-bold text-sm md:text-base">
              +{progress.pointsEarned}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-papyrus/80 mb-4 text-sm md:text-base">
          {station.description}
        </p>

        {/* Location & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          {!isLocked && station.location && (
            <div className="text-gold/70 flex items-center gap-1">
              <span>📍</span>
              <span>{station.location}</span>
            </div>
          )}

          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${progress.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              progress.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400' :
              progress.status === 'unlocked' || progress.status === 'in_progress' ? 'bg-gold/20 text-gold' :
              'bg-gray-500/20 text-gray-400'}
          `}>
            {getStatusText()}
          </div>
        </div>

        {/* Action buttons */}
        {isLocked && (
          <div className="text-center text-papyrus/50 mt-4 pt-4 border-t border-gold/20">
            🔒 Complete previous stations to unlock
          </div>
        )}

        {progress.status === 'pending_verification' && (
          <div className="text-center text-yellow-400 mt-4 pt-4 border-t border-gold/20 flex items-center justify-center gap-2">
            <div className="loader" style={{ width: '20px', height: '20px' }}></div>
            <span>Awaiting admin verification...</span>
          </div>
        )}

        {canInteract && progress.status !== 'completed' && (
          <button className="btn btn-gold w-full mt-4">
            {progress.status === 'in_progress' ? '↻ Continue Challenge' : '▶ Start Challenge'}
          </button>
        )}

        {progress.status === 'completed' && progress.completedAt && (
          <div className="text-center text-green-400 mt-4 pt-4 border-t border-gold/20 text-xs">
            Completed: {new Date(progress.completedAt).toLocaleString()}
          </div>
        )}

        {/* Challenge type badge */}
        <div className="absolute top-4 right-4 bg-blue-dark/80 px-2 py-1 rounded text-xs text-gold/70 capitalize">
          {station.challengeType}
        </div>
      </motion.div>

      {showChallenge && (
        <ChallengeModal
          station={station}
          progress={progress}
          teamCode={teamCode}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  )
}

export default StationCard
