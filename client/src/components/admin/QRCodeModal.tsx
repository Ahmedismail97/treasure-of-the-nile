import { useEffect, useRef } from 'react'
import { Station } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  station: Station | null
}

function QRCodeModal({ isOpen, onClose, station }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen && station && canvasRef.current) {
      generateQRCode()
    }
  }, [isOpen, station])

  const generateQRCode = async () => {
    if (!station || !canvasRef.current) return

    try {
      // Generate QR code with station ID
      const qrData = JSON.stringify({
        stationId: station.id,
        stationNumber: station.stationNumber,
      })

      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1A3A52', // Blue Deep
          light: '#F5F5DC', // Papyrus
        },
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current || !station) return

    const link = document.createElement('a')
    link.download = `station-${station.stationNumber}-qr.png`
    link.href = canvasRef.current.toDataURL()
    link.click()
  }

  const handlePrint = () => {
    if (!canvasRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const qrImage = canvasRef.current.toDataURL()
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Station ${station?.stationNumber} QR Code</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: 'Cinzel', serif;
            }
            .container {
              text-align: center;
              border: 3px solid #D4AF37;
              padding: 40px;
              background: #F5F5DC;
            }
            h1 {
              color: #1A3A52;
              margin: 0 0 10px 0;
              font-size: 2rem;
            }
            h2 {
              color: #D4AF37;
              margin: 0 0 20px 0;
              font-size: 1.5rem;
            }
            img {
              border: 2px solid #D4AF37;
              padding: 10px;
              background: white;
            }
            p {
              margin: 20px 0 0 0;
              color: #1A3A52;
              font-size: 0.9rem;
            }
            @media print {
              @page {
                margin: 0;
              }
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Treasure of the Nile</h1>
            <h2>Station ${station?.stationNumber}</h2>
            <img src="${qrImage}" alt="QR Code" />
            <p>${station?.title}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  if (!station) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-blue-deep border-2 border-gold/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-gold">
            Station {station.stationNumber} QR Code
          </DialogTitle>
          <p className="text-papyrus/70 font-lato text-sm">{station.title}</p>
        </DialogHeader>

        {/* QR Code Display */}
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="bg-papyrus p-6 rounded-lg border-2 border-gold/50">
            <canvas ref={canvasRef} />
          </div>

          <div className="text-center space-y-1">
            <p className="text-papyrus font-lato text-sm">
              Scan this QR code to access the station
            </p>
            <p className="text-papyrus/50 font-lato text-xs">
              Station ID: {station.id} | Number: {station.stationNumber}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-gold text-blue-dark hover:bg-gold-dark"
          >
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex-1 border-gold/30 text-gold hover:bg-gold/10"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default QRCodeModal
