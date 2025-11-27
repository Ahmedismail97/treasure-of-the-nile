import TeamModal from "@/components/admin/TeamModal";
import TeamProgressModal from "@/components/admin/TeamProgressModal";
import TeamsTable from "@/components/admin/TeamsTable";
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
import { Team } from "@/types";
import { Loader2, Plus, RefreshCw, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  useEffect(() => {
    loadTeams();
  }, []);

  useEffect(() => {
    // Filter teams based on search query
    if (!Array.isArray(teams)) {
      setFilteredTeams([]);
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredTeams(teams);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = teams.filter(
        (team) =>
          team.teamName?.toLowerCase().includes(query) ||
          team.teamCode?.toLowerCase().includes(query)
      );
      setFilteredTeams(filtered);
    }
  }, [searchQuery, teams]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getTeams();
      const teamsData = Array.isArray(response.data.teams)
        ? response.data.teams
        : Array.isArray(response.data)
        ? response.data
        : [];
      setTeams(teamsData);
      setFilteredTeams(teamsData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load teams");
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setIsTeamModalOpen(true);
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleViewProgress = (team: Team) => {
    setSelectedTeam(team);
    setIsProgressModalOpen(true);
  };

  const handleDeleteTeam = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      await adminAPI.deleteTeam(teamToDelete.id);
      toast.success(`Team "${teamToDelete.teamName}" deleted successfully`);
      loadTeams();
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete team");
    }
  };

  const handleSaveTeam = async (teamCode: string, teamName: string) => {
    try {
      if (selectedTeam) {
        // Update existing team
        await adminAPI.updateTeam(selectedTeam.id, { teamName });
        toast.success("Team updated successfully");
      } else {
        // Create new team
        await adminAPI.createTeam(teamCode, teamName);
        toast.success("Team created successfully");
      }
      loadTeams();
      setIsTeamModalOpen(false);
    } catch (error: any) {
      throw error;
    }
  };

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
            Team Management
          </h2>
          <p className="text-papyrus/70 font-lato">
            Manage teams, view progress, and monitor participation
          </p>
        </div>
        <Button
          onClick={loadTeams}
          variant="outline"
          size="sm"
          className="border-gold/30 text-gold hover:bg-gold hover:text-blue-dark"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Total Teams</p>
              <p className="text-2xl font-cinzel text-gold">{teams.length}</p>
            </div>
            <Users className="h-8 w-8 text-gold/50" />
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Active Teams</p>
              <p className="text-2xl font-cinzel text-green-400">
                {Array.isArray(teams)
                  ? teams.filter((t) => t.isActive).length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">Admin Created</p>
              <p className="text-2xl font-cinzel text-blue-400">
                {Array.isArray(teams)
                  ? teams.filter((t) => t.registrationType === "admin").length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-blue-deep/90 border-2 border-gold/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-papyrus/70 text-sm font-lato">
                Self Registered
              </p>
              <p className="text-2xl font-cinzel text-papyrus">
                {Array.isArray(teams)
                  ? teams.filter((t) => t.registrationType === "self").length
                  : 0}
              </p>
            </div>
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
              placeholder="Search teams by name or code..."
              className="pl-10 bg-blue-dark border-gold/30 text-papyrus focus:border-gold"
            />
          </div>
          <Button
            onClick={handleCreateTeam}
            className="bg-gold text-blue-dark hover:bg-gold-dark"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>
      </Card>

      {/* Teams Table */}
      <Card className="bg-blue-deep/90 border-2 border-gold/30 p-6">
        <TeamsTable
          teams={filteredTeams}
          onViewProgress={handleViewProgress}
          onEditTeam={handleEditTeam}
          onDeleteTeam={handleDeleteTeam}
        />
      </Card>

      {/* Modals */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSave={handleSaveTeam}
        team={selectedTeam}
      />

      <TeamProgressModal
        isOpen={isProgressModalOpen}
        onClose={() => setIsProgressModalOpen(false)}
        team={selectedTeam}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="bg-blue-deep border-2 border-gold/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gold font-cinzel">
              Delete Team?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-papyrus/70 font-lato">
              Are you sure you want to delete team "{teamToDelete?.teamName}"?
              This action cannot be undone and will remove all associated
              progress.
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
              Delete Team
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamsManagement;
