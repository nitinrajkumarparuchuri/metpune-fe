import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, FileText, ArrowRight, Search, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import apiService from '@/lib/api';
import { useHackathonContext } from '@/contexts/HackathonContext';
import axios from 'axios';

const Hackathons = () => {
  const navigate = useNavigate();
  const { selectedHackathonId, setSelectedHackathonId } = useHackathonContext();
  
  // States
  const [isIngesting, setIsIngesting] = useState(false);
  const [isIngestionComplete, setIsIngestionComplete] = useState(false);
  const [hasTeamData, setHasTeamData] = useState(false);
  const [isCheckingData, setIsCheckingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hackathons, setHackathons] = useState([]);
  const [isLoadingHackathons, setIsLoadingHackathons] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Ingestion progress dialog states
  const [isIngestionDialogOpen, setIsIngestionDialogOpen] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(0);
  const [ingestionStatusText, setIngestionStatusText] = useState('Starting ingestion...');
  
  // New hackathon modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newHackathonName, setNewHackathonName] = useState('');
  const [newHackathonStartDate, setNewHackathonStartDate] = useState('');
  const [newHackathonEndDate, setNewHackathonEndDate] = useState('');
  const [isCreatingHackathon, setIsCreatingHackathon] = useState(false);
  const [createError, setCreateError] = useState('');

  // Fetch hackathons when component mounts
  useEffect(() => {
    fetchHackathons();
  }, []);

  // Check if we have team data when the hackathon changes
  useEffect(() => {
    if (selectedHackathonId) {
      checkForTeamData();
    }
  }, [selectedHackathonId]);

  // Function to fetch hackathons
  const fetchHackathons = async () => {
    setIsLoadingHackathons(true);
    try {
      const response = await apiService.getHackathons();
      if (Array.isArray(response)) {
        setHackathons(response);
        
        // If no hackathon is selected and we have hackathons, select the first active one
        if (!selectedHackathonId && response.length > 0) {
          const activeHackathon = response.find(h => h.status === 'active') || response[0];
          setSelectedHackathonId(activeHackathon.id);
        }
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      setError('Failed to load hackathons. Please refresh the page.');
    } finally {
      setIsLoadingHackathons(false);
    }
  };

  // Function to check if we have team data
  const checkForTeamData = async () => {
    setIsCheckingData(true);
    setError(null);
    
    try {
      // First try to get submissions
      let hasSubmissions = false;
      let hasTeamSummariesData = false;
      
      try {
        const submissions = await apiService.getSubmissions(selectedHackathonId);
        
        if (Array.isArray(submissions) && submissions.length > 0) {
          hasSubmissions = true;
          setIsIngestionComplete(true);
        }
      } catch (submissionError) {
        console.error('Error checking submissions:', submissionError);
      }
      
      // Then try to get team summaries
      try {
        const response = await apiService.getTeamSummaries(selectedHackathonId);
        
        if (Array.isArray(response) && response.length > 0) {
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
    
    // Reset and show ingestion dialog
    setIngestionProgress(0);
    setIngestionStatusText('Starting document ingestion...');
    setIsIngestionDialogOpen(true);
    
    try {
      await apiService.startIngestion(selectedHackathonId);
      setIngestionStatusText('Checking for documents in Google Drive...');
      setIngestionProgress(10);
      
      // Poll for completion
      let attempts = 0;
      const maxAttempts = 24; // Check for up to 2 minutes (24 * 5 seconds)
      const pollInterval = 5000; // 5 seconds between checks
      
      const checkInterval = setInterval(async () => {
        attempts++;
        try {
          // Update progress based on attempts (10-90%)
          const baseProgress = 10; // Start at 10%
          const progressPerAttempt = 80 / maxAttempts; // Distribute 80% across all attempts
          const newProgress = baseProgress + (progressPerAttempt * attempts);
          setIngestionProgress(Math.min(newProgress, 90)); // Cap at 90% until complete
          
          // Update status text periodically
          if (attempts === 3) setIngestionStatusText('Extracting text from documents...');
          if (attempts === 8) setIngestionStatusText('Processing team submissions...');
          if (attempts === 15) setIngestionStatusText('Analyzing document content...');
          
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
            setIngestionProgress(100);
            setIngestionStatusText('Documents ingested successfully!');
            
            // Close the dialog after a short delay
            setTimeout(() => {
              setIsIngestionDialogOpen(false);
              setIsIngestionComplete(true);
              setIsIngesting(false);
            }, 1500);
            
            // After successful ingestion, check for teams to generate summaries
            handleAutoGenerateSummaries();
          } 
          // If we have processing submissions but reached max attempts, allow user to proceed
          else if (processingSubmissions && attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIngestionProgress(95);
            setIngestionStatusText('Ingestion is taking longer than expected but is still processing.');
            
            // Close the dialog after a short delay
            setTimeout(() => {
              setIsIngestionDialogOpen(false);
              setIsIngestionComplete(true);
              setIsIngesting(false);
              setError('Ingestion is taking longer than expected but is still processing. You can proceed to the dashboard to monitor progress.');
              setHasTeamData(false);
            }, 2000);
          }
          // If max attempts reached with no success or processing, consider it failed
          else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIngestionProgress(100);
            setIngestionStatusText('No documents found in Google Drive.');
            
            // Close the dialog after a short delay
            setTimeout(() => {
              setIsIngestionDialogOpen(false);
              setIsIngesting(false);
              setIsIngestionComplete(false);
              setError('No documents found in Google Drive. Please check the folder structure in Google Drive and ensure documents are available before starting ingestion.');
            }, 2000);
          }
        } catch (error) {
          console.error('Error checking ingestion status:', error);
          
          // If we've had too many errors, stop polling
          if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            setIngestionProgress(100);
            setIngestionStatusText('Error checking ingestion status.');
            
            // Close the dialog after a short delay
            setTimeout(() => {
              setIsIngestionDialogOpen(false);
              setIsIngesting(false);
              setError('Error checking ingestion status. Please try again later.');
            }, 2000);
          }
        }
      }, pollInterval);
    } catch (error) {
      console.error('Error starting ingestion:', error);
      
      // Update dialog with error
      setIngestionProgress(100);
      setIngestionStatusText('Error starting ingestion.');
      
      // Error handling
      let errorMessage = 'Failed to start data ingestion. Please try again.';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Error: ${error.response.data?.error || error.response.data?.message || 'Server error'}`;
        } else if (error.request) {
          errorMessage = 'No response from server. The server might be down or the request timed out.';
        } else {
          errorMessage = `Failed to start data ingestion: ${error.message}`;
        }
      }
      
      // Close the dialog after a short delay and show the error
      setTimeout(() => {
        setIsIngestionDialogOpen(false);
        setIsIngesting(false);
        setError(errorMessage);
      }, 2000);
    }
  };

  // Navigate to dashboard
  const handleGetStarted = () => {
    navigate('/dashboard');
  };
  
  // Create a new hackathon
  const handleCreateHackathon = async () => {
    // Validate fields
    if (!newHackathonName.trim()) {
      setCreateError('Hackathon name is required');
      return;
    }
    
    if (!newHackathonStartDate) {
      setCreateError('Start date is required');
      return;
    }
    
    if (!newHackathonEndDate) {
      setCreateError('End date is required');
      return;
    }
    
    // Check if end date is after start date
    if (new Date(newHackathonEndDate) <= new Date(newHackathonStartDate)) {
      setCreateError('End date must be after start date');
      return;
    }
    
    setIsCreatingHackathon(true);
    setCreateError('');
    
    try {
      // Create the hackathon object
      const newHackathon = {
        name: newHackathonName,
        start_date: newHackathonStartDate,
        end_date: newHackathonEndDate,
        status: 'active'
      };
      
      // Call API to create hackathon
      const response = await apiService.createHackathon(newHackathon);
      
      // Refresh hackathon list
      await fetchHackathons();
      
      // Select the newly created hackathon
      if (response && response.id) {
        setSelectedHackathonId(response.id);
      }
      
      // Close modal and reset form
      setIsCreateModalOpen(false);
      resetCreateForm();
      
    } catch (error) {
      console.error('Error creating hackathon:', error);
      setCreateError('Failed to create hackathon. Please try again.');
    } finally {
      setIsCreatingHackathon(false);
    }
  };
  
  // Reset create hackathon form
  const resetCreateForm = () => {
    setNewHackathonName('');
    setNewHackathonStartDate('');
    setNewHackathonEndDate('');
    setCreateError('');
  };
  
  // Open create modal
  const openCreateModal = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };
  
  // Function to automatically start team summary generation
  const handleAutoGenerateSummaries = async () => {
    try {
      const submissions = await apiService.getSubmissions(selectedHackathonId);
      
      if (Array.isArray(submissions) && submissions.length > 0) {
        const teamNames = [...new Set(submissions.map(s => s.team_name))];
        setError(`Found ${teamNames.length} teams. Click 'Generate Team Summaries' on the dashboard to generate summaries.`);
      }
    } catch (error) {
      console.error('Error preparing for summary generation:', error);
    }
  };

  // Get the selected hackathon name
  const selectedHackathon = hackathons.find(h => h.id === selectedHackathonId);
  
  // Filter hackathons based on search query
  const filteredHackathons = hackathons.filter(hackathon => 
    hackathon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-20 pb-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-6">Manage Hackathons</h1>
          
          {/* Hackathon Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Select Hackathon</h2>
              <Button 
                onClick={openCreateModal}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            
            {/* Search bar */}
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search hackathons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            {isLoadingHackathons ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-purple-600 mr-2" />
                <span>Loading...</span>
              </div>
            ) : (
              <div 
                className="space-y-2 overflow-y-auto max-h-64 pr-1"
                style={{ scrollbarWidth: 'thin' }}
              >
                {filteredHackathons.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    {hackathons.length === 0 
                      ? "No hackathons found. Create your first hackathon to get started."
                      : "No hackathons match your search."}
                  </div>
                ) : (
                  filteredHackathons.map(hackathon => (
                    <div 
                      key={hackathon.id}
                      className={`p-3 border rounded-md cursor-pointer flex justify-between items-center ${
                        selectedHackathonId === hackathon.id 
                          ? 'bg-purple-50 border-purple-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedHackathonId(hackathon.id)}
                    >
                      <div>
                        <div className="font-medium">{hackathon.name}</div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full mr-1 ${
                            hackathon.status === 'active' ? 'bg-green-500' :
                            hackathon.status === 'completed' ? 'bg-blue-500' :
                            hackathon.status === 'upcoming' ? 'bg-yellow-500' : 'bg-gray-500'
                          }`}></span>
                          {hackathon.status}
                          <span className="mx-1">•</span>
                          <span>{hackathon.team_count || 0} teams</span>
                          {hackathon.start_date && hackathon.end_date && (
                            <>
                              <span className="mx-1">•</span>
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {selectedHackathonId === hackathon.id && (
                        <div className="text-xs text-purple-600 font-medium">Selected</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Actions */}
          {selectedHackathonId && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-lg font-semibold mb-3">
                {selectedHackathon ? `${selectedHackathon.name}` : 'Next Steps'}
              </h2>
              
              {/* Error message */}
              {error && (
                <Alert variant={error.includes('Found') ? 'default' : 'destructive'} className="mb-4 text-sm">
                  <AlertDescription>
                    {error}
                    {error.includes('No documents found') && (
                      <div className="mt-2 text-xs">
                        <p><strong>Required Drive Structure:</strong></p>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                          <li>Each team folder (e.g., "TeamAlpha")</li>
                          <li>Project folder inside (e.g., "ProjectAI")</li>
                          <li>PDF documents in the project folders</li>
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Loading state */}
              {isCheckingData && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600 mr-2" />
                  <span className="text-sm">Checking data...</span>
                </div>
              )}
              
              {!isCheckingData && (
                <div className="space-y-3">
                  {/* Step 1: Ingest Data (if not already done) */}
                  {!isIngestionComplete && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <div className="text-sm font-medium flex items-center">
                          <FileText className="h-3 w-3 mr-1 text-purple-600" />
                          Ingest Team Documents
                        </div>
                        <div className="text-xs text-gray-500">
                          Process team submissions
                        </div>
                      </div>
                      <Button 
                        onClick={handleIngestData}
                        disabled={isIngesting}
                        size="sm"
                      >
                        {isIngesting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Ingesting...
                          </>
                        ) : "Start Ingestion"}
                      </Button>
                    </div>
                  )}
                  
                  {/* Step 2: Go to Dashboard/Evaluation */}
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-medium">
                        {isIngestionComplete ? 
                          "Documents ingested" : 
                          "No documents ingested yet"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isIngestionComplete ? 
                          (hasTeamData ? "Ready for evaluation" : "Processing data") : 
                          "Ingest documents first or view dashboard"}
                      </div>
                    </div>
                    <Button 
                      onClick={handleGetStarted}
                      variant={isIngestionComplete && hasTeamData ? "default" : "outline"}
                      className={isIngestionComplete && hasTeamData ? "bg-green-600 hover:bg-green-700" : ""}
                      size="sm"
                    >
                      <ArrowRight className="h-3 w-3 mr-1" />
                      {isIngestionComplete ? "Continue" : "View Dashboard"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Create Hackathon Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Hackathon</DialogTitle>
            <DialogDescription>
              Enter the details for your new hackathon.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {createError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="hackathon-name">Hackathon Name</Label>
              <Input
                id="hackathon-name"
                placeholder="e.g., Summer Hackathon 2025"
                value={newHackathonName}
                onChange={(e) => setNewHackathonName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={newHackathonStartDate}
                  onChange={(e) => setNewHackathonStartDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={newHackathonEndDate}
                  onChange={(e) => setNewHackathonEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isCreatingHackathon}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateHackathon} 
              disabled={isCreatingHackathon}
            >
              {isCreatingHackathon ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : "Create Hackathon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ingestion Progress Dialog */}
      <Dialog open={isIngestionDialogOpen} onOpenChange={(open) => {
        // Only allow closing the dialog programmatically, not by user interaction
        if (!open && isIngesting) return;
        setIsIngestionDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md" hideClose={true}>
          <DialogHeader>
            <DialogTitle>Ingesting Documents</DialogTitle>
            <DialogDescription>
              Processing team documents from Google Drive
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="mb-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
              <p className="text-lg font-medium text-gray-700">{ingestionStatusText}</p>
              <p className="text-sm text-gray-500 mt-1">This may take a few minutes depending on the number of documents.</p>
            </div>
            
            <div className="space-y-2">
              <Progress value={ingestionProgress} className="h-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Ingestion Progress</span>
                <span>{Math.round(ingestionProgress)}%</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hackathons;