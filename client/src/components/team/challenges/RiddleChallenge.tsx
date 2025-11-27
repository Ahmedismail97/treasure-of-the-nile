import { useState } from 'react'
import { Lightbulb, CheckCircle, Loader2, Trophy } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import type { Station, Progress } from '@/types'

interface RiddleChallengeProps {
  station: Station
  progress: Progress
  teamCode: string
  onSuccess: (message: string, points?: number) => void
  onError: (message: string) => void
}

function RiddleChallenge({ station, progress, teamCode, onSuccess, onError }: RiddleChallengeProps) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestingHint, setRequestingHint] = useState(false)
  const [hints, setHints] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim()) return

    setSubmitting(true)
    try {
      const response = await progressAPI.submitRiddle(station.id, teamCode, answer)

      if (response.data.correct) {
        onSuccess(response.data.message, response.data.pointsEarned)
      } else {
        onError(response.data.message)
        setAnswer('')
      }
    } catch (error: any) {
      onError(error.message || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  const requestHint = async () => {
    setRequestingHint(true)
    try {
      const response = await progressAPI.requestHint(station.id, teamCode)
      setHints([...hints, response.data.hint])
      onError(`Hint revealed! -${response.data.pointsDeducted} points`)
    } catch (error: any) {
      onError(error.message || 'Failed to request hint')
    } finally {
      setRequestingHint(false)
    }
  }

  const totalHints = station.challengeData?.hints?.length || 0
  const usedHints = progress.hintsUsed || 0
  const availableHints = totalHints - usedHints

  return (
    <div className="space-y-6">
      {/* Question */}
      <Card className="card-unlocked egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold">The Sphinx asks:</div>
        <p className="text-papyrus text-lg">{station.challengeData?.question}</p>
      </Card>

      {/* Attempts counter */}
      {progress.attemptsCount > 0 && (
        <div className="text-center text-papyrus/70 text-sm">
          Attempts: {progress.attemptsCount}
        </div>
      )}

      {/* Hints */}
      {hints.length > 0 && (
        <div className="space-y-2">
          {hints.map((hint, index) => (
            <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="text-yellow-400 text-xs mb-1 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                <span>Hint {index + 1}</span>
              </div>
              <p className="text-papyrus/90">{hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Answer form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="answer" className="text-gold font-semibold">
            Your Answer
          </Label>
          <Input
            id="answer"
            type="text"
            className="input mt-2"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            disabled={submitting}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={submitting || !answer.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Submit Answer</span>
              </>
            )}
          </Button>

          {availableHints > 0 && (
            <Button
              type="button"
              onClick={requestHint}
              variant="outline"
              disabled={requestingHint}
            >
              {requestingHint ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Lightbulb className="h-4 w-4" />
                  <span>Hint ({availableHints})</span>
                </>
              )}
            </Button>
          )}
        </div>

        <p className="text-papyrus/50 text-xs text-center flex items-center justify-center gap-1">
          <Trophy className="h-3 w-3" />
          <span>Base points: {station.points} • Penalty: -5 per attempt, -10 per hint</span>
        </p>
      </form>
    </div>
  )
}

export default RiddleChallenge
