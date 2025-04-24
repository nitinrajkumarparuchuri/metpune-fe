import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowRight, Loader } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHackathons } from '@/hooks/use-data';
import { useHackathonContext } from '@/contexts/HackathonContext';

interface FilterWithWeightage {
  name: string;
  weightage: number;
}

const JudgementCriteria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use the hackathon context to get the current hackathon
  const { selectedHackathonId, selectedHackathon } = useHackathonContext();
  
  const [filters, setFilters] = useState<FilterWithWeightage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{leaderboard?: any[], error?: string}>(null);
  const [transitionState, setTransitionState] = useState<'idle' | 'loading' | 'results' | 'transition'>('idle');
  
  console.log('Current hackathon context:', { 
    selectedHackathonId, 
    selectedHackathon: selectedHackathon?.name
  });

  const suggestedFilters = [
    'AI through out the SDLC',
    'Speed and efficiency',
    'working product',
    'craft and quality',
    'Innovation',
    'Knowledge sharing'
  ];

  const addFilter = (filter: string) => {
    if (!filters.some(f => f.name === filter) && filter.trim() !== '') {
      setFilters([...filters, { name: filter, weightage: 12 }]);
      setInputValue('');
    }
  };

  const removeFilter = (filterToRemove: string) => {
    setFilters(filters.filter(filter => filter.name !== filterToRemove));
  };

  const updateWeightage = (filterName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFilters(filters.map(filter => 
      filter.name === filterName 
        ? { ...filter, weightage: numValue } 
        : filter
    ));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addFilter(inputValue);
    }
  };

  const handleProceed = async () => {
    if (filters.length === 0) {
      alert("Please add at least one judging criterion");
      return;
    }
    
    // Calculate total weightage to ensure it adds up to 100%
    const totalWeightage = filters.reduce((sum, filter) => sum + (filter.weightage || 0), 0);
    if (totalWeightage !== 100) {
      alert(`Your criteria weightages should add up to 100%. Current total: ${totalWeightage}%`);
      return;
    }
    
    // Update state to loading
    setIsLoading(true);
    setTransitionState('loading');
    
    // We'll always create new criteria and run evaluations with those criteria
    console.log('Starting fresh with new judging criteria setup');
    
    // Store the current criteria set for identification
    const criteriaSignature = filters.map(f => `${f.name}:${f.weightage}`).sort().join('|');
    
    try {
      // Save each criterion to the backend
      console.log(`Saving ${filters.length} criteria for hackathon ID: ${selectedHackathonId}`);
      
      // Get existing criteria for comparison and update
      const existingCriteriaMap = new Map();
      if (selectedHackathonId) {
        try {
          // Fetch existing criteria
          const response = await fetch(`/api/hackathons/${selectedHackathonId}/judging_criteria`);
          if (response.ok) {
            const existingCriteria = await response.json();
            console.log(`Found ${existingCriteria.length} existing criteria`);
            
            // Create a map of existing criteria by name (lowercase for case-insensitive comparison)
            existingCriteria.forEach(criterion => {
              existingCriteriaMap.set(criterion.name.toLowerCase(), criterion);
            });
            
            // Find criteria to delete (ones that exist in DB but not in our current set)
            const currentCriteriaNames = new Set(filters.map(f => f.name.toLowerCase()));
            const criteriaToDelete = existingCriteria.filter(
              criterion => !currentCriteriaNames.has(criterion.name.toLowerCase())
            );
            
            // Only delete criteria that aren't in our current set
            if (criteriaToDelete.length > 0) {
              console.log(`Deleting ${criteriaToDelete.length} unused criteria`);
              for (const criterion of criteriaToDelete) {
                await fetch(`/api/hackathons/${selectedHackathonId}/judging_criteria/${criterion.id}`, {
                  method: 'DELETE',
                });
              }
              console.log('Deleted unused criteria');
            }
          }
        } catch (error) {
          console.error('Error managing existing criteria:', error);
        }
      }
      
      // Process all criteria (create new or update existing)
      for (const filter of filters) {
        // Convert weightage from percentage to decimal
        const weight = filter.weightage / 100;
        
        // Check if a criterion with this name already exists
        const existingCriterion = existingCriteriaMap.get(filter.name.toLowerCase());
        
        if (existingCriterion) {
          console.log(`Criterion "${filter.name}" already exists, updating weight from ${existingCriterion.weight} to ${weight}`);
          
          // Update existing criterion
          const updateData = {
            judging_criterion: {
              description: `Criterion: ${filter.name} with weight ${filter.weightage}%`,
              weight: weight
            }
          };
          
          const updateEndpoint = selectedHackathonId 
            ? `/api/hackathons/${selectedHackathonId}/judging_criteria/${existingCriterion.id}` 
            : `/api/judging_criteria/${existingCriterion.id}`;
            
          try {
            const response = await fetch(updateEndpoint, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(updateData),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error updating criterion:', errorData);
              console.warn(`Update failed for "${filter.name}" - continuing with process`);
            } else {
              console.log(`Successfully updated criterion: ${filter.name}`);
            }
          } catch (error) {
            console.error(`Error updating criterion ${filter.name}:`, error);
            // Continue with other criteria
          }
        } else {
          console.log(`Creating new criterion: ${filter.name} with weight ${weight}`);
          
          // Create new criterion
          const criterionData = {
            judging_criterion: {
              name: filter.name,
              description: `Criterion: ${filter.name} with weight ${filter.weightage}%`,
              weight: weight,
              hackathon_id: selectedHackathonId
            }
          };
          
          const createEndpoint = selectedHackathonId 
            ? `/api/hackathons/${selectedHackathonId}/judging_criteria` 
            : '/api/judging_criteria';
            
          try {
            const response = await fetch(createEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(criterionData),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              console.error('Error creating criterion:', errorData);
              console.warn(`Creation failed for "${filter.name}" - continuing with process`);
            } else {
              console.log(`Successfully created criterion: ${filter.name}`);
            }
          } catch (error) {
            console.error(`Error creating criterion ${filter.name}:`, error);
            // Continue with other criteria
          }
        }
      }
      
      console.log('All criteria saved successfully');
      
      // Start team evaluations for all teams
      console.log('Starting team evaluations');
      
      // Get criteria IDs that we just created
      if (selectedHackathonId) {
        try {
          // Now fetch the newly created criteria
          const newCriteriaResponse = await fetch(`/api/hackathons/${selectedHackathonId}/judging_criteria`);
          if (!newCriteriaResponse.ok) {
            throw new Error('Failed to fetch judging criteria');
          }
          
          const criteriaData = await newCriteriaResponse.json();
          const criteriaIds = criteriaData.map(criterion => criterion.id);
          console.log('Using criteria IDs:', criteriaIds);
          
          // Get team summaries for this hackathon
          const summariesResponse = await fetch(`/api/hackathons/${selectedHackathonId}/team_summaries`);
          if (!summariesResponse.ok) {
            throw new Error('Failed to fetch team summaries');
          }
          
          const summaries = await summariesResponse.json();
          console.log('Found team summaries:', summaries.length);
          
          // Start evaluation for each team
          const evaluationPromises = [];
          const evaluatedTeamNames = new Set();
          
          for (const summary of summaries) {
            console.log(`Starting evaluation for team: ${summary.team_name}`);
            
            const evalResponse = await fetch(`/api/hackathons/${selectedHackathonId}/team_evaluations/generate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                team_name: summary.team_name,
                criteria_ids: criteriaIds,
                criteria_signature: criteriaSignature, // Add the criteria signature
                force_new: "true" // Force new evaluations for this criteria set
              }),
            });
            
            if (!evalResponse.ok) {
              console.error(`Failed to start evaluation for ${summary.team_name}:`, await evalResponse.json());
            } else {
              const evalData = await evalResponse.json();
              console.log(`Evaluation response for ${summary.team_name}:`, evalData);
              
              // If already evaluated with success status, consider it complete
              if (evalData.already_evaluated && evalData.status === "success") {
                console.log(`Team ${summary.team_name} already has successful evaluation`);
              }
              
              console.log(`Evaluation started/exists for ${summary.team_name}`);
              evaluationPromises.push(summary.team_name);
              evaluatedTeamNames.add(summary.team_name);
            }
          }
          
          // Store team names for later polling comparison
          const teamsToEvaluate = [...evaluatedTeamNames];
          
          // If no evaluations were started but we have team summaries, show warning but continue
          if (evaluationPromises.length === 0) {
            console.warn('No team evaluations could be started, but will check for existing evaluations');
          }
          
          // Poll for evaluation status
          let allComplete = false;
          let leaderboardData = null;
          const startTime = Date.now();
          const timeoutMs = 60000; // 1 minute timeout (reduced for testing)
          const maxPolls = 5; // Max number of poll attempts
          let pollCount = 0;
          
          console.log('Starting evaluation polling...');
          
          // Instead of using a while loop, which can block rendering,
          // use a recursive setTimeout approach for polling
          const pollForResults = async () => {
            pollCount++;
            console.log(`Polling attempt ${pollCount} of ${maxPolls}`);
            
            if (allComplete || Date.now() - startTime > timeoutMs || pollCount >= maxPolls) {
              console.log('Polling complete or timed out. Reason:', 
                allComplete ? 'All data received' : 
                (Date.now() - startTime > timeoutMs) ? 'Timeout reached' : 
                'Max poll count reached'
              );
              
              let finalResultData = null;
              
              // If we have leaderboard data from polling, use it
              if (leaderboardData && leaderboardData.length > 0) {
                console.log('Using leaderboard data collected during polling');
                finalResultData = { leaderboard: leaderboardData };
              } else {
                // Make one final attempt to get results
                try {
                  console.log('Making final leaderboard request for hackathon');
                  // First try with criteria signature
                  let finalResponse = await fetch(`/api/hackathons/${selectedHackathonId}/leaderboard?criteria_signature=${encodeURIComponent(criteriaSignature)}`);
                  console.log('Response with criteria signature, status:', finalResponse.status);
                  
                  // If no results, try without criteria signature to get all evaluations
                  const firstResult = await finalResponse.json();
                  if (!firstResult.leaderboard || firstResult.leaderboard.length === 0) {
                    console.log('No results with criteria signature, trying without it');
                    finalResponse = await fetch(`/api/hackathons/${selectedHackathonId}/leaderboard`);
                    console.log('Response without criteria signature, status:', finalResponse.status);
                    
                    if (finalResponse.ok) {
                      finalResultData = await finalResponse.json();
                    }
                  } else {
                    finalResultData = firstResult;
                  }
                  
                  if (!finalResultData) {
                    console.error('Final request failed to get data');
                    finalResultData = { error: 'Could not retrieve evaluation results. Please try again.' };
                  } else if (!finalResultData.leaderboard || finalResultData.leaderboard.length === 0) {
                    console.log('No data in final result');
                    finalResultData = { error: 'No evaluation results available yet. Please check the dashboard.' };
                  }
                } catch (error) {
                  console.error('Error in final request:', error);
                  finalResultData = { error: 'Error retrieving results. Please try again.' };
                }
              }
              
              // First mark as transitioning
              setTransitionState('transition');
              
              // Set the results
              setResults(finalResultData);
              
              // Wait briefly to ensure dialog transition works correctly
              setTimeout(() => {
                setTransitionState('results');
                setIsLoading(false);
              }, 100);
              return;
            }
            
            // Wait between polls
            // Wait between polls - longer wait time to give AI time to process
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
              // First, check the status of in-progress evaluations
              console.log('Checking status of evaluations...');
              const statusUrl = `/api/hackathons/${selectedHackathonId}/team_evaluations/status`;
              const statusResponse = await fetch(statusUrl);
              
              if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('Evaluation status:', statusData);
                
                if (statusData.stuck_count > 0) {
                  console.warn(`Found ${statusData.stuck_count} potentially stuck evaluations!`);
                }
                
                console.log(`Completion: ${statusData.completion_percent}% (${statusData.status_counts.success}/${statusData.status_counts.total} complete)`);
                
                // If all evaluations are complete, we can fetch the leaderboard
                if (statusData.complete) {
                  console.log('All evaluations are complete according to status endpoint!');
                  allComplete = true;
                }
              }
              
              // Check leaderboard - first try with signature, then without if needed
              console.log(`Polling leaderboard for hackathon ID: ${selectedHackathonId}`);
              
              // First try with criteria signature
              let leaderboardResponse = await fetch(`/api/hackathons/${selectedHackathonId}/leaderboard?criteria_signature=${encodeURIComponent(criteriaSignature)}`);
              console.log('Leaderboard response with signature, status:', leaderboardResponse.status);
              
              const signatureResult = await leaderboardResponse.json();
              
              // If no results with signature, try without it
              if (!signatureResult.leaderboard || signatureResult.leaderboard.length === 0) {
                console.log('No results with criteria signature, trying without it');
                leaderboardResponse = await fetch(`/api/hackathons/${selectedHackathonId}/leaderboard`);
                console.log('Leaderboard response without signature, status:', leaderboardResponse.status);
              } else {
                // Use the results from the signature query
                leaderboardResponse = { 
                  ok: true, 
                  json: () => Promise.resolve(signatureResult),
                  status: leaderboardResponse.status
                };
              }
              
              if (leaderboardResponse.ok) {
                const leaderboardResult = await leaderboardResponse.json();
                console.log('Leaderboard result:', leaderboardResult);
                
                if (leaderboardResult.leaderboard && leaderboardResult.leaderboard.length > 0) {
                  console.log('Found leaderboard data:', leaderboardResult.leaderboard.length, 'entries');
                  leaderboardData = leaderboardResult.leaderboard;
                  
                  // Check if all teams have been evaluated based on the status info
                  if (leaderboardResult.complete === true) {
                    allComplete = true;
                    console.log('All evaluations complete according to server!');
                  } else if (leaderboardResult.status) {
                    // Log status counts
                    console.log('Evaluation status:', leaderboardResult.status);
                    console.log(`Teams: Success=${leaderboardResult.status.success}, ` +
                                `Pending=${leaderboardResult.status.pending}, ` +
                                `Processing=${leaderboardResult.status.processing}`);
                    
                    if (leaderboardResult.status.pending === 0 && 
                        leaderboardResult.status.processing === 0) {
                      allComplete = true;
                      console.log('No pending or processing evaluations, marking as complete!');
                    } else {
                      // If still processing, log the wait message
                      console.log(`Waiting for ${leaderboardResult.status.pending + leaderboardResult.status.processing} evaluations to complete...`);
                      
                      // Check if all teams have been evaluated (as a backup)
                      const evaluatedTeams = new Set(leaderboardData.map(entry => entry.team_name));
                      const pendingTeams = teamsToEvaluate.filter(team => !evaluatedTeams.has(team));
                      
                      if (pendingTeams.length === 0 || evaluatedTeams.size >= teamsToEvaluate.length) {
                        // All teams evaluated or we have at least as many results as teams
                        allComplete = true;
                        console.log('All expected teams are in the leaderboard!');
                      } else {
                        console.log(`Waiting for ${pendingTeams.length} more evaluations...`);
                        
                        // Check if we've been waiting for too long (> 3 polling cycles)
                        if (pollCount >= 3) {
                          console.warn('Evaluations taking too long, attempting to force completion...');
                          
                          // Try to fix each pending team
                          for (const pendingTeam of pendingTeams) {
                            console.log(`Retrying evaluation for team: ${pendingTeam}...`);
                            
                            try {
                              // Make a new request to force the evaluation
                              await fetch(`/api/hackathons/${selectedHackathonId}/team_evaluations/generate`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  team_name: pendingTeam,
                                  criteria_ids: criteriaIds,
                                  criteria_signature: criteriaSignature,
                                  force_new: "true" // Force a new evaluation
                                }),
                              });
                            } catch (err) {
                              console.error(`Error retrying evaluation for ${pendingTeam}:`, err);
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Error during polling:', error);
            }
            
            // Schedule next poll
            setTimeout(pollForResults, 1000);
          };
          
          // Always start fresh polling with our criteria signature
          console.log('Starting polling for evaluation results with current criteria...');
          pollForResults();
        } catch (error) {
          console.error('Error during evaluation process:', error);
          setResults({ error: error.message || "An error occurred during the evaluation process" });
        }
      } else {
        // No hackathon ID, show error
        setResults({ 
          error: 'No hackathon selected. Please select a hackathon and try again.' 
        });
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error during evaluation process:', error);
      setResults({ error: error.message || "An error occurred during the evaluation process" });
      setIsLoading(false);
    }
  };

  const handleViewBlogs = () => {
    // Pass the hackathon ID to the team blogs page if available
    if (selectedHackathonId) {
      navigate(`/team-blogs?hackathonId=${selectedHackathonId}`);
    } else {
      navigate('/team-blogs');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Judgement Criteria</h1>
      {selectedHackathon && (
        <p className="text-purple-600 font-medium mb-6">
          Evaluating: {selectedHackathon.name}
        </p>
      )}
      
      {/* Filter input with add button */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Add custom filter criteria..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pr-10"
          />
        </div>
        <Button 
          onClick={() => addFilter(inputValue)}
          variant="outline"
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Selected filters with weightage */}
      {filters.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm text-gray-600 mb-2">Selected Filters:</h2>
          <div className="flex flex-col gap-2">
            {filters.map((filter, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg"
              >
                <span className="flex-1">{filter.name}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={filter.weightage}
                    onChange={(e) => updateWeightage(filter.name, e.target.value)}
                    className="w-20 h-8 text-sm"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm">%</span>
                  <button
                    onClick={() => removeFilter(filter.name)}
                    className="hover:text-purple-900 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested filters */}
      <div>
        <h2 className="text-sm text-gray-600 mb-2">Suggested Filters:</h2>
        <div className="flex flex-wrap gap-2">
          {suggestedFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => addFilter(filter)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors"
              disabled={filters.some(f => f.name === filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Proceed button - Made more prominent */}
      {filters.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={handleProceed} 
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
          >
            Proceed to Judge
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      {/* 
        Loading Dialog - Only shown during loading or transition states 
        Stays visible while transitioning to results
      */}
      <Dialog 
        open={transitionState === 'loading' || transitionState === 'transition'}
        onOpenChange={(open) => {
          if (!open && transitionState !== 'results') {
            setIsLoading(false);
            setTransitionState('idle');
          }
        }}
      >
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6 bg-white rounded-lg">
          <DialogTitle className="sr-only">Loading</DialogTitle>
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader className="h-10 w-10 text-purple-600 animate-spin" />
              </div>
              <Progress 
                className="h-4 w-full absolute bottom-0 bg-purple-100" 
                value={transitionState === 'transition' ? 100 : 66} 
              />
            </div>
            <p className="text-center text-lg font-medium mt-4">
              {transitionState === 'transition' ? 'Preparing Results...' : 'Evaluating Teams...'}
            </p>
            <p className="text-center text-gray-500">
              {transitionState === 'transition' 
                ? 'Almost there! Finalizing the leaderboard...'
                : 'Our AI is carefully reviewing each team\'s submission.'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Results Dialog - Only shown in results state */}
      <Dialog 
        open={transitionState === 'results' && results !== null} 
        onOpenChange={(open) => {
          if (!open) {
            // When results dialog is closed, reset everything
            setResults(null);
            setTransitionState('idle');
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="text-xl font-bold text-center mb-4">
            {results?.error ? "Evaluation Results (Partial)" : "Top Teams"}
          </DialogTitle>
          
          {results?.error && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
              <p>{results.error}</p>
            </div>
          )}
          
          {results?.leaderboard && results.leaderboard.length > 0 ? (
            <div className="space-y-6">
              {/* Top three teams with medals */}
              <div className="flex justify-evenly items-end">
                {results.leaderboard.slice(0, 3).map((team, index) => {
                  const position = index + 1;
                  const height = position === 1 ? 'h-32' : position === 2 ? 'h-24' : 'h-20';
                  const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : '🥉';
                  
                  return (
                    <div key={team.team_name} className="flex flex-col items-center">
                      <div className="text-3xl mb-2">{medal}</div>
                      <div className={`${height} w-24 bg-purple-600 rounded-t-lg flex items-center justify-center`}>
                        <span className="text-white font-bold">{team.total_score}</span>
                      </div>
                      <div className="bg-purple-100 w-24 p-2 text-center rounded-b-lg">
                        <div className="font-medium truncate">{team.team_name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Full list */}
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Complete Rankings</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-auto">
                  <table className="w-full">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">Team</th>
                        <th className="px-3 py-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.leaderboard.map((team) => (
                        <tr key={team.team_name} className="hover:bg-gray-100">
                          <td className="px-3 py-2 text-left">{team.rank}</td>
                          <td className="px-3 py-2 text-left font-medium">{team.team_name}</td>
                          <td className="px-3 py-2 text-right">{team.total_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <Button
                  onClick={handleViewBlogs}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View Team Blogs
                </Button>
                <Button
                  onClick={() => setResults(null)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No team evaluation results available yet.</p>
              <Button 
                onClick={() => setResults(null)} 
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JudgementCriteria;