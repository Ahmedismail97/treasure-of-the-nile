import { Station } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, QrCode } from "lucide-react";

interface StationsTableProps {
  stations: Station[];
  onEditStation: (station: Station) => void;
  onDeleteStation: (station: Station) => void;
  onViewQRCode: (station: Station) => void;
}

function StationsTable({
  stations,
  onEditStation,
  onDeleteStation,
  onViewQRCode,
}: StationsTableProps) {
  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case "trivia":
        return "bg-blue-500/20 text-blue-400 border-blue-500";
      case "riddle":
        return "bg-purple-500/20 text-purple-400 border-purple-500";
      case "photo":
        return "bg-green-500/20 text-green-400 border-green-500";
      case "physical":
        return "bg-orange-500/20 text-orange-400 border-orange-500";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500";
    }
  };

  const formatChallengeType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (stations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-papyrus/50 font-lato">No stations found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-blue-deep border-b-2 border-gold/30 hover:bg-blue-deep">
          <TableHead className="text-gold font-cinzel">Number</TableHead>
          <TableHead className="text-gold font-cinzel">Title</TableHead>
          <TableHead className="text-gold font-cinzel">Type</TableHead>
          <TableHead className="text-gold font-cinzel">Points</TableHead>
          <TableHead className="text-gold font-cinzel">Location</TableHead>
          <TableHead className="text-gold font-cinzel text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stations.map((station) => (
          <TableRow
            key={station.id}
            className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
          >
            <TableCell className="font-mono text-gold font-medium">
              {station.stationNumber}
            </TableCell>
            <TableCell className="text-papyrus font-lato">
              {station.title}
            </TableCell>
            <TableCell>
              <Badge className={getChallengeTypeColor(station.challengeType)}>
                {formatChallengeType(station.challengeType)}
              </Badge>
            </TableCell>
            <TableCell className="text-gold font-cinzel">
              {station.points}
            </TableCell>
            <TableCell className="text-papyrus/70 font-lato text-sm">
              {station.location || "N/A"}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-papyrus hover:bg-gold/10 hover:text-gold"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-blue-deep border-2 border-gold/30"
                >
                  <DropdownMenuItem
                    onClick={() => onViewQRCode(station)}
                    className="text-papyrus hover:bg-gold/10 hover:text-gold cursor-pointer"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    View QR Code
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onEditStation(station)}
                    className="text-papyrus hover:bg-gold/10 hover:text-gold cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Station
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteStation(station)}
                    className="text-red-400 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Station
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default StationsTable;
