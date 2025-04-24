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
import { FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useTeamSummaries, useTeamEvaluations } from '@/hooks/use-data';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Team {
  id: string;
  name: string;
  presentationTitle: string;
  status: string;
  score: number | '-';
  files: string[];
}

interface HackathonDetailsProps {
  hackathonId: string;
  type: string;
}

const HackathonDetails = ({ hackathonId, type }: HackathonDetailsProps) => {
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const navigate = useNavigate();
  const showEvaluateButton = type.toLowerCase().includes('in progress');
  
  // Fetch real data from API
  const teamSummaries = useTeamSummaries();
  const teamEvaluations = useTeamEvaluations();
  
  // Debug data
  console.log('Team Summaries:', teamSummaries.data);
  console.log('Team Evaluations:', teamEvaluations.data);
  
  // Handle loading state
  if (teamSummaries.isLoading || teamEvaluations.isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading team data...</span>
      </div>
    );
  }

  // Handle error state
  if (teamSummaries.isError || teamEvaluations.isError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          Failed to load team data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if data is available and in the expected format
  console.log('Team Summaries type:', typeof teamSummaries.data, Array.isArray(teamSummaries.data));
  
  // Safe transformation of API data
  let teams: Team[] = [];
  
  try {
    // Handle case where data might not be an array
    const summariesArray = Array.isArray(teamSummaries.data) 
      ? teamSummaries.data 
      : teamSummaries.data ? [teamSummaries.data] : [];
      
    teams = summariesArray.map(summary => {
      const evaluation = Array.isArray(teamEvaluations.data) 
        ? teamEvaluations.data.find(evalItem => evalItem.team_name === summary.team_name)
        : null;
      
      return {
        id: summary.id?.toString() || Math.random().toString(36).substring(7),
        name: summary.team_name || 'Unknown Team',
        presentationTitle: summary.team_name?.includes('Team') && summary.team_name.split('Team').length > 1 
          ? summary.team_name.split('Team')[1].trim() + ' Project' 
          : 'Project',
        status: summary.status || 'pending',
        score: evaluation?.total_score ?? '-',
        files: ['project.pdf'] // Placeholder for files, would need a real API endpoint for this
      };
    });
  } catch (error) {
    console.error('Error transforming team data:', error);
    // Fallback to empty array if transformation fails
    teams = [];
  }
  
  // For debugging
  console.log('Transformed teams:', teams);

  // Display message if no teams are available
  if (teams.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-600">No team data available for this hackathon.</p>
        <Button 
          className="mt-4"
          onClick={() => navigate('/dashboard')}
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

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
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.presentationTitle}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    team.status === 'success' ? 'bg-green-100 text-green-800' :
                    team.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    team.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{team.score}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTeam(team)}
                  >
                    View
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
            onClick={() => navigate('/judgement-criteria')}
          >
            Evaluate Hackathon
          </Button>
        </div>
      )}
      
      {/* Team details dialog */}
      <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedTeam?.name} - Details</DialogTitle>
            <DialogDescription>Team information and project details</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Project Summary</h3>
              <p className="text-sm text-gray-700">
                {teamSummaries.data?.find(s => s.team_name === selectedTeam?.name)?.summary || 
                "No summary available for this team."}
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Evaluation Status</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedTeam?.status === 'success' ? 'bg-green-100 text-green-800' :
                        selectedTeam?.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        selectedTeam?.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTeam?.status ? 
                          selectedTeam.status.charAt(0).toUpperCase() + selectedTeam.status.slice(1) : 
                          'Pending'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Score</p>
                    <p className="mt-1 font-semibold">{selectedTeam?.score || 'Not evaluated'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Actions</h3>
              </div>
              <div className="flex space-x-4">
                <Button onClick={() => navigate(`/team/${selectedTeam?.name}`)}>
                  View Full Details
                </Button>
                {showEvaluateButton && (
                  <Button variant="outline" onClick={() => {
                    setSelectedTeam(null);
                    navigate('/judgement-criteria');
                  }}>
                    Evaluate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HackathonDetails;
