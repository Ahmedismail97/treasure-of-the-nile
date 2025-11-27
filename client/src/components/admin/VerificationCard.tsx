import { useState } from 'react'
import { PendingVerification } from '@/types/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Camera, FileText, CheckCircle, X, Loader2, Image as ImageIcon } from 'lucide-react'

interface VerificationCardProps {
  verification: PendingVerification
  onApprove: (id: number, points: number) => Promise<void>
  onReject: (id: number, reason: string) => Promise<void>
  onViewPhoto: (photoUrl: string) => void
}

function VerificationCard({ verification, onApprove, onReject, onViewPhoto }: VerificationCardProps) {
  const [points, setPoints] = useState(verification.pointsAvailable.toString())
  const [rejectionReason, setRejectionReason] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    const pointsValue = parseInt(points)
    if (isNaN(pointsValue) || pointsValue < 0) {
      alert('Please enter valid points')
      return
    }

    setIsApproving(true)
    try {
      await onApprove(verification.id, pointsValue)
    } catch (error) {
      console.error('Approval failed:', error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject(verification.id, rejectionReason.trim() || 'Rejected by admin')
      setShowRejectForm(false)
      setRejectionReason('')
    } catch (error) {
      console.error('Rejection failed:', error)
    } finally {
      setIsRejecting(false)
    }
  }

  const isPhoto = verification.challengeType === 'photo'
  const photoUrl = verification.submissionData?.photoUrl

  return (
    <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          {isPhoto ? (
            <Camera className="h-6 w-6 text-gold mt-1" />
          ) : (
            <FileText className="h-6 w-6 text-gold mt-1" />
          )}
          <div className="flex-1">
            <h3 className="text-xl font-cinzel text-papyrus">
              {verification.teamName}
            </h3>
            <Badge className="bg-gold/20 text-gold border-gold font-mono mt-1">
              {verification.teamCode}
            </Badge>
          </div>
        </div>
        <Badge className={isPhoto ? 'bg-blue-500/20 text-blue-400 border-blue-500' : 'bg-purple-500/20 text-purple-400 border-purple-500'}>
          {isPhoto ? 'Photo' : 'Physical Task'}
        </Badge>
      </div>

      {/* Station Info */}
      <div className="mb-4 pb-4 border-b border-gold/20">
        <p className="text-papyrus/70 text-sm font-lato">
          <span className="font-medium">Station {verification.stationNumber}:</span>{' '}
          {verification.stationTitle}
        </p>
        <p className="text-papyrus/50 text-xs font-lato mt-1">
          Submitted: {new Date(verification.submittedAt).toLocaleString()}
        </p>
      </div>

      {/* Content */}
      <div className="mb-6">
        {isPhoto && photoUrl ? (
          <div className="relative">
            <div
              onClick={() => onViewPhoto(photoUrl)}
              className="cursor-pointer group relative overflow-hidden rounded-lg border-2 border-gold/30 hover:border-gold/60 transition-all"
            >
              <img
                src={photoUrl}
                alt="Submission"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-white mx-auto mb-2" />
                  <p className="text-white font-lato">Click to view full size</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-dark/50 rounded-lg p-4 border border-gold/20">
            <p className="text-papyrus/70 font-lato text-sm">
              {verification.submissionData?.notes || 'No additional notes provided'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      {!showRejectForm ? (
        <div className="space-y-4">
          {/* Points Input */}
          <div className="space-y-2">
            <Label htmlFor={`points-${verification.id}`} className="text-papyrus font-lato">
              Points to Award
            </Label>
            <Input
              id={`points-${verification.id}`}
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="100"
              className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
              disabled={isApproving || isRejecting}
            />
            <p className="text-xs text-papyrus/50 font-lato">
              Suggested: {verification.pointsAvailable} points
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowRejectForm(true)}
              disabled={isApproving || isRejecting}
              variant="outline"
              className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor={`reason-${verification.id}`} className="text-papyrus font-lato">
              Rejection Reason (Optional)
            </Label>
            <Textarea
              id={`reason-${verification.id}`}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this submission is being rejected..."
              className="bg-blue-dark border-gold/30 text-papyrus focus:border-gold resize-none"
              rows={3}
              disabled={isRejecting}
            />
          </div>

          {/* Rejection Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
            <Button
              onClick={() => {
                setShowRejectForm(false)
                setRejectionReason('')
              }}
              disabled={isRejecting}
              variant="outline"
              className="border-gold/30 text-papyrus hover:bg-gold/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

export default VerificationCard
