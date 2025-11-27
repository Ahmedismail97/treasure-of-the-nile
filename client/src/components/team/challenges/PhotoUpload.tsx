import { useState } from 'react'
import { Camera, Upload, X, Loader2, Clock } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import type { Station } from '@/types'

interface PhotoUploadProps {
  station: Station
  teamCode: string
  onSuccess: (message: string, points?: number, nextStation?: { id: number; stationNumber: number; title: string }) => void
  onError: (message: string) => void
}

function PhotoUpload({ station, teamCode, onSuccess, onError }: PhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        onError('Please select an image file')
        return
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        onError('Image must be smaller than 5MB')
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const response = await progressAPI.submitPhoto(station.id, teamCode, selectedFile)
      onSuccess(response.data.message, 0) // Points awarded after admin verification
    } catch (error: any) {
      onError(error.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Prompt */}
      <Card className="card-unlocked egyptian-border">
        <div className="text-gold text-xs md:text-sm mb-2 font-semibold flex items-center gap-1">
          <Camera className="h-3 w-3 md:h-4 md:w-4" />
          <span>Challenge:</span>
        </div>
        <p className="text-papyrus text-sm md:text-base lg:text-lg">{station.challengeData?.prompt}</p>
      </Card>

      {/* File input */}
      <div>
        <Label htmlFor="photo-input" className="text-gold font-semibold text-sm md:text-base">
          Upload Your Photo
        </Label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-input"
          disabled={uploading}
        />
        <label
          htmlFor="photo-input"
          className="block w-full mt-2 p-3 md:p-4 border-2 border-dashed border-gold/50 rounded-lg text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-center"
        >
          <Camera className="h-10 w-10 md:h-12 md:w-12 text-gold mx-auto mb-2" />
          <p className="text-papyrus text-sm md:text-base">
            {selectedFile ? selectedFile.name : 'Tap to select or take a photo'}
          </p>
          <p className="text-papyrus/50 text-xs mt-2">
            Max size: 5MB • Formats: JPG, PNG, GIF, WebP
          </p>
        </label>
      </div>

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="text-gold text-sm font-semibold">Preview:</div>
          <div className="relative rounded-lg overflow-hidden border-2 border-gold/30">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-auto"
            />
          </div>
          <Button
            onClick={() => {
              setSelectedFile(null)
              setPreview(null)
            }}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            <X className="h-4 w-4" />
            <span>Remove photo</span>
          </Button>
        </div>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        className="w-full min-h-[44px] text-sm md:text-base"
        disabled={!selectedFile || uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            <span>Submit for Verification</span>
          </>
        )}
      </Button>

      {/* Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm flex items-start gap-2">
          <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>Your photo will be reviewed by an admin. You'll receive {station.points} points once approved.</span>
        </p>
      </div>
    </div>
  )
}

export default PhotoUpload
