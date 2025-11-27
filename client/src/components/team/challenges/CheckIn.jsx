import { useState } from 'react'
import { progressAPI } from '../../../services/api'

function CheckIn({ station, teamCode, onSuccess, onError }) {
  const [checking, setChecking] = useState(false)

  const handleCheckIn = async () => {
    setChecking(true)
    try {
      const response = await progressAPI.checkIn(station.id, teamCode)
      onSuccess(response.data.message, response.data.pointsEarned)
    } catch (error) {
      onError(error.message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6 text-center">
      {/* Welcome message */}
      <div className="text-6xl mb-4 animate-float">
        🏛️
      </div>

      <div className="card egyptian-border">
        <p className="text-papyrus text-lg">
          {station.challengeData.message || 'You have reached this sacred location!'}
        </p>
      </div>

      {/* Check-in button */}
      <button
        onClick={handleCheckIn}
        className="btn btn-gold w-full text-lg py-4"
        disabled={checking}
      >
        {checking ? (
          <span className="flex items-center justify-center gap-2">
            <div className="loader" style={{ width: '24px', height: '24px' }}></div>
            Checking in...
          </span>
        ) : (
          <>✓ Check In (+{station.points} points)</>
        )}
      </button>

      {/* Info */}
      <div className="text-papyrus/70 text-sm">
        <p>Simply check in to complete this station and unlock the next one!</p>
      </div>
    </div>
  )
}

export default CheckIn
