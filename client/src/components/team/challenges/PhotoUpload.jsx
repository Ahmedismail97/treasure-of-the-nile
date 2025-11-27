import { useState } from 'react'
import { progressAPI } from '../../../services/api'

function PhotoUpload({ station, teamCode, onSuccess, onError }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
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
        setPreview(reader.result)
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
    } catch (error) {
      onError(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Prompt */}
      <div className="card egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold">📸 Challenge:</div>
        <p className="text-papyrus text-lg">{station.challengeData.prompt}</p>
      </div>

      {/* File input */}
      <div>
        <label className="block text-gold mb-2 font-semibold">Upload Your Photo</label>
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
          className="block w-full p-4 border-2 border-dashed border-gold/50 rounded-lg text-center cursor-pointer hover:border-gold hover:bg-gold/5 transition-all"
        >
          <div className="text-4xl mb-2">📷</div>
          <p className="text-papyrus">
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
          <button
            onClick={() => {
              setSelectedFile(null)
              setPreview(null)
            }}
            className="text-papyrus/70 text-sm hover:text-papyrus"
          >
            ✕ Remove photo
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        className="btn btn-gold w-full"
        disabled={!selectedFile || uploading}
      >
        {uploading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="loader" style={{ width: '20px', height: '20px' }}></div>
            Uploading...
          </span>
        ) : (
          '📤 Submit for Verification'
        )}
      </button>

      {/* Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm">
          ⏳ Your photo will be reviewed by an admin. You'll receive {station.points} points once approved.
        </p>
      </div>
    </div>
  )
}

export default PhotoUpload
