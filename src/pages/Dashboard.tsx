import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import HackathonSection from '@/components/dashboard/HackathonSection';
import HackathonSelector from '@/components/HackathonSelector';
import GenerateDataPanel from '@/components/GenerateDataPanel';
import { useTeamSummaries, useTeamEvaluations, useHackathonInsights, useHackathons } from '@/hooks/use-data';
import { useHackathonContext } from '@/contexts/HackathonContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Mock data for hackathon structure - real data would come from API
const hackathonStructure = {
  past: [
    {
      id: '1',
      name: 'Spring Innovation Challenge 2024',
      date: 'Mar 15-17, 2024',
      teams: 12,
      presentations: 18,
      insights: 24,
      status: 'completed',
    }
  ],
  inProgress: [
    {
      id: '2',
      name: 'Incubyte AI Hackathon 2025',
      date: 'Feb 5-7, 2024',
      teams: 8,
      presentations: 10,
      insights: 15,
      status: 'in progress',
    }
  ],
  upcoming: [
    {
      id: '3',
      name: 'Fintech Solutions Hackathon',
      date: 'Jan 20-22, 2024',
      teams: 10,
      presentations: 14,
      insights: 18,
      status: 'coming soon',
    }
  ]
};

const Dashboard = () => {
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Get params and navigation
  const { hackathonId: urlHackathonId } = useParams<{ hackathonId: string }>();
  const navigate = useNavigate();
  
  // Get hackathon context
  const { selectedHackathonId, setSelectedHackathonId } = useHackathonContext();
  
  // When URL changes, update the selected hackathon
  useEffect(() => {
    if (urlHackathonId) {
      const hackathonIdNumber = parseInt(urlHackathonId, 10);
      if (!isNaN(hackathonIdNumber) && hackathonIdNumber !== selectedHackathonId) {
        setSelectedHackathonId(hackathonIdNumber);
      }
    }
  }, [urlHackathonId, selectedHackathonId, setSelectedHackathonId]);
  
  // Handle hackathon change
  const handleHackathonChange = (hackathonId: number) => {
    setSelectedHackathonId(hackathonId);
    navigate(`/dashboard/${hackathonId}`);
  };
  
  // Fetch data from our API using the selected hackathon
  const teamSummaries = useTeamSummaries(selectedHackathonId);
  const teamEvaluations = useTeamEvaluations(selectedHackathonId);
  const hackathonInsights = useHackathonInsights(selectedHackathonId);
  const { data: hackathons, isLoading: isHackathonsLoading } = useHackathons();
  
  // Loading state
  const isLoading = 
    teamSummaries.isLoading || 
    teamEvaluations.isLoading || 
    hackathonInsights.isLoading ||
    isHackathonsLoading;
  
  // Error state
  const hasError = 
    teamSummaries.isError || 
    teamEvaluations.isError || 
    hackathonInsights.isError;
  const errorMessage = (teamSummaries.error as Error)?.message || 
                       (teamEvaluations.error as Error)?.message || 
                       (hackathonInsights.error as Error)?.message ||
                       'An error occurred while fetching data';

  // Find the currently selected hackathon
  const currentHackathon = hackathons?.find(h => h.id === selectedHackathonId);
  
  // Update hackathon structure with real data
  const enhancedHackathon = currentHackathon ? {
    id: currentHackathon.id.toString(),
    name: currentHackathon.name,
    date: currentHackathon.start_date && currentHackathon.end_date
      ? `${new Date(currentHackathon.start_date).toLocaleDateString()} - ${new Date(currentHackathon.end_date).toLocaleDateString()}`
      : 'Dates TBD',
    teams: teamSummaries.data?.length || 0,
    presentations: teamSummaries.data?.length || 0,
    insights: hackathonInsights.data?.length || 0,
    status: currentHackathon.status,
  } : hackathonStructure.inProgress[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col mb-8">
            <h1 className="text-2xl font-bold text-center">Hackathon Dashboard</h1>
            <p className="text-gray-600 text-center">Manage and view all your hackathon events</p>
          </div>

          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Analytics Section - Pass real stats */}
          <AnalyticsSection 
            teamCount={teamSummaries.data?.length || 0}
            evaluationCount={
              Array.isArray(teamEvaluations.data) 
                ? teamEvaluations.data.length 
                : 0
            }
            insightCount={hackathonInsights.data?.length || 0}
            isLoading={isLoading}
          />

          {/* Hackathon Selector and Generate Data Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <HackathonSelector
                  selectedHackathonId={selectedHackathonId}
                  onHackathonChange={handleHackathonChange}
                  className="w-full md:w-auto"
                />
                <div className="flex gap-4 w-full md:w-auto">
                  <Input
                    placeholder="Search teams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border rounded-md px-3 py-2"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Generate Data Panel */}
            <div className="md:col-span-1">
              <GenerateDataPanel />
            </div>
          </div>

          {/* Hackathon Lists */}
          {isLoading ? (
            // Skeleton loader for Hackathon Lists
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-lg bg-gray-50">
                  <Skeleton className="h-6 w-1/2 mb-4" />
                  <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HackathonSection
                title="Past Hackathons"
                bgColor="bg-green-50"
                hackathons={hackathonStructure.past}
              />
              <HackathonSection
                title="In Progress"
                bgColor="bg-blue-50"
                hackathons={[enhancedHackathon]}
              />
              <HackathonSection
                title="Upcoming"
                bgColor="bg-purple-50"
                hackathons={hackathonStructure.upcoming}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;