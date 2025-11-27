import { useState } from 'react'
import { progressAPI } from '../../../services/api'

function PhysicalTask({ station, teamCode, onSuccess, onError }) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await progressAPI.submitPhysicalTask(station.id, teamCode, notes)
      onSuccess(response.data.message, 0) // Points awarded after admin verification
    } catch (error) {
      onError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Task description */}
      <div className="card egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold">💪 Physical Challenge:</div>
        <p className="text-papyrus text-lg">{station.challengeData.task}</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-dark/50 border border-gold/30 rounded-lg p-4 space-y-2">
        <p className="text-papyrus/90 text-sm font-semibold">How it works:</p>
        <ol className="list-decimal list-inside text-papyrus/70 text-sm space-y-1 ml-2">
          <li>Complete the physical task at this station</li>
          <li>Click "Mark as Complete" below</li>
          <li>An admin at this location will verify your completion</li>
          <li>You'll receive {station.points} points once verified</li>
        </ol>
      </div>

      {/* Optional notes */}
      <div>
        <label className="block text-gold mb-2 font-semibold">
          Notes (Optional)
        </label>
        <textarea
          className="input min-h-[100px] resize-none"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or comments about your completion..."
          disabled={submitting}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        className="btn btn-gold w-full"
        disabled={submitting}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="loader" style={{ width: '20px', height: '20px' }}></div>
            Submitting...
          </span>
        ) : (
          '✓ Mark as Complete'
        )}
      </button>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm">
          ⏳ Make sure an admin is present at this station to verify your completion.
        </p>
      </div>
    </div>
  )
}

export default PhysicalTask
