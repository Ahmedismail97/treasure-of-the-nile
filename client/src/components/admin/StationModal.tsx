import { useState, useEffect } from 'react'
import { Station } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface StationModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (stationData: Partial<Station>) => Promise<void>
  station: Station | null
}

function StationModal({ isOpen, onClose, onSave, station }: StationModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    stationNumber: '',
    title: '',
    description: '',
    location: '',
    challengeType: 'riddle' as 'riddle' | 'photo' | 'physical' | 'checkin' | 'qr',
    challengeData: {
      question: '',
      answer: '',
      hint1: '',
      hint2: '',
      hint3: '',
      choices: ['', '', '', ''],
      correctChoiceIndex: 0,
      riddle: '',
      taskDescription: '',
      photoPrompt: '',
    },
    pointsAvailable: '',
  })

  useEffect(() => {
    if (station) {
      const challengeData = station.challengeData || {}
      setFormData({
        stationNumber: (station.stationNumber ?? '').toString(),
        title: station.title || '',
        description: station.description || '',
        location: station.location || '',
        challengeType: (station.challengeType || 'riddle') as 'riddle' | 'photo' | 'physical' | 'checkin' | 'qr',
        challengeData: {
          question: challengeData.question || '',
          answer: challengeData.answer || '',
          hint1: Array.isArray(challengeData.hints) ? challengeData.hints[0] || '' : '',
          hint2: Array.isArray(challengeData.hints) ? challengeData.hints[1] || '' : '',
          hint3: Array.isArray(challengeData.hints) ? challengeData.hints[2] || '' : '',
          choices: ['', '', '', ''],
          correctChoiceIndex: 0,
          riddle: challengeData.question || challengeData.riddle || '',
          taskDescription: challengeData.taskDescription || '',
          photoPrompt: challengeData.prompt || challengeData.photoPrompt || '',
          message: challengeData.message || '',
        },
        pointsAvailable: (station.points || station.pointsAvailable || '').toString(),
      })
    } else {
      setFormData({
        stationNumber: '',
        title: '',
        description: '',
        location: '',
        challengeType: 'riddle',
        challengeData: {
          question: '',
          answer: '',
          hint1: '',
          hint2: '',
          hint3: '',
          choices: ['', '', '', ''],
          correctChoiceIndex: 0,
          riddle: '',
          taskDescription: '',
          photoPrompt: '',
        },
        pointsAvailable: '',
        orderIndex: '',
      })
    }
  }, [station, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const pointsValue = parseInt(formData.pointsAvailable)
    const stationNumberValue = parseInt(formData.stationNumber)

    if (isNaN(pointsValue) || pointsValue <= 0) {
      alert('Please enter valid points')
      return
    }

    if (isNaN(stationNumberValue) || stationNumberValue <= 0) {
      alert('Please enter a valid station number')
      return
    }

    setLoading(true)
    try {
      // Prepare challengeData based on challenge type
      let challengeData: any = {}
      
      if (formData.challengeType === 'riddle') {
        challengeData = {
          question: formData.challengeData.riddle || formData.challengeData.question || '',
          answer: formData.challengeData.answer || '',
          hints: [
            formData.challengeData.hint1,
            formData.challengeData.hint2,
            formData.challengeData.hint3,
          ].filter(h => h && h.trim()),
        }
      } else if (formData.challengeType === 'photo') {
        challengeData = {
          prompt: formData.challengeData.photoPrompt || '',
        }
      } else if (formData.challengeType === 'physical') {
        challengeData = {
          taskDescription: formData.challengeData.taskDescription || '',
        }
      } else if (formData.challengeType === 'checkin') {
        challengeData = {
          message: formData.description || 'You have reached this station!',
        }
      } else if (formData.challengeType === 'qr') {
        challengeData = {
          message: formData.description || 'Scan the QR code at this station.',
        }
      } else if (formData.challengeType === 'trivia') {
        // Convert trivia to riddle format or handle separately
        challengeData = {
          question: formData.challengeData.question || '',
          answer: formData.challengeData.choices?.[formData.challengeData.correctChoiceIndex] || '',
          hints: [
            formData.challengeData.hint1,
            formData.challengeData.hint2,
            formData.challengeData.hint3,
          ].filter(h => h && h.trim()),
        }
        // Note: Trivia is not a valid challengeType, so we'll convert it to riddle
        formData.challengeType = 'riddle'
      }

      await onSave({
        stationNumber: stationNumberValue,
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim() || null,
        challengeType: formData.challengeType,
        challengeData: challengeData,
        points: pointsValue,
      })
      onClose()
    } catch (error: any) {
      alert(error.message || 'Failed to save station')
    } finally {
      setLoading(false)
    }
  }

  const updateChallengeData = (key: string, value: any) => {
    setFormData({
      ...formData,
      challengeData: {
        ...formData.challengeData,
        [key]: value,
      },
    })
  }

  const updateChoice = (index: number, value: string) => {
    const newChoices = [...formData.challengeData.choices]
    newChoices[index] = value
    updateChallengeData('choices', newChoices)
  }

  const renderChallengeFields = () => {
    switch (formData.challengeType) {
      case 'riddle':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="riddle" className="text-papyrus font-lato">
                Riddle Question *
              </Label>
              <Textarea
                id="riddle"
                value={formData.challengeData.riddle || formData.challengeData.question || ''}
                onChange={(e) => updateChallengeData('riddle', e.target.value)}
                placeholder="Enter the riddle question..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer" className="text-papyrus font-lato">
                Answer *
              </Label>
              <Input
                id="answer"
                value={formData.challengeData.answer || ''}
                onChange={(e) => updateChallengeData('answer', e.target.value)}
                placeholder="Enter the answer..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                required
              />
            </div>
          </div>
        )

      case 'qr':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qrMessage" className="text-papyrus font-lato">
                QR Code Instructions
              </Label>
              <Textarea
                id="qrMessage"
                value={formData.challengeData.message || ''}
                onChange={(e) => updateChallengeData('message', e.target.value)}
                placeholder="Instructions for scanning the QR code..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={3}
              />
            </div>
          </div>
        )

      case 'checkin':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checkinMessage" className="text-papyrus font-lato">
                Check-in Message
              </Label>
              <Textarea
                id="checkinMessage"
                value={formData.challengeData.message || ''}
                onChange={(e) => updateChallengeData('message', e.target.value)}
                placeholder="Message shown when team checks in..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={3}
              />
            </div>
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photoPrompt" className="text-papyrus font-lato">
                Photo Challenge Prompt *
              </Label>
              <Textarea
                id="photoPrompt"
                value={formData.challengeData.photoPrompt}
                onChange={(e) => updateChallengeData('photoPrompt', e.target.value)}
                placeholder="Describe what photo the team needs to take..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={4}
                required
              />
            </div>
          </div>
        )

      case 'physical':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskDescription" className="text-papyrus font-lato">
                Physical Task Description *
              </Label>
              <Textarea
                id="taskDescription"
                value={formData.challengeData.taskDescription}
                onChange={(e) => updateChallengeData('taskDescription', e.target.value)}
                placeholder="Describe the physical task to complete..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={4}
                required
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-deep border-2 border-gold/30 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-gold">
            {station ? 'Edit Station' : 'Create New Station'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-cinzel text-gold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="stationNumber" className="text-papyrus font-lato">
                Station Number *
              </Label>
              <Input
                id="stationNumber"
                type="number"
                min="1"
                max="10"
                value={formData.stationNumber}
                onChange={(e) => setFormData({ ...formData, stationNumber: e.target.value })}
                placeholder="1"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                required
              />
              <p className="text-papyrus/50 text-xs">Must be between 1-10 and unique</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-papyrus font-lato">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="The Sphinx's Challenge"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-papyrus font-lato">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter station description..."
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-papyrus font-lato">
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Hall, Building A"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challengeType" className="text-papyrus font-lato">
                  Challenge Type *
                </Label>
                <Select
                  value={formData.challengeType}
                  onValueChange={(value: any) => setFormData({ ...formData, challengeType: value })}
                >
                  <SelectTrigger className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-deep border-2 border-gold/30">
                    <SelectItem value="riddle" className="text-papyrus hover:bg-gold/10">
                      Riddle
                    </SelectItem>
                    <SelectItem value="qr" className="text-papyrus hover:bg-gold/10">
                      QR Code
                    </SelectItem>
                    <SelectItem value="photo" className="text-papyrus hover:bg-gold/10">
                      Photo Challenge
                    </SelectItem>
                    <SelectItem value="physical" className="text-papyrus hover:bg-gold/10">
                      Physical Task
                    </SelectItem>
                    <SelectItem value="checkin" className="text-papyrus hover:bg-gold/10">
                      Check-in
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points" className="text-papyrus font-lato">
                  Points Available *
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.pointsAvailable}
                  onChange={(e) => setFormData({ ...formData, pointsAvailable: e.target.value })}
                  placeholder="100"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Challenge Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-cinzel text-gold">Challenge Configuration</h3>
            {renderChallengeFields()}
          </div>

          {/* Hints */}
          <div className="space-y-4">
            <h3 className="text-lg font-cinzel text-gold">Hints (Optional)</h3>
            <div className="space-y-3">
              {[1, 2, 3].map((num) => (
                <div key={num} className="space-y-2">
                  <Label htmlFor={`hint${num}`} className="text-papyrus font-lato">
                    Hint {num}
                  </Label>
                  <Input
                    id={`hint${num}`}
                    value={formData.challengeData[`hint${num}` as keyof typeof formData.challengeData] as string}
                    onChange={(e) => updateChallengeData(`hint${num}`, e.target.value)}
                    placeholder={`Hint ${num}...`}
                    className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gold text-blue-dark hover:bg-gold-dark"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{station ? 'Update Station' : 'Create Station'}</>
              )}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              variant="outline"
              className="border-gold/30 text-papyrus hover:bg-gold/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default StationModal
