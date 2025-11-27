import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Team } from "@/types";
import { Edit, Eye, MoreVertical, Trash2 } from "lucide-react";

interface TeamsTableProps {
  teams: Team[];
  onViewProgress: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
}

function TeamsTable({
  teams,
  onViewProgress,
  onEditTeam,
  onDeleteTeam,
}: TeamsTableProps) {
  if (teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-papyrus/50 font-lato">No teams found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-gold/30 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-deep border-b-2 border-gold/30 hover:bg-blue-deep">
            <TableHead className="text-gold font-cinzel">Team Code</TableHead>
            <TableHead className="text-gold font-cinzel">Team Name</TableHead>
            <TableHead className="text-gold font-cinzel">
              Current Station
            </TableHead>
            <TableHead className="text-gold font-cinzel">
              Total Points
            </TableHead>
            <TableHead className="text-gold font-cinzel">Status</TableHead>
            <TableHead className="text-gold font-cinzel">Type</TableHead>
            <TableHead className="text-gold font-cinzel text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team) => (
            <TableRow
              key={team.id}
              className="border-b border-gold/10 hover:bg-gold/5"
            >
              <TableCell className="font-mono text-papyrus">
                <Badge className="bg-gold/20 text-gold border-gold font-mono">
                  {team.teamCode}
                </Badge>
              </TableCell>
              <TableCell className="text-papyrus font-lato font-medium">
                {team.teamName}
              </TableCell>
              <TableCell className="text-papyrus/70 font-lato">
                Station {team.currentStation}
              </TableCell>
              <TableCell className="text-gold font-cinzel font-bold">
                {team.totalPoints}
              </TableCell>
              <TableCell>
                {team.isActive ? (
                  <Badge className="bg-green-600/20 text-green-400 border-green-600">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-gray-600/20 text-gray-400 border-gray-600">
                    Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    team.registrationType === "admin"
                      ? "border-blue-400 text-blue-400"
                      : "border-papyrus text-papyrus"
                  }
                >
                  {team.registrationType}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gold hover:bg-gold/10"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-blue-deep border-gold/30"
                  >
                    <DropdownMenuItem
                      onClick={() => onViewProgress(team)}
                      className="text-papyrus hover:bg-gold/10 cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onEditTeam(team)}
                      className="text-papyrus hover:bg-gold/10 cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Team
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTeam(team)}
                      className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TeamsTable;
