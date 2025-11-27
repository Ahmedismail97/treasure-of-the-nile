import { useState, useEffect } from 'react'
import { adminAPI } from '@/services/api'
import { PendingVerification } from '@/types/admin'
import VerificationCard from '@/components/admin/VerificationCard'
import PhotoPreviewModal from '@/components/admin/PhotoPreviewModal'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, CheckCircle, Camera, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

function VerificationQueue() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState('all')

  // Photo preview modal
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<{
    url: string
    teamName: string
    stationTitle: string
  } | null>(null)

  useEffect(() => {
    loadVerifications()

    // TODO: Set up WebSocket listener for new submissions
    // This would listen for 'new_photo_submission' and 'new_physical_task_submission' events
  }, [])

  const loadVerifications = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.getPendingVerifications()
      const verificationsData = Array.isArray(response.data.pending)
        ? response.data.pending
        : Array.isArray(response.data)
        ? response.data
        : []
      setVerifications(verificationsData)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load verifications')
      setVerifications([])
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number, points: number) => {
    try {
      await adminAPI.verifySubmission(id, true, points)
      toast.success('Submission approved successfully')

      // Remove from list
      setVerifications((prev) => prev.filter((v) => v.id !== id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve submission')
      throw error
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
      await adminAPI.verifySubmission(id, false, 0)
      toast.success('Submission rejected')

      // Remove from list
      setVerifications((prev) => prev.filter((v) => v.id !== id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject submission')
      throw error
    }
  }

  const handleViewPhoto = (photoUrl: string, teamName: string, stationTitle: string) => {
    setSelectedPhoto({ url: photoUrl, teamName, stationTitle })
    setIsPhotoModalOpen(true)
  }

  // Filter verifications based on selected tab
  const verificationsArray = Array.isArray(verifications) ? verifications : []
  const filteredVerifications = verificationsArray.filter((v) => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'photo') return v.challengeType === 'photo'
    if (selectedTab === 'physical') return v.challengeType === 'physical'
    return true
  })

  const photoCount = verificationsArray.filter((v) => v.challengeType === 'photo').length
  const physicalCount = verificationsArray.filter((v) => v.challengeType === 'physical').length

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
          <h2 className="text-3xl font-cinzel text-gold mb-2">Verification Queue</h2>
          <p className="text-papyrus/70 font-lato">
            Review and approve photo and physical task submissions
          </p>
        </div>
        <Button
          onClick={loadVerifications}
          variant="outline"
          size="sm"
          className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-gold/20 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Total Pending</p>
              <p className="text-3xl font-cinzel text-gold">{verificationsArray.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Camera className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Photo Submissions</p>
              <p className="text-3xl font-cinzel text-blue-400">{photoCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Physical Tasks</p>
              <p className="text-3xl font-cinzel text-purple-400">{physicalCount}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-blue-deep border-2 border-gold/30">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            All Pending
            {verificationsArray.length > 0 && (
              <Badge className="ml-2 bg-gold/20 text-gold border-gold">
                {verificationsArray.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="photo"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            Photos
            {photoCount > 0 && (
              <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-blue-500">
                {photoCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="physical"
            className="data-[state=active]:bg-gold data-[state=active]:text-blue-dark"
          >
            Physical Tasks
            {physicalCount > 0 && (
              <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500">
                {physicalCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <TabsContent value={selectedTab} className="mt-6">
          {filteredVerifications.length === 0 ? (
            <Card className="bg-blue-deep/90 border-2 border-gold/30 p-12">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-cinzel text-papyrus mb-2">
                  All Caught Up!
                </h3>
                <p className="text-papyrus/60 font-lato">
                  No pending verifications at the moment
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredVerifications.map((verification) => (
                <VerificationCard
                  key={verification.id}
                  verification={verification}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewPhoto={(url) =>
                    handleViewPhoto(url, verification.teamName, verification.stationTitle)
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <PhotoPreviewModal
          isOpen={isPhotoModalOpen}
          onClose={() => {
            setIsPhotoModalOpen(false)
            setSelectedPhoto(null)
          }}
          photoUrl={selectedPhoto.url}
          teamName={selectedPhoto.teamName}
          stationTitle={selectedPhoto.stationTitle}
        />
      )}
    </div>
  )
}

export default VerificationQueue
