import QRCodeModal from "@/components/admin/QRCodeModal";
import StationModal from "@/components/admin/StationModal";
import StationsTable from "@/components/admin/StationsTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminAPI } from "@/services/api";
import { Station } from "@/types";
import {
  Camera,
  FileText,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function StationsManagement() {
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    // Filter stations based on search query
    if (!Array.isArray(stations)) {
      setFilteredStations([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredStations(stations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = stations.filter(
        (station) =>
          station.title?.toLowerCase().includes(query) ||
          station.description?.toLowerCase().includes(query) ||
          station.stationNumber?.toString().includes(query) ||
          station.challengeType?.toLowerCase().includes(query)
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, stations]);

  const loadStations = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getStations();
      // Extract stations array from response
      const stationsData = Array.isArray(response.data.stations)
        ? response.data.stations
        : Array.isArray(response.data)
        ? response.data
        : [];

      // Sort by stationNumber (or orderIndex if available)
      const sortedStations = stationsData.sort((a: Station, b: Station) => {
        const aOrder = a.stationNumber ?? a.orderIndex ?? 0;
        const bOrder = b.stationNumber ?? b.orderIndex ?? 0;
        return aOrder - bOrder;
      });
      setStations(sortedStations);
      setFilteredStations(sortedStations);
    } catch (error: any) {
      toast.error(error.message || "Failed to load stations");
      setStations([]);
      setFilteredStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStation = () => {
    setSelectedStation(null);
    setIsStationModalOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setSelectedStation(station);
    setIsStationModalOpen(true);
  };

  const handleViewQRCode = (station: Station) => {
    setSelectedStation(station);
    setIsQRModalOpen(true);
  };

  const handleDeleteStation = (station: Station) => {
    setStationToDelete(station);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!stationToDelete) return;

    try {
      await adminAPI.deleteStation(stationToDelete.id);
      toast.success(`Station "${stationToDelete.title}" deleted successfully`);
      loadStations();
      setIsDeleteDialogOpen(false);
      setStationToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete station");
    }
  };

  const handleSaveStation = async (stationData: Partial<Station>) => {
    try {
      if (selectedStation) {
        // Update existing station
        await adminAPI.updateStation(selectedStation.id, stationData);
        toast.success("Station updated successfully");
      } else {
        // Create new station
        await adminAPI.createStation(stationData);
        toast.success("Station created successfully");
      }
      loadStations();
      setIsStationModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

  // Calculate stats
  const stationsArray = Array.isArray(stations) ? stations : [];
  const totalStations = stationsArray.length;
  const triviaCount = stationsArray.filter(
    (s) => s.challengeType === "trivia"
  ).length;
  const riddleCount = stationsArray.filter(
    (s) => s.challengeType === "riddle"
  ).length;
  const photoCount = stationsArray.filter(
    (s) => s.challengeType === "photo"
  ).length;
  const physicalCount = stationsArray.filter(
    (s) => s.challengeType === "physical"
  ).length;
  const totalPoints = stationsArray.reduce(
    (sum, s) => sum + (s.points || s.pointsAvailable || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-cinzel text-gold mb-2">
            Station Management
          </h2>
          <p className="text-papyrus/70 font-lato">
            Create, configure, and manage treasure hunt stations
          </p>
        </div>
        <Button
          onClick={loadStations}
          variant="outline"
          size="sm"
          className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">
                Total Stations
              </p>
              <p className="text-2xl font-cinzel text-gold">{totalStations}</p>
            </div>
            <MapPin className="h-8 w-8 text-gold/50" />
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Total Points</p>
              <p className="text-2xl font-cinzel text-gold">{totalPoints}</p>
            </div>
            <Trophy className="h-8 w-8 text-gold/50" />
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div>
            <p className="text-papyrus/70 text-sm font-lato">Trivia</p>
            <p className="text-2xl font-cinzel text-blue-400">{triviaCount}</p>
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div>
            <p className="text-papyrus/70 text-sm font-lato">Riddles</p>
            <p className="text-2xl font-cinzel text-purple-400">
              {riddleCount}
            </p>
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Photo</p>
              <p className="text-2xl font-cinzel text-green-400">
                {photoCount}
              </p>
            </div>
            <Camera className="h-6 w-6 text-green-400/50" />
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Physical</p>
              <p className="text-2xl font-cinzel text-orange-400">
                {physicalCount}
              </p>
            </div>
            <FileText className="h-6 w-6 text-orange-400/50" />
          </div>
        </Card>
      </div>

      {/* Search and Actions Bar */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-papyrus/50" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stations by title, type, or number..."
              className="pl-10 bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
            />
          </div>
          <Button
            onClick={handleCreateStation}
            className="bg-gold text-blue-dark hover:bg-gold-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Station
          </Button>
        </div>
      </Card>

      {/* Stations Table */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <StationsTable
          stations={filteredStations}
          onEditStation={handleEditStation}
          onDeleteStation={handleDeleteStation}
          onViewQRCode={handleViewQRCode}
        />
      </Card>

      {/* Modals */}
      <StationModal
        isOpen={isStationModalOpen}
        onClose={() => setIsStationModalOpen(false)}
        onSave={handleSaveStation}
        station={selectedStation}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        station={selectedStation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-blue-deep border-2 border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold font-cinzel">
              Delete Station?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-papyrus/70 font-lato">
              Are you sure you want to delete station "{stationToDelete?.title}
              "? This action cannot be undone and will affect all team progress
              at this station.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold/30 text-papyrus hover:bg-gold/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Station
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StationsManagement;
