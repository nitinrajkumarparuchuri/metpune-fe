import React from 'react';
import { useHackathons } from '@/hooks/use-data';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface HackathonSelectorProps {
  selectedHackathonId?: number;
  onHackathonChange: (hackathonId: number) => void;
  className?: string;
}

const HackathonSelector: React.FC<HackathonSelectorProps> = ({
  selectedHackathonId,
  onHackathonChange,
  className = '',
}) => {
  const { data: hackathons, isLoading, isError } = useHackathons();

  // Handle loading state
  if (isLoading) {
    return <Skeleton className={`h-10 w-[200px] ${className}`} />;
  }

  // Handle error state
  if (isError) {
    return (
      <Alert variant="destructive" className={`${className}`}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load hackathons
        </AlertDescription>
      </Alert>
    );
  }

  // Handle no hackathons case
  if (!hackathons || hackathons.length === 0) {
    return (
      <Alert className={`${className}`}>
        <AlertDescription>
          No hackathons available
        </AlertDescription>
      </Alert>
    );
  }

  // If no hackathon is selected and we have hackathons, select the first one (active if possible)
  if (!selectedHackathonId && hackathons.length > 0) {
    // Try to find an active hackathon
    const activeHackathon = hackathons.find(h => h.status === 'active');
    if (activeHackathon) {
      // Don't update in the render phase, schedule it for after rendering
      setTimeout(() => onHackathonChange(activeHackathon.id), 0);
    } else {
      // If no active hackathon, select the first one
      setTimeout(() => onHackathonChange(hackathons[0].id), 0);
    }
    return <Skeleton className={`h-10 w-[200px] ${className}`} />;
  }

  return (
    <Select
      value={selectedHackathonId?.toString()}
      onValueChange={(value) => onHackathonChange(parseInt(value))}
      className={className}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a hackathon" />
      </SelectTrigger>
      <SelectContent>
        {hackathons.map((hackathon) => (
          <SelectItem key={hackathon.id} value={hackathon.id.toString()}>
            {hackathon.name} 
            {hackathon.status !== 'active' && ` (${hackathon.status})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default HackathonSelector;