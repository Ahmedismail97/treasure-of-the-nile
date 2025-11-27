import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { progressAPI } from '../../../services/api'

function QRScanner({ station, teamCode, onSuccess, onError }) {
  const [scanning, setScanning] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

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
          async (decodedText) => {
            await handleScan(decodedText)
          },
          (errorMessage) => {
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

  const handleScan = async (qrData) => {
    await stopScanner()

    try {
      const response = await progressAPI.scanQR(station.id, teamCode, qrData)
      onSuccess(response.data.message, response.data.pointsEarned)
    } catch (error) {
      onError(error.message)
      // Restart scanner after error
      setTimeout(() => startScanner(), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="card egyptian-border">
        <div className="text-gold text-sm mb-2 font-semibold">📱 Instructions:</div>
        <p className="text-papyrus">
          {station.challengeData.message || 'Scan the QR code at this station to prove you are here.'}
        </p>
      </div>

      {/* Scanner area */}
      <div className="bg-blue-dark rounded-lg overflow-hidden border-2 border-gold/30">
        {!scanning && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <p className="text-papyrus/70 mb-6">
              {hasCamera ? 'Ready to scan QR code' : 'Camera not available'}
            </p>
            {hasCamera && (
              <button onClick={startScanner} className="btn btn-gold">
                📸 Start Scanner
              </button>
            )}
          </div>
        )}

        <div id="qr-reader" ref={scannerRef}></div>

        {scanning && (
          <div className="p-4 text-center">
            <button onClick={stopScanner} className="btn btn-blue">
              ⏹ Stop Scanner
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="text-papyrus/50 text-sm space-y-1">
        <p>💡 Tips:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Make sure you're at the correct station location</li>
          <li>Hold your device steady and center the QR code</li>
          <li>Ensure good lighting for best results</li>
        </ul>
      </div>

      <p className="text-gold text-center">
        💰 Complete this station for {station.points} points
      </p>
    </div>
  )
}

export default QRScanner
