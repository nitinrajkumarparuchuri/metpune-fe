
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

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

const HackathonCard = ({ hackathon }: HackathonCardProps) => {
  return (
    <Card className="p-4 bg-white">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{hackathon.name}</h3>
        <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded">
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
      <Button variant="outline" className="w-full">
        View Details <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </Card>
  );
};

export default HackathonCard;
