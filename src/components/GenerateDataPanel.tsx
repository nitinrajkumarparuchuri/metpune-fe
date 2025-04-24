import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { useHackathonContext } from '@/contexts/HackathonContext';
import { 
  useTeamSummaries, 
  useGenerateTeamSummary, 
  useTeamEvaluations,
  useGenerateHackathonInsights,
  useSubmissions
} from '@/hooks/use-data';

interface Team {
  team_name: string;
  status: string;
}

const GenerateDataPanel = () => {
  const { selectedHackathonId } = useHackathonContext();
  const queryClient = useQueryClient();
  
  // State for tracking generation steps
  const [generatingType, setGeneratingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Fetch existing data with more frequent refetching
  const { data: teamSummaries, isLoading: isLoadingSummaries } = useTeamSummaries(selectedHackathonId);
  const { data: teamEvaluations, isLoading: isLoadingEvaluations } = useTeamEvaluations(selectedHackathonId);
  const { data: submissions, isLoading: isLoadingSubmissions, refetch: refetchSubmissions } = useSubmissions(selectedHackathonId);
  
  // Set up polling for submissions when ingestion is happening
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    // If we have submissions with processing status, poll every 10 seconds
    if (submissions && submissions.some(s => s.status === 'processing')) {
      pollInterval = setInterval(() => {
        console.log('Polling for submission updates...');
        refetchSubmissions();
      }, 5000); // Poll more frequently (every 5 seconds) when ingestion is in progress
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [submissions, refetchSubmissions]);
  
  // Mutations for generating data
  const generateTeamSummary = useGenerateTeamSummary(queryClient);
  const generateHackathonInsights = useGenerateHackathonInsights(queryClient);
  
  // Handle team summary generation
  const handleGenerateTeamSummaries = async () => {
    setError(null);
    setSuccess(null);
    setGeneratingType('summaries');
    
    try {
      // If we have submissions but no team summaries, we need to generate from submission data
      if ((!teamSummaries || teamSummaries.length === 0) && submissions && submissions.length > 0) {
        console.log('No team summaries found, but submissions exist. Generating from submissions...');
        
        // Get unique team names from submissions
        const teamNames = [...new Set(submissions.map(s => s.team_name))];
        console.log(`Found ${teamNames.length} unique teams in submissions`);
        
        // Generate summaries for each team
        let successCount = 0;
        let errorCount = 0;
        
        for (const teamName of teamNames) {
          try {
            await generateTeamSummary.mutateAsync({ 
              teamName, 
              hackathonId: selectedHackathonId 
            });
            successCount++;
          } catch (err) {
            console.error(`Error generating summary for ${teamName}:`, err);
            errorCount++;
          }
        }
        
        setSuccess(`Generated ${successCount} team summaries${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      } else {
        // Normal flow - get list of teams without successful summaries
        const teamsNeedingSummaries = teamSummaries?.filter((team: Team) => 
          team.status !== 'success'
        ) || [];
        
        if (teamsNeedingSummaries.length === 0) {
          setSuccess('All team summaries are already generated!');
          setGeneratingType(null);
          return;
        }
        
        // Generate summaries for each team
        let successCount = 0;
        let errorCount = 0;
        
        for (const team of teamsNeedingSummaries) {
          try {
            await generateTeamSummary.mutateAsync({ 
              teamName: team.team_name, 
              hackathonId: selectedHackathonId 
            });
            successCount++;
          } catch (err) {
            console.error(`Error generating summary for ${team.team_name}:`, err);
            errorCount++;
          }
        }
        
        setSuccess(`Generated ${successCount} team summaries${errorCount > 0 ? ` (${errorCount} failed)` : ''}`);
      }
    } catch (err) {
      console.error('Error generating team summaries:', err);
      setError('Failed to generate team summaries');
    } finally {
      setGeneratingType(null);
    }
  };
  
  // Handle hackathon insights generation
  const handleGenerateHackathonInsights = async () => {
    setError(null);
    setSuccess(null);
    setGeneratingType('insights');
    
    try {
      await generateHackathonInsights.mutateAsync(selectedHackathonId);
      setSuccess('Hackathon insights generation started');
    } catch (err) {
      console.error('Error generating hackathon insights:', err);
      setError('Failed to generate hackathon insights');
    } finally {
      setGeneratingType(null);
    }
  };
  
  // Calculate stats
  const summaryStats = {
    total: teamSummaries?.length || 0,
    success: teamSummaries?.filter((t: Team) => t.status === 'success').length || 0,
    pending: teamSummaries?.filter((t: Team) => t.status === 'pending' || t.status === 'processing').length || 0,
    failed: teamSummaries?.filter((t: Team) => t.status === 'failed').length || 0
  };
  
  // Calculate submission stats
  const submissionStats = {
    total: submissions?.length || 0,
    teams: submissions ? [...new Set(submissions.map(s => s.team_name))].length : 0,
    processing: submissions?.filter(s => s.status === 'processing').length || 0,
    success: submissions?.filter(s => s.status === 'success').length || 0,
    failed: submissions?.filter(s => s.status === 'failed').length || 0,
    pending: submissions?.filter(s => s.status === 'pending').length || 0
  };
  
  // Check if ingestion is still in progress
  const isIngestionInProgress = submissionStats.processing > 0 || submissionStats.pending > 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Data</CardTitle>
        <CardDescription>
          Generate team summaries and hackathon insights for analysis
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}
        
        {isIngestionInProgress && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <div className="flex flex-col w-full">
              <AlertDescription className="text-blue-600 mb-1">
                <strong>Ingestion in progress:</strong> {submissionStats.processing} files being processed, 
                {submissionStats.pending > 0 ? ` ${submissionStats.pending} pending,` : ""} 
                {submissionStats.success} completed
              </AlertDescription>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${submissionStats.total > 0 
                      ? (submissionStats.success / submissionStats.total) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
              
              <div className="text-xs text-gray-500 mt-1">
                Once ingestion completes, you'll be able to generate team summaries.
                Large files may take several minutes to process.
              </div>
            </div>
          </Alert>
        )}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Submissions</h3>
          {isLoadingSubmissions ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {submissionStats.total > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    Total: {submissionStats.total}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Success: {submissionStats.success}
                  </span>
                  {submissionStats.processing > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Processing: {submissionStats.processing}
                    </span>
                  )}
                  {submissionStats.pending > 0 && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      Pending: {submissionStats.pending}
                    </span>
                  )}
                  {submissionStats.failed > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      Failed: {submissionStats.failed}
                    </span>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-amber-700">No submissions found</p>
                  <div className="text-sm text-gray-700 bg-amber-50 p-3 rounded-md">
                    <p className="mb-2"><strong>Possible issues:</strong></p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Google Drive folders not set up properly</li>
                      <li>No PDF documents in the required folders</li>
                      <li>Ingestion not started or failed to start</li>
                    </ul>
                    <a 
                      href="/" 
                      className="text-blue-600 hover:underline mt-2 inline-block"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = '/';
                      }}
                    >
                      Return to homepage to try ingestion again
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
                
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Team Summaries</h3>
          {isLoadingSummaries ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              {summaryStats.total > 0 ? (
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full">
                    Total: {summaryStats.total}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    Success: {summaryStats.success}
                  </span>
                  {summaryStats.pending > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Pending: {summaryStats.pending}
                    </span>
                  )}
                  {summaryStats.failed > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      Failed: {summaryStats.failed}
                    </span>
                  )}
                </div>
              ) : submissions && submissions.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="text-amber-600 font-medium">
                    No team summaries generated yet
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      Available Teams: {submissionStats.teams}
                    </span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                      Submissions: {submissionStats.total}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Click "Generate Team Summaries" to create summaries for these teams.
                  </div>
                </div>
              ) : (
                "No team summaries or submissions found"
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="w-full sm:w-auto"
          title={submissionStats.success === 0 ? "Waiting for ingestion to complete - no successful submissions yet" : ""}
          aria-disabled={submissionStats.success === 0}
          onClick={handleGenerateTeamSummaries}
          disabled={
            generatingType !== null || 
            isLoadingSummaries || 
            isLoadingSubmissions || 
            // Only disable if we have no successful submissions yet
            submissionStats.success === 0 ||
            // Or if all existing summaries are already successful
            (summaryStats.total > 0 && summaryStats.success === summaryStats.total)
          }
        >
          {generatingType === 'summaries' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Team Summaries
        </Button>
        
        <Button 
          variant="outline"
          className="w-full sm:w-auto"
          onClick={handleGenerateHackathonInsights}
          disabled={generatingType !== null || summaryStats.success === 0}
        >
          {generatingType === 'insights' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Hackathon Insights
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GenerateDataPanel;