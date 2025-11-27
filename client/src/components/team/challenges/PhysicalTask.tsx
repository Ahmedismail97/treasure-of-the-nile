import { useState } from 'react'
import { Dumbbell, CheckCircle, Loader2, Clock } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { Station } from '@/types'

interface PhysicalTaskProps {
  station: Station
  teamCode: string
  onSuccess: (message: string, points?: number) => void
  onError: (message: string) => void
}

function PhysicalTask({ station, teamCode, onSuccess, onError }: PhysicalTaskProps) {
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await progressAPI.submitPhysicalTask(station.id, teamCode, notes)
      onSuccess(response.data.message, 0) // Points awarded after admin verification
    } catch (error: any) {
      onError(error.message || 'Failed to submit task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Task description */}
      <Card className="card-unlocked egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold flex items-center gap-1">
          <Dumbbell className="h-4 w-4" />
          <span>Physical Challenge:</span>
        </div>
        <p className="text-papyrus text-lg">{station.challengeData?.taskDescription}</p>
      </Card>

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
        <Label htmlFor="notes" className="text-gold font-semibold">
          Notes (Optional)
        </Label>
        <textarea
          id="notes"
          className="input mt-2 min-h-[100px] resize-none w-full"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes or comments about your completion..."
          disabled={submitting}
        />
      </div>

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            <span>Mark as Complete</span>
          </>
        )}
      </Button>

      {/* Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Make sure an admin is present at this station to verify your completion.</span>
        </p>
      </div>
    </div>
  )
}

export default PhysicalTask
