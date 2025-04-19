
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import HackathonDetails from './HackathonDetails';

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
          </DialogHeader>
          <HackathonDetails hackathonId={hackathon.id} type={hackathon.status} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HackathonCard;

