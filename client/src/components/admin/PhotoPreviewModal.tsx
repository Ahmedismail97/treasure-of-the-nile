import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, ZoomIn, ZoomOut, X } from 'lucide-react'

interface PhotoPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  photoUrl: string
  teamName?: string
  stationTitle?: string
}

function PhotoPreviewModal({
  isOpen,
  onClose,
  photoUrl,
  teamName,
  stationTitle,
}: PhotoPreviewModalProps) {
  const [zoom, setZoom] = useState(100)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = photoUrl
    link.download = `submission-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handleReset = () => {
    setZoom(100)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-deep border-2 border-gold/30 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-gold">
            Photo Submission
          </DialogTitle>
          {teamName && stationTitle && (
            <div className="text-papyrus/70 font-lato text-sm">
              {teamName} - {stationTitle}
            </div>
          )}
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              size="sm"
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-papyrus font-lato text-sm min-w-[60px] text-center">
              {zoom}%
            </span>
            <Button
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              size="sm"
              variant="outline"
              className="border-gold/30 text-gold hover:bg-gold/10"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
              className="border-gold/30 text-papyrus hover:bg-gold/10"
            >
              Reset
            </Button>
          </div>
          <Button
            onClick={handleDownload}
            size="sm"
            className="bg-gold text-blue-dark hover:bg-gold-dark"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative overflow-auto max-h-[600px] bg-blue-dark/50 rounded-lg border-2 border-gold/20">
          <div className="p-4 flex items-center justify-center min-h-[400px]">
            <img
              src={photoUrl}
              alt="Submission"
              style={{ width: `${zoom}%` }}
              className="max-w-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gold/30 text-papyrus hover:bg-gold/10"
          >
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PhotoPreviewModal
