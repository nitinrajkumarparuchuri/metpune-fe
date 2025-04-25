
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, FileText, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTeamSummaries, useTeamEvaluations } from '@/hooks/use-data';
import apiService from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface HackathonCardProps {
  hackathon: {
    id: string;
    name: string;
    date: string;
    teams: number;
    presentations: number;
    insights: number;
    status: string;
  };
}

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'in progress':
      return 'text-blue-600 bg-blue-100';
    case 'coming soon':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const TeamsDialog = ({ hackathonId, hackathonName }: { hackathonId: string, hackathonName: string }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Use the proper hook from use-data.ts to fetch team data with the correct hackathon ID
  const { data: teams, isLoading, isError, error: queryError } = useTeamSummaries(parseInt(hackathonId));
  
  // Set loading and error based on the query state
  React.useEffect(() => {
    setLoading(isLoading);
    if (isError && queryError) {
      setError(queryError.message || "Failed to load team data");
    }
  }, [isLoading, isError, queryError]);
  
  // Also fetch evaluations for debugging
  const teamEvaluations = useTeamEvaluations(parseInt(hackathonId));
  
  console.log('Team summaries data:', teams);
  console.log('Team evaluations data:', teamEvaluations.data);
  
  // Show loading state
  if (loading) {
    return (
      <div className="py-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading teams data...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Show empty state
  if (teams.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500 mb-4">No teams found for this hackathon.</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow key={team.id || index}>
              <TableCell className="font-medium">{team.team_name}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  team.status === 'success' ? 'bg-green-100 text-green-800' :
                  team.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  team.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  team.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {team.status ? team.status.charAt(0).toUpperCase() + team.status.slice(1) : 'Pending'}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/team/${team.team_name}`)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white" 
          onClick={() => {
            console.log('Navigating to leaderboard with hackathon ID:', hackathonId);
            const numericHackathonId = parseInt(hackathonId);
            navigate(`/leaderboard/${numericHackathonId}`);
          }}
        >
          View Leaderboard
        </Button>
        
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white" 
          onClick={() => {
            console.log('Navigating to judgement criteria with hackathon ID:', hackathonId);
            // Make sure hackathonId is treated as a number
            const numericHackathonId = parseInt(hackathonId);
            navigate(`/judgement-criteria?hackathonId=${numericHackathonId}`);
          }}
        >
          Evaluate Teams
        </Button>
      </div>
    </div>
  );
};

const HackathonCard = ({ hackathon }: HackathonCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const statusStyles = getStatusStyles(hackathon.status);
  
  return (
    <>
      <Card className="p-4 bg-white flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{hackathon.name}</h3>
          <span className={`${statusStyles} text-sm font-medium px-2 py-1 rounded`}>
            {hackathon.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{hackathon.date}</p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-2xl font-bold">{hackathon.teams}</div>
            <div className="text-sm text-gray-600">Teams</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{hackathon.presentations}</div>
            <div className="text-sm text-gray-600">Presentations</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{hackathon.insights}</div>
            <div className="text-sm text-gray-600">Insights</div>
          </div>
        </div>
        <div className="mt-auto">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => setIsOpen(true)}
          >
            View Details <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{hackathon.name}</DialogTitle>
            <DialogDescription>
              Teams available for evaluation in this hackathon system
            </DialogDescription>
          </DialogHeader>
          <TeamsDialog hackathonId={hackathon.id} hackathonName={hackathon.name} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HackathonCard;

