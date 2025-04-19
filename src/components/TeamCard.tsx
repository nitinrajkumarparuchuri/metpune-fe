
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    project: string;
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
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{team.name}</h3>
          <p className="text-gray-600">{team.project}</p>
        </div>
        <Badge className={statusColors[team.status]}>
          {team.status.charAt(0).toUpperCase() + team.status.slice(1)}
        </Badge>
      </div>
      <p className="text-gray-700 mb-4 line-clamp-3">{team.summary}</p>
      <Link
        to={`/team/${team.id}`}
        className="text-purple-600 hover:text-purple-700 font-medium"
      >
        View Details →
      </Link>
    </Card>
  );
};

export default TeamCard;
