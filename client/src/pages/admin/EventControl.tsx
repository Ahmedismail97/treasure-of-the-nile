import { useState, useEffect } from 'react'
import { adminAPI } from '@/services/api'
import { EventSettings } from '@/types/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  Play,
  Square,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trophy,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'

function EventControl() {
  const [settings, setSettings] = useState<EventSettings>({
    id: 1,
    eventName: '',
    eventStart: null,
    eventEnd: null,
    isEventActive: false,
    maxTeams: 0,
    allowLateRegistration: true,
    pointsPerStation: 100,
    hintPenalty: 10,
    attemptPenalty: 5,
    minPointsPercentage: 30,
    settings: {},
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Danger Zone Dialogs
  const [showStartDialog, setShowStartDialog] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getEventSettings()
      // Server returns { settings: {...} }
      const settingsData = response.data.settings || response.data
      setSettings(settingsData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load event settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await adminAPI.updateEventSettings(settings)
      toast.success('Event settings saved successfully')
      loadSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleStartEvent = async () => {
    try {
      await adminAPI.startEvent()
      toast.success('Event started successfully!')
      setShowStartDialog(false)
      loadSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to start event')
    }
  }

  const handleEndEvent = async () => {
    try {
      await adminAPI.endEvent()
      toast.success('Event ended successfully')
      setShowEndDialog(false)
      loadSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to end event')
    }
  }

  const handleResetEvent = async () => {
    try {
      // TODO: Implement reset event endpoint on server
      // For now, this is a placeholder - reset would need to clear all progress
      toast.error('Reset event functionality is not yet implemented on the server')
      setShowResetDialog(false)
      // await adminAPI.resetEvent()
      // toast.success('Event has been reset. All progress cleared.')
      // loadSettings()
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset event')
    }
  }

  const updateSetting = (key: keyof EventSettings, value: any) => {
    setSettings({ ...settings, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-cinzel text-gold mb-2">Event Control</h2>
          <p className="text-papyrus/70 font-lato">
            Configure event settings and manage event lifecycle
          </p>
        </div>
        <Button
          onClick={loadSettings}
          variant="outline"
          size="sm"
          className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Event Status Card */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
              settings.isEventActive
                ? 'bg-green-500/20 animate-pulse'
                : 'bg-gray-500/20'
            }`}>
              {settings.isEventActive ? (
                <Play className="h-8 w-8 text-green-400" />
              ) : (
                <Square className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-cinzel text-gold">
                {settings.eventName || 'Treasure of the Nile'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-2 w-2 rounded-full ${
                  settings.isEventActive ? 'bg-green-400' : 'bg-gray-400'
                }`} />
                <span className={`font-lato text-sm ${
                  settings.isEventActive ? 'text-green-400' : 'text-papyrus/70'
                }`}>
                  {settings.isEventActive ? 'Event is Live' : 'Event Not Started'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!settings.isEventActive ? (
              <Button
                onClick={() => setShowStartDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Event
              </Button>
            ) : (
              <Button
                onClick={() => setShowEndDialog(true)}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Square className="mr-2 h-4 w-4" />
                End Event
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Event Settings Form */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="h-6 w-6 text-gold" />
          <h3 className="text-xl font-cinzel text-gold">Event Configuration</h3>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-papyrus font-lato">
                Event Name
              </Label>
              <Input
                id="eventName"
                value={settings.eventName}
                onChange={(e) => updateSetting('eventName', e.target.value)}
                placeholder="Treasure of the Nile Volume II"
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
              />
            </div>

          </div>

          {/* Time Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventStart" className="text-papyrus font-lato flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                Start Time
              </Label>
              <Input
                id="eventStart"
                type="datetime-local"
                value={settings.eventStart ? new Date(settings.eventStart).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateSetting('eventStart', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventEnd" className="text-papyrus font-lato flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                End Time
              </Label>
              <Input
                id="eventEnd"
                type="datetime-local"
                value={settings.eventEnd ? new Date(settings.eventEnd).toISOString().slice(0, 16) : ''}
                onChange={(e) => updateSetting('eventEnd', e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
              />
            </div>
          </div>

          {/* Game Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-cinzel text-gold flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxTeams" className="text-papyrus font-lato flex items-center gap-2">
                  <Users className="h-4 w-4 text-gold" />
                  Maximum Teams (0 = unlimited)
                </Label>
                <Input
                  id="maxTeams"
                  type="number"
                  value={settings.maxTeams}
                  onChange={(e) => updateSetting('maxTeams', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pointsPerStation" className="text-papyrus font-lato">
                  Points Per Station
                </Label>
                <Input
                  id="pointsPerStation"
                  type="number"
                  value={settings.pointsPerStation}
                  onChange={(e) => updateSetting('pointsPerStation', parseInt(e.target.value) || 100)}
                  placeholder="100"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hintPenalty" className="text-papyrus font-lato">
                  Hint Penalty (points)
                </Label>
                <Input
                  id="hintPenalty"
                  type="number"
                  value={settings.hintPenalty}
                  onChange={(e) => updateSetting('hintPenalty', parseInt(e.target.value) || 10)}
                  placeholder="10"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attemptPenalty" className="text-papyrus font-lato">
                  Attempt Penalty (points)
                </Label>
                <Input
                  id="attemptPenalty"
                  type="number"
                  value={settings.attemptPenalty}
                  onChange={(e) => updateSetting('attemptPenalty', parseInt(e.target.value) || 5)}
                  placeholder="5"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minPointsPercentage" className="text-papyrus font-lato">
                  Min Points Percentage (%)
                </Label>
                <Input
                  id="minPointsPercentage"
                  type="number"
                  value={settings.minPointsPercentage}
                  onChange={(e) => updateSetting('minPointsPercentage', parseInt(e.target.value) || 30)}
                  placeholder="30"
                  className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-4">
            <h4 className="text-lg font-cinzel text-gold">Features</h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-dark/50 rounded-lg border border-gold/20">
                <div>
                  <Label htmlFor="allowLateRegistration" className="text-papyrus font-lato cursor-pointer">
                    Allow Late Registration
                  </Label>
                  <p className="text-papyrus/50 text-sm font-lato mt-1">
                    Allow teams to register after event start
                  </p>
                </div>
                <Switch
                  id="allowLateRegistration"
                  checked={settings.allowLateRegistration}
                  onCheckedChange={(checked) => updateSetting('allowLateRegistration', checked)}
                  className="data-[state=checked]:bg-gold"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="bg-gold text-blue-dark hover:bg-gold-dark"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-950/20 border-2 border-red-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <h3 className="text-xl font-cinzel text-red-400">Danger Zone</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-dark/50 rounded-lg border border-red-500/30">
            <div>
              <h4 className="text-papyrus font-lato font-medium">Reset Event</h4>
              <p className="text-papyrus/50 text-sm font-lato mt-1">
                Clear all team progress, submissions, and scores. This action cannot be undone.
              </p>
            </div>
            <Button
              onClick={() => setShowResetDialog(true)}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Event
            </Button>
          </div>
        </div>
      </Card>

      {/* Start Event Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent className="bg-blue-deep border-2 border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold font-cinzel">
              Start Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-papyrus/70 font-lato">
              This will officially begin the treasure hunt event. Teams will be able to access
              stations and submit their progress. Make sure all stations are configured correctly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/30 text-papyrus hover:bg-gold/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartEvent}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Event Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent className="bg-blue-deep border-2 border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold font-cinzel">
              End Event?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-papyrus/70 font-lato">
              This will end the treasure hunt event. Teams will no longer be able to submit new
              progress. You can still view results and statistics after ending the event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/30 text-papyrus hover:bg-gold/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndEvent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="mr-2 h-4 w-4" />
              End Event
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Event Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-blue-deep border-2 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400 font-cinzel flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Reset Event Data?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-papyrus/70 font-lato">
              <span className="block mb-2 text-red-400 font-medium">
                WARNING: This action is irreversible!
              </span>
              This will permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All team progress and scores</li>
                <li>All photo and task submissions</li>
                <li>All hint usage records</li>
                <li>All attempt history</li>
              </ul>
              <span className="block mt-3">
                Teams and stations will NOT be deleted. Only progress data will be cleared.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/30 text-papyrus hover:bg-gold/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetEvent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reset All Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default EventControl
