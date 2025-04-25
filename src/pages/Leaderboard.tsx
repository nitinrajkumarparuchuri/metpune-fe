import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader } from 'lucide-react';
import { useHackathonContext } from '@/contexts/HackathonContext';

const Leaderboard = () => {
  const navigate = useNavigate();
  const { selectedHackathonId, selectedHackathon } = useHackathonContext();
  const [searchParams] = useSearchParams();
  const criteriaSignature = searchParams.get('criteria_signature');
  
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        // First try with criteria signature if available
        const hackathonId = selectedHackathonId;
        let url = `/api/hackathons/${hackathonId}/leaderboard`;
        
        if (criteriaSignature) {
          url += `?criteria_signature=${encodeURIComponent(criteriaSignature)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        
        if (data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboardData(data.leaderboard);
        } else {
          // If no results with criteria signature, try without it
          if (criteriaSignature) {
            const fallbackResponse = await fetch(`/api/hackathons/${hackathonId}/leaderboard`);
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              
              if (fallbackData.leaderboard && fallbackData.leaderboard.length > 0) {
                setLeaderboardData(fallbackData.leaderboard);
              } else {
                setError('No evaluation results available yet.');
              }
            } else {
              setError('Failed to fetch leaderboard data.');
            }
          } else {
            setError('No evaluation results available yet.');
          }
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('An error occurred while fetching the leaderboard.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (selectedHackathonId) {
      fetchLeaderboard();
    }
  }, [selectedHackathonId, criteriaSignature]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader className="h-10 w-10 text-purple-600 animate-spin mb-4" />
        <p className="text-center text-lg font-medium">Loading leaderboard...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Hackathon Leaderboard</h1>
      {selectedHackathon && (
        <p className="text-purple-600 font-medium mb-6">
          {selectedHackathon.name}
        </p>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          {criteriaSignature && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">
                Showing results for criteria set: {criteriaSignature.split('|').join(', ')}
              </p>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => {
            // Navigate to team blogs
            navigate(`/team-blogs${selectedHackathonId ? `/${selectedHackathonId}` : ''}`);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
        >
          View Team Blogs
        </Button>
      </div>
      
      {error ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 mb-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top three teams with medals */}
          {leaderboardData.length > 0 && (
            <div className="flex justify-evenly items-end">
              {leaderboardData.slice(0, 3).map((team, index) => {
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
          )}
          
          {/* Full list */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Complete Rankings</h3>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Rank</th>
                    <th className="px-4 py-3 text-left">Team</th>
                    <th className="px-4 py-3 text-right">Score</th>
                    <th className="px-4 py-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboardData.map((team) => (
                    <tr key={team.team_name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-left">{team.rank}</td>
                      <td className="px-4 py-3 text-left font-medium">{team.team_name}</td>
                      <td className="px-4 py-3 text-right">{team.total_score}</td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setSelectedTeam(team)}
                          className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-1 px-3 rounded"
                        >
                          View Score
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Team Evaluation Details Dialog */}
      <Dialog 
        open={selectedTeam !== null} 
        onOpenChange={(open) => {
          if (!open) setSelectedTeam(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogTitle className="text-xl font-bold text-center mb-4">
            {selectedTeam?.team_name} Evaluation
          </DialogTitle>
          
          {selectedTeam && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                <span className="font-semibold">Overall Score:</span>
                <span className="text-xl font-bold text-purple-700">{selectedTeam.total_score}</span>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Individual Criteria Scores:</h3>
                <div className="space-y-3">
                  {selectedTeam.scores && Object.entries(selectedTeam.scores).map(([criterion, data]: [string, any]) => (
                    <div key={criterion} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{criterion}</span>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Weight: {Math.round(data.weight * 100)}%</span>
                          <span className="font-semibold">{data.score}/5.0</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-200 rounded-full">
                        <div 
                          className="absolute h-2 bg-purple-500 rounded-full" 
                          style={{ width: `${(data.score / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm mt-2 text-gray-700">{data.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button
                onClick={() => setSelectedTeam(null)}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
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

export default Leaderboard;