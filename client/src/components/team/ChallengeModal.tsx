import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { useTeam } from '@/context/TeamContext'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RiddleChallenge from './challenges/RiddleChallenge'
import QRScanner from './challenges/QRScanner'
import PhotoUpload from './challenges/PhotoUpload'
import PhysicalTask from './challenges/PhysicalTask'
import CheckIn from './challenges/CheckIn'
import type { Station, Progress } from '@/types'

interface ChallengeModalProps {
  station: Station
  progress: Progress
  teamCode: string
  onClose: () => void
}

interface StationData {
  station: Station
  progress: Progress
}

function ChallengeModal({ station, progress, teamCode, onClose }: ChallengeModalProps) {
  const [stationData, setStationData] = useState<StationData | null>(null)
  const [loading, setLoading] = useState(true)
  const { refreshProgress } = useTeam()

  useEffect(() => {
    loadStationData()
  }, [station.id])

  const loadStationData = async () => {
    try {
      const response = await progressAPI.getStation(station.id, teamCode)
      setStationData(response.data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load station data')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = (message: string, points?: number) => {
    toast.success(message)
    refreshProgress()
    setTimeout(onClose, 2000)
  }

  const handleError = (message: string) => {
    toast.error(message)
  }

  const renderChallenge = () => {
    if (!stationData) return null

    const props = {
      station: stationData.station,
      progress: stationData.progress,
      teamCode,
      onSuccess: handleSuccess,
      onError: handleError,
    }

    switch (station.challengeType) {
      case 'riddle':
        return <RiddleChallenge {...props} />
      case 'qr':
        return <QRScanner {...props} />
      case 'photo':
        return <PhotoUpload {...props} />
      case 'physical':
        return <PhysicalTask {...props} />
      case 'checkin':
        return <CheckIn {...props} />
      default:
        return <div className="text-center text-papyrus/70">Unknown challenge type</div>
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          className="bg-blue-deep rounded-lg border-2 border-gold shadow-glow-intense max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-blue-deep border-b-2 border-gold/30 p-6 z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-gold/70 text-sm mb-1">
                  Station {station.stationNumber}
                </div>
                <h2 className="text-2xl md:text-3xl font-cinzel text-gold mb-2">
                  {station.title}
                </h2>
                <p className="text-papyrus/70 text-sm">{station.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-papyrus/50 hover:text-papyrus transition-colors ml-4 p-1 rounded hover:bg-gold/10"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 text-gold animate-spin mx-auto mb-4" />
                <p className="text-papyrus/70">Loading challenge...</p>
              </div>
            ) : (
              renderChallenge()
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default ChallengeModal
