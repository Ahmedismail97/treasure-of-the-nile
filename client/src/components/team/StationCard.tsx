import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Unlock, CheckCircle, Clock, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ChallengeModal from './ChallengeModal'
import type { Station, Progress } from '@/types'

interface StationCardProps {
  station: Station
  progress: Progress
  teamCode: string
}

function StationCard({ station, progress, teamCode }: StationCardProps) {
  const [showChallenge, setShowChallenge] = useState(false)

  const getStatusStyle = () => {
    if (progress.status === 'completed') return 'card-completed'
    if (progress.status === 'unlocked' || progress.status === 'in_progress') return 'card-unlocked'
    return 'card-locked'
  }

  const getStatusIcon = () => {
    if (progress.status === 'completed') return <CheckCircle className="text-green-400" />
    if (progress.status === 'locked') return <Lock className="text-gray-400" />
    if (progress.status === 'pending_verification') return <Clock className="text-yellow-400" />
    return <Unlock className="text-gold" />
  }

  const getStatusText = () => {
    if (progress.status === 'completed') return 'Completed'
    if (progress.status === 'pending_verification') return 'Awaiting Verification'
    if (progress.status === 'in_progress') return 'In Progress'
    if (progress.status === 'unlocked') return 'Ready to Start'
    return 'Locked'
  }

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'riddle': return '🧩'
      case 'qr': return '📱'
      case 'photo': return '📸'
      case 'physical': return '💪'
      case 'checkin': return '✓'
      default: return '🏛️'
    }
  }

  const getStatusBadgeVariant = () => {
    if (progress.status === 'completed') return 'default'
    if (progress.status === 'pending_verification') return 'secondary'
    return 'outline'
  }

  const isLocked = progress.status === 'locked'
  const canInteract = !isLocked && progress.status !== 'pending_verification'

  return (
    <>
      <motion.div
        className={`relative`}
        whileHover={canInteract ? { scale: 1.01, y: -2 } : {}}
        onClick={() => canInteract && setShowChallenge(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`${getStatusStyle()} ${canInteract ? 'cursor-pointer' : 'cursor-default'} egyptian-border overflow-hidden`}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl flex items-center">{getStatusIcon()}</span>
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
              <Badge className="bg-gold text-blue-dark font-bold">
                +{progress.pointsEarned}
              </Badge>
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
                <MapPin className="h-4 w-4" />
                <span>{station.location}</span>
              </div>
            )}

            <Badge
              variant={getStatusBadgeVariant()}
              className={`
                ${progress.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  progress.status === 'pending_verification' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                  progress.status === 'unlocked' || progress.status === 'in_progress' ? 'bg-gold/20 text-gold border-gold/30' :
                  'bg-gray-500/20 text-gray-400 border-gray-500/30'}
              `}
            >
              {getStatusText()}
            </Badge>
          </div>

          {/* Action buttons */}
          {isLocked && (
            <div className="text-center text-papyrus/50 mt-4 pt-4 border-t border-gold/20 flex items-center justify-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Complete previous stations to unlock</span>
            </div>
          )}

          {progress.status === 'pending_verification' && (
            <div className="text-center text-yellow-400 mt-4 pt-4 border-t border-gold/20 flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 animate-pulse" />
              <span>Awaiting admin verification...</span>
            </div>
          )}

          {canInteract && progress.status !== 'completed' && (
            <Button className="w-full mt-4">
              {progress.status === 'in_progress' ? '↻ Continue Challenge' : '▶ Start Challenge'}
            </Button>
          )}

          {progress.status === 'completed' && progress.completedAt && (
            <div className="text-center text-green-400 mt-4 pt-4 border-t border-gold/20 text-xs flex items-center justify-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>Completed: {new Date(progress.completedAt).toLocaleString()}</span>
            </div>
          )}

          {/* Challenge type badge */}
          <Badge
            variant="outline"
            className="absolute top-4 right-4 bg-blue-dark/80 border-gold/30 text-gold/70 capitalize"
          >
            {station.challengeType}
          </Badge>
        </Card>
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
