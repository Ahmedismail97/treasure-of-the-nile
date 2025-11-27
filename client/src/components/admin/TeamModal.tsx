import { useState, useEffect } from 'react'
import { Team } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface TeamModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (teamCode: string, teamName: string) => Promise<void>
  team?: Team | null
}

function TeamModal({ isOpen, onClose, onSave, team }: TeamModalProps) {
  const [teamCode, setTeamCode] = useState('')
  const [teamName, setTeamName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (team) {
      setTeamCode(team.teamCode)
      setTeamName(team.teamName)
    } else {
      setTeamCode('')
      setTeamName('')
    }
    setError('')
  }, [team, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!teamCode.trim()) {
      setError('Team code is required')
      return
    }

    if (!teamName.trim()) {
      setError('Team name is required')
      return
    }

    setIsLoading(true)
    try {
      await onSave(teamCode.trim(), teamName.trim())
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save team')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-deep border-2 border-gold/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-gold">
            {team ? 'Edit Team' : 'Create New Team'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Code */}
          <div className="space-y-2">
            <Label htmlFor="teamCode" className="text-papyrus font-lato">
              Team Code
            </Label>
            <Input
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="e.g., SWIFT-PHARAOH-123"
              disabled={isLoading || !!team}
              className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
            />
            {team && (
              <p className="text-xs text-papyrus/50 font-lato">
                Team code cannot be changed
              </p>
            )}
          </div>

          {/* Team Name */}
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-papyrus font-lato">
              Team Name
            </Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Desert Raiders"
              disabled={isLoading}
              className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm font-lato">{error}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gold/30 text-papyrus hover:bg-gold/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gold text-blue-dark hover:bg-gold-dark"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : team ? (
                'Update Team'
              ) : (
                'Create Team'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TeamModal
