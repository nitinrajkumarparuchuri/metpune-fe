import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, FileText, ArrowRight, Search, Calendar, Award, LayoutDashboard, CheckCircle, BarChart, Trophy, X } from 'lucide-react';
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
  
  // Generate summaries dialog states
  const [isGenerateSummariesOpen, setIsGenerateSummariesOpen] = useState(false);
  const [isGeneratingSummaries, setIsGeneratingSummaries] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedTeams, setGeneratedTeams] = useState([]);
  const [generationStatusText, setGenerationStatusText] = useState('');
  
  // Criteria dialog states
  const [isCriteriaDialogOpen, setIsCriteriaDialogOpen] = useState(false);
  const [criteria, setCriteria] = useState([
    { name: 'Innovation', weightage: 20 },
    { name: 'Technical Implementation', weightage: 20 },
    { name: 'User Experience', weightage: 20 },
    { name: 'Business Potential', weightage: 20 },
    { name: 'Presentation Quality', weightage: 20 }
  ]);
  const [criteriaInput, setCriteriaInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [isEvaluationComplete, setIsEvaluationComplete] = useState(false);
  
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
      checkForEvaluations();
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
  
  // Function to check if teams have been evaluated
  const checkForEvaluations = async () => {
    if (!selectedHackathonId) return;
    
    try {
      // Try to get team evaluations from API
      const evaluations = await apiService.getTeamEvaluations(selectedHackathonId);
      
      // If we have evaluations, set the evaluation complete flag
      if (Array.isArray(evaluations) && evaluations.length > 0) {
        setIsEvaluationComplete(true);
      } else {
        setIsEvaluationComplete(false);
      }
    } catch (error) {
      console.error('Error checking for evaluations:', error);
      setIsEvaluationComplete(false);
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
  
  // Function to automatically start team summary generation after ingestion
  const handleAutoGenerateSummaries = async () => {
    try {
      const submissions = await apiService.getSubmissions(selectedHackathonId);
      
      if (Array.isArray(submissions) && submissions.length > 0) {
        const teamNames = [...new Set(submissions.map(s => s.team_name))];
        setError(`Found ${teamNames.length} teams. Click 'Generate Team Summaries' to process the data.`);
      }
    } catch (error) {
      console.error('Error preparing for summary generation:', error);
    }
  };
  
  // Functions for criteria management
  const addCriterion = () => {
    if (criteriaInput.trim() === '') return;
    
    // Calculate the default weighting to keep total at 100%
    const newWeightage = Math.floor(100 / (criteria.length + 1));
    
    // Adjust existing criteria to make room for the new one
    const adjustedCriteria = criteria.map(c => ({
      ...c,
      weightage: Math.floor(c.weightage * (100 - newWeightage) / 100)
    }));
    
    // Add the new criterion
    setCriteria([
      ...adjustedCriteria,
      { name: criteriaInput.trim(), weightage: newWeightage }
    ]);
    
    // Clear the input
    setCriteriaInput('');
  };
  
  const removeCriterion = (index: number) => {
    // Remove the criterion
    const newCriteria = [...criteria];
    newCriteria.splice(index, 1);
    
    // Recalculate weightages to maintain 100% total
    const totalWeightage = newCriteria.reduce((sum, c) => sum + c.weightage, 0);
    if (totalWeightage > 0) {
      const adjustedCriteria = newCriteria.map(c => ({
        ...c,
        weightage: Math.round(c.weightage * 100 / totalWeightage)
      }));
      setCriteria(adjustedCriteria);
    } else {
      setCriteria(newCriteria);
    }
  };
  
  const updateCriterionWeightage = (index: number, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const newCriteria = [...criteria];
    newCriteria[index].weightage = numValue;
    setCriteria(newCriteria);
  };
  
  // Function to start team evaluation
  const startEvaluation = async () => {
    // Validate that weightages sum to 100%
    const totalWeightage = criteria.reduce((sum, c) => sum + c.weightage, 0);
    if (totalWeightage !== 100) {
      alert(`Weightages must sum to 100%. Current total: ${totalWeightage}%`);
      return;
    }
    
    setIsEvaluating(true);
    setEvaluationProgress(0);
    
    try {
      // Save criteria to backend
      for (const criterion of criteria) {
        // Convert weightage from percentage (0-100) to decimal (0-1)
        const weight = criterion.weightage / 100;
        
        await apiService.createJudgingCriterion({
          name: criterion.name,
          description: criterion.name,
          weight: weight, // Decimal value between 0-1
          hackathon_id: selectedHackathonId
        }, selectedHackathonId);
      }
      
      // Get team summaries
      const summaries = await apiService.getTeamSummaries(selectedHackathonId);
      if (!Array.isArray(summaries) || summaries.length === 0) {
        throw new Error('No team summaries found to evaluate');
      }
      
      // Generate evaluations for each team
      for (let i = 0; i < summaries.length; i++) {
        const team = summaries[i];
        await apiService.generateTeamEvaluation(team.team_name, selectedHackathonId);
        
        // Update progress
        const progress = Math.round(((i + 1) / summaries.length) * 100);
        setEvaluationProgress(progress);
      }
      
      // Complete
      setTimeout(() => {
        setIsEvaluating(false);
        setIsCriteriaDialogOpen(false);
        setIsEvaluationComplete(true);
        
        // Navigate to leaderboard to show results
        navigate(`/leaderboard/${selectedHackathonId}`);
      }, 1000);
      
    } catch (error) {
      console.error('Error during evaluation:', error);
      
      let errorMessage = 'An error occurred during evaluation. Please try again.';
      
      // Extract more detailed error message if available
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          errorMessage = `Error: ${error.response.data?.error || error.response.data?.message || 'Server error (Status ' + error.response.status + ')'}`;
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage = 'No response from server. The server might be down or the request timed out.';
        }
      } else if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      
      alert(errorMessage);
      setIsEvaluating(false);
    }
  };
  
  // Function to generate team summaries from the dialog
  const handleGenerateTeamSummaries = async () => {
    setIsGeneratingSummaries(true);
    setGenerationProgress(0);
    setGeneratedTeams([]);
    setGenerationStatusText('Preparing to generate team summaries...');
    
    try {
      // Get all submissions to extract team names
      const submissions = await apiService.getSubmissions(selectedHackathonId);
      
      if (!Array.isArray(submissions) || submissions.length === 0) {
        setGenerationStatusText('No submissions found to generate summaries from.');
        setTimeout(() => {
          setIsGeneratingSummaries(false);
          setIsGenerateSummariesOpen(false);
        }, 2000);
        return;
      }
      
      // Get unique team names
      const teamNames = [...new Set(submissions.map(s => s.team_name))];
      setGenerationStatusText(`Found ${teamNames.length} teams. Starting generation...`);
      
      // Process each team
      for (let i = 0; i < teamNames.length; i++) {
        const teamName = teamNames[i];
        setGenerationStatusText(`Generating summary for team: ${teamName}`);
        
        try {
          // Call API to generate team summary
          await apiService.generateTeamSummary(teamName, selectedHackathonId);
          setGeneratedTeams(prev => [...prev, teamName]);
        } catch (error) {
          console.error(`Error generating summary for team ${teamName}:`, error);
        }
        
        // Update progress
        const progress = Math.round(((i + 1) / teamNames.length) * 100);
        setGenerationProgress(progress);
      }
      
      // All done
      setGenerationStatusText(`Generated summaries for ${generatedTeams.length} of ${teamNames.length} teams`);
      setGenerationProgress(100);
      
      // Refresh data check
      checkForTeamData();
      
      // Close dialog after delay
      setTimeout(() => {
        setIsGeneratingSummaries(false);
        setIsGenerateSummariesOpen(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating team summaries:', error);
      setGenerationStatusText('Error generating team summaries.');
      
      setTimeout(() => {
        setIsGeneratingSummaries(false);
        setIsGenerateSummariesOpen(false);
      }, 2000);
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
                  
                  {/* Wizard-like Process Timeline */}
                  <div className="pt-2 space-y-5">
                    {/* Progress Bar */}
                    <div className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500" 
                        style={{
                          width: isIngestionComplete ? "33%" : "0%", 
                          transition: "width 0.5s ease-in-out"
                        }}
                      ></div>
                      <div 
                        className="bg-amber-500" 
                        style={{
                          width: hasTeamData ? "33%" : "0%", 
                          transition: "width 0.5s ease-in-out"
                        }}
                      ></div>
                      <div 
                        className="bg-green-500" 
                        style={{
                          width: isEvaluationComplete ? "34%" : "0%",
                          transition: "width 0.5s ease-in-out"
                        }}
                      ></div>
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between text-xs text-gray-600 px-1">
                      <div className={isIngestionComplete ? "text-blue-700 font-medium" : ""}>
                        1. Ingest
                      </div>
                      <div className={hasTeamData ? "text-amber-700 font-medium" : ""}>
                        2. Summarize
                      </div>
                      <div className={isEvaluationComplete ? "text-green-700 font-medium" : ""}>
                        3. Evaluate
                      </div>
                    </div>
                    
                    {/* Current Step Content */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                      {!isIngestionComplete ? (
                        /* Step 1: Ingestion */
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Step 1: Ingest Documents
                          </h3>
                          <p className="text-xs text-gray-600">
                            Start by ingesting team documents from Google Drive to extract project data.
                          </p>
                          <Button 
                            onClick={handleIngestData}
                            disabled={isIngesting}
                            size="sm"
                            className="w-full mt-2"
                          >
                            {isIngesting ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                Ingesting...
                              </>
                            ) : "Start Ingestion"}
                          </Button>
                        </div>
                      ) : !hasTeamData ? (
                        /* Step 2: Generate Summaries */
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-amber-600" />
                            Step 2: Generate Team Summaries
                          </h3>
                          <p className="text-xs text-gray-600">
                            Create AI-powered summaries for each team based on their submissions.
                          </p>
                          <Button 
                            onClick={() => setIsGenerateSummariesOpen(true)}
                            size="sm"
                            className="w-full mt-2 bg-amber-600 hover:bg-amber-700"
                          >
                            Generate Summaries
                          </Button>
                        </div>
                      ) : (
                        /* Step 3: Set Criteria & Evaluate */
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium flex items-center">
                            <Award className="h-4 w-4 mr-2 text-green-600" />
                            Step 3: Evaluate Teams
                          </h3>
                          <p className="text-xs text-gray-600">
                            Set judging criteria and evaluate team submissions.
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <Button 
                              onClick={() => setIsCriteriaDialogOpen(true)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Award className="h-3 w-3 mr-1" />
                              Setup Criteria
                            </Button>
                            <Button 
                              onClick={() => navigate(`/leaderboard/${selectedHackathonId}`)}
                              size="sm"
                              variant="outline"
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <Trophy className="h-3 w-3 mr-1" />
                              View Results
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Links */}
                    <div className="flex justify-between">
                      <Button 
                        onClick={handleGetStarted}
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                      >
                        <LayoutDashboard className="h-3 w-3 mr-1" />
                        Dashboard
                      </Button>
                      {hasTeamData && (
                        <Button 
                          onClick={() => navigate(`/insights?hackathonId=${selectedHackathonId}`)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <BarChart className="h-3 w-3 mr-1" />
                          Insights
                        </Button>
                      )}
                      {hasTeamData && (
                        <Button 
                          onClick={() => navigate(`/leaderboard/${selectedHackathonId}`)}
                          variant="ghost"
                          size="sm"
                          className="text-xs"
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Leaderboard
                        </Button>
                      )}
                    </div>
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
      
      {/* Generate Summaries Dialog */}
      <Dialog open={isGenerateSummariesOpen} onOpenChange={(open) => {
        // Only allow closing the dialog programmatically when processing
        if (!open && isGeneratingSummaries) return;
        setIsGenerateSummariesOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Team Summaries</DialogTitle>
            <DialogDescription>
              Create AI-powered summaries for each team based on their submissions
            </DialogDescription>
          </DialogHeader>
          
          {!isGeneratingSummaries ? (
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-700">
                  This process will:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Extract key information from each team's submissions</li>
                  <li>Generate comprehensive summaries of their projects</li>
                  <li>Prepare the data for evaluations and insights</li>
                </ul>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm">
                <p className="font-medium">This process may take several minutes</p>
                <p className="text-amber-700 text-xs mt-1">The system will process each team's documents sequentially.</p>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsGenerateSummariesOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerateTeamSummaries}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate Summaries
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6">
              <div className="mb-4 text-center">
                {generationProgress === 100 ? (
                  <CheckCircle className="h-8 w-8 mx-auto mb-4 text-green-600" />
                ) : (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                )}
                <p className="text-lg font-medium text-gray-700">{generationStatusText}</p>
                <p className="text-sm text-gray-500 mt-1">Please do not close this window.</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={generationProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Generation Progress</span>
                  <span>{Math.round(generationProgress)}%</span>
                </div>
              </div>
              
              {generatedTeams.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium mb-2">Generated Summaries</h4>
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {generatedTeams.map((team, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                        <span>{team}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Judging Criteria Dialog */}
      <Dialog open={isCriteriaDialogOpen} onOpenChange={setIsCriteriaDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Judging Criteria</DialogTitle>
            <DialogDescription>
              Customize evaluation criteria for team assessments
            </DialogDescription>
          </DialogHeader>
          
          {!isEvaluating ? (
            <div className="py-4 space-y-6">
              <div className="space-y-4">
                {/* Selected criteria list */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Evaluation Criteria</h3>
                  <div className="space-y-2">
                    {criteria.map((criterion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={criterion.name}
                          onChange={(e) => {
                            const newCriteria = [...criteria];
                            newCriteria[index].name = e.target.value;
                            setCriteria(newCriteria);
                          }}
                          className="flex-1"
                        />
                        <div className="flex items-center w-24">
                          <Input
                            type="number"
                            value={criterion.weightage}
                            onChange={(e) => updateCriterionWeightage(index, e.target.value)}
                            className="w-16"
                            min="0"
                            max="100"
                          />
                          <span className="ml-1 text-sm">%</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            const newCriteria = [...criteria];
                            newCriteria.splice(index, 1);
                            setCriteria(newCriteria);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Add new criterion */}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add new criterion..."
                    value={criteriaInput}
                    onChange={(e) => setCriteriaInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && criteriaInput.trim()) {
                        setCriteria([...criteria, { name: criteriaInput.trim(), weightage: 0 }]);
                        setCriteriaInput('');
                      }
                    }}
                  />
                  <Button 
                    onClick={() => {
                      if (criteriaInput.trim()) {
                        setCriteria([...criteria, { name: criteriaInput.trim(), weightage: 0 }]);
                        setCriteriaInput('');
                      }
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
                
                {/* Weightage info */}
                <div className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                  <span className="text-sm font-medium">Total Weightage:</span>
                  <span className={`text-sm font-bold ${
                    criteria.reduce((sum, c) => sum + c.weightage, 0) === 100
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {criteria.reduce((sum, c) => sum + c.weightage, 0)}%
                  </span>
                </div>
                
                {/* Information box */}
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium block mb-1">How it works:</span>
                    Each criterion will be used by our AI to evaluate teams. Weightage must total exactly 100%.
                  </p>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCriteriaDialogOpen(false)}
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={startEvaluation}
                  disabled={criteria.reduce((sum, c) => sum + c.weightage, 0) !== 100}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Start Evaluation
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="py-6">
              <div className="mb-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium text-gray-700">Evaluating Teams...</p>
                <p className="text-sm text-gray-500 mt-1">Please don't close this window.</p>
              </div>
              
              <div className="space-y-2">
                <Progress value={evaluationProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Evaluation Progress</span>
                  <span>{Math.round(evaluationProgress)}%</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hackathons;