import { useTeam } from "@/context/TeamContext";
import { progressAPI } from "@/services/api";
import type { Progress, Station } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CheckIn from "./challenges/CheckIn";
import PhotoUpload from "./challenges/PhotoUpload";
import PhysicalTask from "./challenges/PhysicalTask";
import QRScanner from "./challenges/QRScanner";
import RiddleChallenge from "./challenges/RiddleChallenge";

interface ChallengeModalProps {
  station: Station;
  progress: Progress;
  teamCode: string;
  onClose: () => void;
}

interface StationData {
  station: Station;
  progress: Progress;
}

function ChallengeModal({
  station,
  progress,
  teamCode,
  onClose,
}: ChallengeModalProps) {
  const [stationData, setStationData] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { refreshProgress } = useTeam();

  useEffect(() => {
    loadStationData();
  }, [station.id]);

  const loadStationData = async () => {
    try {
      const response = await progressAPI.getStation(station.id, teamCode);
      setStationData(response.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load station data");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (message: string, points?: number) => {
    toast.success(message);
    refreshProgress();
    setTimeout(onClose, 2000);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  const renderChallenge = () => {
    if (!stationData) return null;

    const props = {
      station: stationData.station,
      progress: stationData.progress,
      teamCode,
      onSuccess: handleSuccess,
      onError: handleError,
    };

    switch (station.challengeType) {
      case "riddle":
        return <RiddleChallenge {...props} />;
      case "qr":
        return <QRScanner {...props} />;
      case "photo":
        return <PhotoUpload {...props} />;
      case "physical":
        return <PhysicalTask {...props} />;
      case "checkin":
        return <CheckIn {...props} />;
      default:
        return (
          <div className="text-center text-papyrus/70">
            Unknown challenge type
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          className="bg-blue-deep rounded-lg border-2 border-gold shadow-glow-intense max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-blue-deep border-b-2 border-gold/30 p-4 md:p-6 z-10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-gold/70 text-xs md:text-sm mb-1">
                  Station {station.stationNumber}
                </div>
                <h2 className="text-lg md:text-2xl lg:text-3xl font-cinzel text-gold mb-1 md:mb-2 break-words">
                  {station.title}
                </h2>
                <p className="text-papyrus/70 text-xs md:text-sm">{station.description}</p>
              </div>
              <button
                onClick={onClose}
                className="text-papyrus/50 hover:text-papyrus transition-colors ml-2 md:ml-4 p-2 rounded hover:bg-gold/10 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                title="Close"
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="text-center py-8 md:py-12">
                <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-gold animate-spin mx-auto mb-3 md:mb-4" />
                <p className="text-papyrus/70 text-sm md:text-base">Loading challenge...</p>
              </div>
            ) : (
              renderChallenge()
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ChallengeModal;
