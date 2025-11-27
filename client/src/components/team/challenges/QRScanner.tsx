import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, Square, Trophy } from 'lucide-react'
import { progressAPI } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Station } from '@/types'

interface QRScannerProps {
  station: Station
  teamCode: string
  onSuccess: (message: string, points?: number, nextStation?: { id: number; stationNumber: number; title: string }) => void
  onError: (message: string) => void
}

function QRScanner({ station, teamCode, onSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const scannerRef = useRef<HTMLDivElement>(null)
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const startScanner = async () => {
    try {
      const devices = await Html5Qrcode.getCameras()
      if (devices && devices.length > 0) {
        setHasCamera(true)
        const html5QrCode = new Html5Qrcode('qr-reader')
        html5QrCodeRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          async (decodedText: string) => {
            await handleScan(decodedText)
          },
          (errorMessage: string) => {
            // Silent - scanning errors are normal
          }
        )
        setScanning(true)
      } else {
        setHasCamera(false)
        onError('No camera found on this device')
      }
    } catch (error) {
      console.error('Scanner error:', error)
      setHasCamera(false)
      onError('Failed to access camera. Please grant camera permissions.')
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop()
        html5QrCodeRef.current.clear()
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
      setScanning(false)
    }
  }

  const handleScan = async (qrData: string) => {
    await stopScanner()

    try {
      const response = await progressAPI.scanQR(station.id, teamCode, qrData)
      onSuccess(response.data.message, response.data.pointsEarned, response.data.nextStation)
    } catch (error: any) {
      onError(error.message || 'Invalid QR code')
      // Restart scanner after error
      setTimeout(() => startScanner(), 2000)
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Instructions */}
      <Card className="card-unlocked egyptian-border">
        <div className="text-gold text-xs md:text-sm mb-2 font-semibold flex items-center gap-1">
          <Camera className="h-3 w-3 md:h-4 md:w-4" />
          <span>Instructions:</span>
        </div>
        <p className="text-papyrus text-sm md:text-base">
          {station.challengeData?.message || 'Scan the QR code at this station to prove you are here.'}
        </p>
      </Card>

      {/* Scanner area */}
      <div className="bg-blue-dark rounded-lg overflow-hidden border-2 border-gold/30">
        {!scanning && (
          <div className="text-center py-8 md:py-12">
            <div className="text-4xl md:text-6xl mb-3 md:mb-4">
              {hasCamera ? <Camera className="h-12 w-12 md:h-16 md:w-16 text-gold mx-auto" /> : <CameraOff className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto" />}
            </div>
            <p className="text-papyrus/70 mb-4 md:mb-6 text-sm md:text-base">
              {hasCamera ? 'Ready to scan QR code' : 'Camera not available'}
            </p>
            {hasCamera && (
              <Button onClick={startScanner} className="min-h-[44px] text-sm md:text-base">
                <Camera className="h-4 w-4" />
                <span>Start Scanner</span>
              </Button>
            )}
          </div>
        )}

        <div id="qr-reader" ref={scannerRef}></div>

        {scanning && (
          <div className="p-3 md:p-4 text-center">
            <Button onClick={stopScanner} variant="outline" className="min-h-[44px] text-sm md:text-base">
              <Square className="h-4 w-4" />
              <span>Stop Scanner</span>
            </Button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="text-papyrus/50 text-sm space-y-1">
        <p className="font-semibold flex items-center gap-1">
          <Trophy className="h-4 w-4" />
          <span>Tips:</span>
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Make sure you're at the correct station location</li>
          <li>Hold your device steady and center the QR code</li>
          <li>Ensure good lighting for best results</li>
        </ul>
      </div>

      <p className="text-gold text-center flex items-center justify-center gap-1">
        <Trophy className="h-4 w-4" />
        <span>Complete this station for {station.points} points</span>
      </p>
    </div>
  )
}

export default QRScanner
