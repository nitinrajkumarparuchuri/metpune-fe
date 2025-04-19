
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Team {
  id: string;
  name: string;
  presentationTitle: string;
  status: string;
  score: number | '-';
  files: string[];
}

// Mock data - in a real app, this would come from an API
const mockTeams: Record<string, Team[]> = {
  '1': [
    { id: '1', name: 'Team Alpha', presentationTitle: 'AI Healthcare Assistant', status: 'Completed', score: 85, files: ['presentation.pdf', 'demo.mp4'] },
    { id: '2', name: 'Team Beta', presentationTitle: 'Smart City Solution', status: 'Completed', score: 92, files: ['slides.pdf', 'code.zip'] },
  ],
  '2': [
    { id: '3', name: 'Team Gamma', presentationTitle: 'Blockchain Voting', status: 'In Progress', score: '-', files: ['draft.pdf'] },
    { id: '4', name: 'Team Delta', presentationTitle: 'AR Navigation', status: 'Pending', score: '-', files: ['proposal.pdf'] },
  ],
  '3': [
    { id: '5', name: 'Team Epsilon', presentationTitle: 'TBA', status: 'Not Started', score: '-', files: [] },
    { id: '6', name: 'Team Zeta', presentationTitle: 'TBA', status: 'Not Started', score: '-', files: [] },
  ],
};

interface HackathonDetailsProps {
  hackathonId: string;
  type: string;
}

const HackathonDetails = ({ hackathonId, type }: HackathonDetailsProps) => {
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const teams = mockTeams[hackathonId] || [];
  
  // Fix the condition to match any of the following: "in progress", "inProgress", or "In Progress"
  const showEvaluateButton = type.toLowerCase().replace(/\s+/g, '') === 'inprogress';

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Name</TableHead>
              <TableHead>Presentation Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Files</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.presentationTitle}</TableCell>
                <TableCell>{team.status}</TableCell>
                <TableCell>{team.score}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedTeam(team)}
                    disabled={team.files.length === 0}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showEvaluateButton && (
        <div className="mt-8">
          <Button 
            size="lg" 
            className="w-full py-6 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
          >
            Evaluate Hackathon
          </Button>
        </div>
      )}

      {/* Files Dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} - Files</DialogTitle>
            <DialogDescription>Review submitted files</DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {selectedTeam?.files.map((file, index) => (
              <li key={index} className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{file}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HackathonDetails;
