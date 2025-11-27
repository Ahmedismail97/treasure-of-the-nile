import { useState } from 'react'
import { CheckCircle, Loader2, Landmark } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Station } from '@/types'

interface CheckInProps {
  station: Station
  teamCode: string
  onSuccess: (message: string, points?: number, nextStation?: { id: number; stationNumber: number; title: string }) => void
  onError: (message: string) => void
}

function CheckIn({ station, teamCode, onSuccess, onError }: CheckInProps) {
  const [checking, setChecking] = useState(false)

  const handleCheckIn = async () => {
    setChecking(true)
    try {
      const response = await progressAPI.checkIn(station.id, teamCode)
      onSuccess(response.data.message, response.data.pointsEarned, response.data.nextStation)
    } catch (error: any) {
      onError(error.message || 'Failed to check in')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6 text-center">
      {/* Welcome message */}
      <div className="mb-3 md:mb-4 animate-float flex justify-center">
        <Landmark className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-gold" />
      </div>

      <Card className="card-unlocked egyptian-border">
        <p className="text-papyrus text-sm md:text-base lg:text-lg">
          {station.challengeData?.message || 'You have reached this sacred location!'}
        </p>
      </Card>

      {/* Check-in button */}
      <Button
        onClick={handleCheckIn}
        className="w-full text-base md:text-lg py-4 md:py-6 min-h-[44px] md:min-h-[56px]"
        disabled={checking}
      >
        {checking ? (
          <>
            <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
            <span>Checking in...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
            <span>Check In (+{station.points} points)</span>
          </>
        )}
      </Button>

      {/* Info */}
      <div className="text-papyrus/70 text-xs md:text-sm">
        <p>Simply check in to complete this station and unlock the next one!</p>
      </div>
    </div>
  )
}

export default CheckIn
