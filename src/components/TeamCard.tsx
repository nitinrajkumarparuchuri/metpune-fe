import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

// Updated interface to match our API data structure
interface TeamCardProps {
  team: {
    id?: string | number;
    team_name: string;
    project?: string;
    status: 'pending' | 'processing' | 'success' | 'failed';
    summary: string;
  };
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const TeamCard = ({ team }: TeamCardProps) => {
  // Extract team name (our primary identifier)
  const teamName = team.team_name;
  
  // Get project name from the team name if not provided
  const projectName = team.project || `${teamName}'s Project`;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{teamName}</h3>
          <p className="text-gray-600">{projectName}</p>
        </div>
        <Badge className={statusColors[team.status]}>
          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
        </Badge>
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3">{team.summary}</p>
      <Link
        to={`/team/${encodeURIComponent(teamName)}`}
        className="text-purple-600 hover:text-purple-700 font-medium"
      >
        View Details →
      </Link>
    </Card>
  );
};

export default TeamCard;