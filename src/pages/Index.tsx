
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Check, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Header from '@/components/Header';
import apiService from '@/lib/api';
import { useHackathonContext } from '@/contexts/HackathonContext';
import HackathonSelector from '@/components/HackathonSelector';
import axios from 'axios';

const Index = () => {
  const navigate = useNavigate();
  const { selectedHackathonId, setSelectedHackathonId } = useHackathonContext();
  
  // States for multi-step process
  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngestionComplete, setIsIngestionComplete] = useState(false);
  const [hasTeamData, setHasTeamData] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we have team data when the component mounts
  useEffect(() => {
    checkForTeamData();
  }, [selectedHackathonId]);

  // Function to check if we have team data
  const checkForTeamData = async () => {
    setIsCheckingData(true);
    setError(null);
    
    console.log('Checking for existing team data for hackathon ID:', selectedHackathonId);
    
    try {
      // First try to get submissions to make a more resilient check
      console.log('Checking for submissions...');
      let hasSubmissions = false;
      let hasTeamSummariesData = false;
      
      try {
        const submissions = await apiService.getSubmissions(selectedHackathonId);
        console.log('Submissions response:', submissions);
        
        if (Array.isArray(submissions) && submissions.length > 0) {
          console.log('Submissions found:', submissions.length);
          hasSubmissions = true;
          setIsIngestionComplete(true);
        }
      } catch (submissionError) {
        console.error('Error checking submissions:', submissionError);
      }
      
      // Then try to get team summaries
      try {
        console.log('Checking for team summaries...');
        const response = await apiService.getTeamSummaries(selectedHackathonId);
        console.log('Team summaries response:', response);
        
        // If we have team summaries, set hasTeamData to true
        if (Array.isArray(response) && response.length > 0) {
          console.log('Team summaries found:', response.length);
          hasTeamSummariesData = true;
          setIsIngestionComplete(true);
        }
      } catch (summaryError) {
        console.error('Error checking team summaries:', summaryError);
      }
      
      // Update state based on what we found
      if (hasTeamSummariesData || hasSubmissions) {
        setHasTeamData(true);
      } else {
        console.log('No data found for hackathon ID:', selectedHackathonId);
        setHasTeamData(false);
        setIsIngestionComplete(false);
      }
    } catch (error) {
      console.error('Error in checkForTeamData:', error);
      setHasTeamData(false);
      setIsIngestionComplete(false);
    } finally {
      setIsCheckingData(false);
    }
  };

  // Handle data ingestion
  const handleIngestData = async () => {
    setIsIngesting(true);
    setError(null);
    try {
      console.log('Starting document ingestion...');
      await apiService.startIngestion(selectedHackathonId);
      console.log('Ingestion started successfully');
      
      // Improved polling process with longer timeout
      let attempts = 0;
      const maxAttempts = 24; // Check for up to 2 minutes (24 * 5 seconds)
      const pollInterval = 5000; // 5 seconds between checks
      
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          const submissions = await apiService.getSubmissions(selectedHackathonId);
          
          // Check if we have any successful submissions
          const successfulSubmissions = Array.isArray(submissions) && 
            submissions.filter(s => s.status === 'success').length > 0;
          
          // Also check if we have any submissions in processing state
          const processingSubmissions = Array.isArray(submissions) && 
            submissions.filter(s => s.status === 'processing').length > 0;
            
          // If we have at least one successful submission, we can proceed
          if (successfulSubmissions) {
            clearInterval(checkInterval);
            setIsIngestionComplete(true);
            setIsIngesting(false);
            console.log('Documents ingested successfully');
            // After successful ingestion, check for teams to generate summaries
            handleAutoGenerateSummaries();
          } 
          // If we have processing submissions but reached max attempts, allow user to proceed
          else if (processingSubmissions && attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIsIngestionComplete(true);
            setIsIngesting(false);
            setError('Ingestion is taking longer than expected but is still processing. You can proceed to the dashboard to monitor progress.');
            // Also set hasTeamData to false to make it clear that data is not ready yet
            setHasTeamData(false);
          }
          // If max attempts reached with no success or processing, consider it failed
          else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIsIngesting(false);
            setIsIngestionComplete(false);
            setError('No documents found in Google Drive. Please check the folder structure in Google Drive and ensure documents are available before starting ingestion.');
          }
        } catch (error) {
          console.error('Error checking ingestion status:', error);
          
          // If we've had too many errors, stop polling
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIsIngesting(false);
            setError('Error checking ingestion status. Please try again later.');
          }
        }
      }, pollInterval);
    } catch (error) {
      console.error('Error starting ingestion:', error);
      setIsIngesting(false);
      
      // Improved error handling
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          const errorMessage = error.response.data?.error || error.response.data?.message || 'Server error';
          setError(`Error: ${errorMessage}`);
          console.error('Response data:', error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          setError('No response from server. The server might be down or the request timed out.');
          console.error('Request timeout or network error');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Failed to start data ingestion: ${error.message}`);
        }
      } else {
        setError('Failed to start data ingestion. Please try again.');
      }
    }
  };

  // Handle Get Started navigation
  const handleGetStarted = async () => {
    try {
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };
  
  // Function to automatically start team summary generation
  const handleAutoGenerateSummaries = async () => {
    try {
      // Get submissions to find teams
      const submissions = await apiService.getSubmissions(selectedHackathonId);
      
      if (Array.isArray(submissions) && submissions.length > 0) {
        // Get unique team names
        const teamNames = [...new Set(submissions.map(s => s.team_name))];
        
        // Create or update alert message
        setError(`Found ${teamNames.length} teams. Click 'Generate Team Summaries' on the dashboard to generate summaries.`);
        
        // Don't actually trigger generation here - let user do it from the dashboard
        // This avoids long wait times on the homepage
      }
    } catch (error) {
      console.error('Error preparing for summary generation:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Let AI Decode Your Hackathon
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-2">
              Auto-transcribe, summarize, and analyze your hackathon presentations — zero manual effort.
            </p>
            
            <div className="mt-4 mb-6 bg-gray-50 p-4 rounded-lg text-left max-w-lg mx-auto">
              <h3 className="text-gray-800 font-medium mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                How Document Ingestion Works
              </h3>
              <ol className="list-decimal pl-5 text-sm space-y-1 text-gray-700">
                <li>Documents must be in a specific Google Drive folder structure</li>
                <li>Clicking "Ingest Team Data" scans these folders for PDF documents</li>
                <li>Each document is processed and summarized (this can take several minutes)</li>
                <li>After ingestion completes, team summaries can be generated</li>
              </ol>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-700">Select Hackathon</h4>
                  <HackathonSelector 
                    selectedHackathonId={selectedHackathonId}
                    onHackathonChange={setSelectedHackathonId}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  The hackathon you select determines which data context your ingestion will use.
                </p>
              </div>
            </div>
            
            {/* Error message */}
            {error && !isIngestionComplete && (
              <Alert variant="destructive" className="text-left">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                  {error.includes('No documents found') && (
                    <div className="mt-2 text-sm">
                      <p><strong>Required Google Drive Structure:</strong></p>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>Each team should have their own folder (e.g., "TeamAlpha")</li>
                        <li>Inside each team folder, create a project folder (e.g., "ProjectAI")</li>
                        <li>Place PDF documents inside the project folders</li>
                        <li>Example path: <code>TeamAlpha/ProjectAI/presentation.pdf</code></li>
                      </ul>
                      <div className="mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Try Again After Checking Google Drive
                        </Button>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Loading state while checking data */}
            {isCheckingData && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                <span>Checking for existing data...</span>
              </div>
            )}
            
            {/* Show appropriate button based on state */}
            {!isCheckingData && (
              <>
                {!isIngestionComplete && !isIngesting && (
                  <Button 
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
                    onClick={handleIngestData}
                  >
                    Ingest Team Data
                  </Button>
                )}
                
                {isIngesting && (
                  <Button 
                    size="lg"
                    className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
                    disabled
                  >
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingesting Data...
                  </Button>
                )}
                
                {isIngestionComplete && !isIngesting && (
                  <div className="space-y-4">
                    {!hasTeamData && (
                      <Alert className="text-left bg-amber-50">
                        <AlertTitle>Documents Ingested</AlertTitle>
                        <AlertDescription>
                          Documents have been ingested. You may need to generate team summaries from the dashboard.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {error && (
                      <Alert className="text-left bg-blue-50">
                        <AlertTitle>Status</AlertTitle>
                        <AlertDescription className="text-blue-700">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Only show this message when ingestion is still in progress but user is allowed to proceed */}
                    {error && error.includes('still processing') && (
                      <div className="flex items-center gap-2 text-left text-gray-600 mb-4">
                        <div className="flex-shrink-0 h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <div>
                          <p className="mb-1">
                            <strong>Ingestion is still in progress</strong> and will continue in the background.
                            Large files can take several minutes to process.
                          </p>
                          <p className="text-sm text-amber-700">
                            You'll need to wait for ingestion to complete before team summaries can be generated.
                            The dashboard will show real-time progress.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-lg px-8"
                      onClick={handleGetStarted}
                      disabled={!hasTeamData || (error && !error.includes('still processing'))}
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {error && error.includes('still processing') 
                        ? "Continue to Dashboard" 
                        : "Get Started"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
