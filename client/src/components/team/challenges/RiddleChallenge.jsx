import { useState } from 'react'
import { progressAPI } from '../../../services/api'

function RiddleChallenge({ station, progress, teamCode, onSuccess, onError }) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestingHint, setRequestingHint] = useState(false)
  const [hints, setHints] = useState([])

  const handleSubmit = async (e) => {
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
    } catch (error) {
      onError(error.message)
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
    } catch (error) {
      onError(error.message)
    } finally {
      setRequestingHint(false)
    }
  }

  const totalHints = station.challengeData.hints?.length || 0
  const usedHints = progress.hintsUsed || 0
  const availableHints = totalHints - usedHints

  return (
    <div className="space-y-6">
      {/* Question */}
      <div className="card egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold">The Sphinx asks:</div>
        <p className="text-papyrus text-lg">{station.challengeData.question}</p>
      </div>

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
              <div className="text-yellow-400 text-xs mb-1">💡 Hint {index + 1}</div>
              <p className="text-papyrus/90">{hint}</p>
            </div>
          ))}
        </div>
      )}

      {/* Answer form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gold mb-2 font-semibold">Your Answer</label>
          <input
            type="text"
            className="input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            disabled={submitting}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-gold flex-1"
            disabled={submitting || !answer.trim()}
          >
            {submitting ? 'Submitting...' : '✓ Submit Answer'}
          </button>

          {availableHints > 0 && (
            <button
              type="button"
              onClick={requestHint}
              className="btn btn-blue"
              disabled={requestingHint}
            >
              {requestingHint ? '...' : `💡 Hint (${availableHints})`}
            </button>
          )}
        </div>

        <p className="text-papyrus/50 text-xs text-center">
          💰 Base points: {station.points} • Penalty: -5 per attempt, -10 per hint
        </p>
      </form>
    </div>
  )
}

export default RiddleChallenge
