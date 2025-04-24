import React from 'react';
import AnalyticsCard from './AnalyticsCard';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsSectionProps {
  teamCount?: number;
  evaluationCount?: number;
  insightCount?: number;
  isLoading?: boolean;
}

const AnalyticsSection = ({ 
  teamCount = 0, 
  evaluationCount = 0, 
  insightCount = 0,
  isLoading = false 
}: AnalyticsSectionProps) => {
  
  // If loading, show skeleton cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <AnalyticsCard
        title="Active Teams"
        value={teamCount}
        percentage={teamCount > 0 ? 100 : 0}
        trend="up"
        description={`${teamCount} teams are actively participating`}
      />
      <AnalyticsCard
        title="Team Evaluations"
        value={evaluationCount}
        percentage={teamCount > 0 ? Math.round((evaluationCount / teamCount) * 100) : 0}
        trend={teamCount > 0 && evaluationCount >= teamCount ? "up" : "down"}
        description={`${evaluationCount} of ${teamCount} teams evaluated`}
      />
      <AnalyticsCard
        title="AI Insights Generated"
        value={insightCount}
        percentage={insightCount > 0 ? 100 : 0}
        trend="up"
        description={`${insightCount} insights available`}
      />
    </div>
  );
};

export default AnalyticsSection;