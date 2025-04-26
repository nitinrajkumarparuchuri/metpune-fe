import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import HackathonSelector from '@/components/HackathonSelector';
import { 
  BarChart3, 
  PieChart, 
  Users, 
  Award, 
  LightbulbIcon, 
  RefreshCw,
  Search,
  ArrowUp,
  ArrowDown,
  FileText,
  Clipboard,
  GraduationCap,
  Layers,
  Filter
} from 'lucide-react';
import { useTeamSummaries, useTeamEvaluations, useHackathonInsights, useHackathons, useSubmissions } from '@/hooks/use-data';
import { useHackathonContext } from '@/contexts/HackathonContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const Dashboard = () => {
  // State for filters and views
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');
  const [activeTab, setActiveTab] = useState('overview');
  
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
        setViewMode('single');
      }
    }
  }, [urlHackathonId, selectedHackathonId, setSelectedHackathonId]);
  
  // Handle hackathon change
  const handleHackathonChange = (hackathonId: number) => {
    setSelectedHackathonId(hackathonId);
    setViewMode('single');
    navigate(`/dashboard/${hackathonId}`);
  };
  
  // Fetch hackathons
  const { data: hackathons, isLoading: isHackathonsLoading } = useHackathons();
  
  // Fetch data for selected hackathon if in single view
  const teamSummaries = useTeamSummaries(viewMode === 'single' ? selectedHackathonId : undefined);
  const teamEvaluations = useTeamEvaluations(viewMode === 'single' ? selectedHackathonId : undefined);
  const hackathonInsights = useHackathonInsights(viewMode === 'single' ? selectedHackathonId : undefined);
  const { data: submissions, isLoading: isSubmissionsLoading } = useSubmissions(viewMode === 'single' ? selectedHackathonId : undefined);
  
  // Loading state
  const isLoading = 
    isHackathonsLoading || 
    (viewMode === 'single' && (
      teamSummaries.isLoading || 
      teamEvaluations.isLoading || 
      hackathonInsights.isLoading ||
      isSubmissionsLoading
    ));
  
  // Error state
  const hasError = 
    (viewMode === 'single' && (
      teamSummaries.isError || 
      teamEvaluations.isError || 
      hackathonInsights.isError
    ));
  const errorMessage = 
    (viewMode === 'single' && (
      (teamSummaries.error as Error)?.message || 
      (teamEvaluations.error as Error)?.message || 
      (hackathonInsights.error as Error)?.message
    )) ||
    'An error occurred while fetching data';

  // Calculate aggregated stats for all hackathons or a single hackathon
  const calculateStats = () => {
    if (viewMode === 'all') {
      // For all hackathons view, we would ideally fetch aggregated data from the API
      // For now, we'll use dummy data that would simulate what we'd get
      return {
        totalHackathons: hackathons?.length || 0,
        totalTeams: 42, // This would ideally come from an API call
        totalEvaluations: 35, // This would ideally come from an API call
        totalInsights: 18, // This would ideally come from an API call
        completionRate: 83, // Percentage of teams with evaluations
        activeHackathons: hackathons?.filter(h => h.status === 'active').length || 0,
        upcomingHackathons: hackathons?.filter(h => h.status === 'upcoming').length || 0,
        completedHackathons: hackathons?.filter(h => h.status === 'completed').length || 0
      };
    } else {
      // For single hackathon view
      // Calculate team count from either team summaries or submissions
      const teamCount = teamSummaries.data?.length || 
        (submissions && Array.isArray(submissions) ? new Set(submissions.map(s => s.team_name)).size : 0);
        
      const evaluationCount = Array.isArray(teamEvaluations.data) ? teamEvaluations.data.length : 0;
      
      return {
        totalHackathons: 1,
        totalTeams: teamCount,
        totalEvaluations: evaluationCount,
        totalInsights: hackathonInsights.data?.length || 0,
        completionRate: teamCount > 0 ? Math.round((evaluationCount / teamCount) * 100) : 0,
        activeHackathons: 1,
        upcomingHackathons: 0,
        completedHackathons: 0
      };
    }
  };
  
  const stats = calculateStats();
  
  // Find the currently selected hackathon (if applicable)
  const currentHackathon = selectedHackathonId && hackathons 
    ? hackathons.find(h => h.id === selectedHackathonId) 
    : undefined;
  
  // Filter team summaries based on search term and status (if applicable)
  const filteredTeamSummaries = viewMode === 'single' && teamSummaries.data 
    ? teamSummaries.data.filter(summary => {
        const matchesSearch = searchTerm === '' || 
          summary.team_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || summary.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold">Hackathon Dashboard</h1>
              <p className="text-gray-600">
                {viewMode === 'all' 
                  ? 'Overview of all hackathons' 
                  : `Viewing ${currentHackathon?.name || 'hackathon'} details`}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-4 md:mt-0">
              <HackathonSelector
                selectedHackathonId={selectedHackathonId}
                onHackathonChange={handleHackathonChange}
                className="w-full md:w-56"
              />
              
              <Button
                variant={viewMode === 'all' ? "default" : "outline"}
                className="mt-2 md:mt-0"
                onClick={() => {
                  setViewMode('all');
                  navigate('/dashboard');
                }}
              >
                <Layers className="mr-2 h-4 w-4" />
                All Hackathons
              </Button>
            </div>
          </div>

          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Dashboard Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <div className="border-b">
              <TabsList className="bg-transparent -mb-px">
                <TabsTrigger value="overview" className="rounded-t-md mr-2">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Overview
                </TabsTrigger>
                
                {viewMode === 'single' && (
                  <>
                    <TabsTrigger value="teams" className="rounded-t-md mr-2">
                      <Users className="mr-2 h-4 w-4" />
                      Teams
                    </TabsTrigger>
                    
                    <TabsTrigger value="evaluations" className="rounded-t-md mr-2">
                      <Award className="mr-2 h-4 w-4" />
                      Evaluations
                    </TabsTrigger>
                    
                    <TabsTrigger value="insights" className="rounded-t-md">
                      <LightbulbIcon className="mr-2 h-4 w-4" />
                      Insights
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>
            
            {/* Overview Tab Content */}
            <TabsContent value="overview" className="mt-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Layers className="mr-2 h-5 w-5 text-blue-600" />
                      Hackathons
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-10 w-1/2" />
                    ) : (
                      <div className="flex items-end space-x-1">
                        <span className="text-3xl font-bold">{stats.totalHackathons}</span>
                        <span className="text-gray-500 text-sm pb-1">total</span>
                      </div>
                    )}
                    {!isLoading && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-green-50">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
                          {stats.activeHackathons} active
                        </Badge>
                        <Badge variant="outline" className="bg-amber-50">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mr-1"></div>
                          {stats.upcomingHackathons} upcoming
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                          {stats.completedHackathons} completed
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Users className="mr-2 h-5 w-5 text-indigo-600" />
                      Teams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-10 w-1/2" />
                    ) : (
                      <div className="flex items-end space-x-1">
                        <span className="text-3xl font-bold">{stats.totalTeams}</span>
                        <span className="text-gray-500 text-sm pb-1">participating</span>
                      </div>
                    )}
                    {!isLoading && viewMode === 'single' && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-indigo-600 h-2.5 rounded-full" 
                            style={{ width: `${stats.totalTeams ? 100 : 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {stats.totalTeams} teams with submissions
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Award className="mr-2 h-5 w-5 text-purple-600" />
                      Evaluations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-10 w-1/2" />
                    ) : (
                      <div className="flex items-baseline space-x-4">
                        <span className="text-3xl font-bold">{stats.totalEvaluations}</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${stats.completionRate >= 80 ? 'text-green-600' : 'text-amber-600'}`}>
                            {stats.completionRate}%
                          </span>
                          {stats.completionRate >= 80 ? (
                            <ArrowUp className="ml-1 h-3 w-3 text-green-600" />
                          ) : (
                            <ArrowDown className="ml-1 h-3 w-3 text-amber-600" />
                          )}
                        </div>
                      </div>
                    )}
                    {!isLoading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${stats.completionRate >= 80 ? 'bg-purple-600' : 'bg-amber-500'}`}
                            style={{ width: `${stats.completionRate}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {stats.totalEvaluations} of {stats.totalTeams} teams evaluated
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <LightbulbIcon className="mr-2 h-5 w-5 text-amber-600" />
                      Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-10 w-1/2" />
                    ) : (
                      <div className="flex items-end space-x-1">
                        <span className="text-3xl font-bold">{stats.totalInsights}</span>
                        <span className="text-gray-500 text-sm pb-1">generated</span>
                      </div>
                    )}
                    {!isLoading && viewMode === 'single' && stats.totalInsights > 0 && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-amber-600"
                        onClick={() => navigate(`/insights${selectedHackathonId ? `/${selectedHackathonId}` : ''}`)}
                      >
                        View insights
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Hackathon Overview Cards */}
              {viewMode === 'all' && !isLoading && hackathons && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Active Hackathons */}
                  <Card className="bg-green-50 border-green-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-green-800">Active Hackathons</CardTitle>
                      <CardDescription className="text-green-700">
                        Currently running events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {hackathons.filter(h => h.status === 'active').length === 0 ? (
                        <p className="text-sm text-gray-500">No active hackathons</p>
                      ) : (
                        hackathons
                          .filter(h => h.status === 'active')
                          .map(hackathon => (
                            <div 
                              key={hackathon.id} 
                              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleHackathonChange(hackathon.id)}
                            >
                              <h3 className="font-medium">{hackathon.name}</h3>
                              {hackathon.start_date && hackathon.end_date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                                </p>
                              )}
                              <Badge className="mt-2 bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>
                            </div>
                          ))
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Upcoming Hackathons */}
                  <Card className="bg-amber-50 border-amber-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-amber-800">Upcoming Hackathons</CardTitle>
                      <CardDescription className="text-amber-700">
                        Planned future events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {hackathons.filter(h => h.status === 'upcoming').length === 0 ? (
                        <p className="text-sm text-gray-500">No upcoming hackathons</p>
                      ) : (
                        hackathons
                          .filter(h => h.status === 'upcoming')
                          .map(hackathon => (
                            <div 
                              key={hackathon.id} 
                              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleHackathonChange(hackathon.id)}
                            >
                              <h3 className="font-medium">{hackathon.name}</h3>
                              {hackathon.start_date && hackathon.end_date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                                </p>
                              )}
                              <Badge className="mt-2 bg-amber-100 text-amber-800 hover:bg-amber-200">Upcoming</Badge>
                            </div>
                          ))
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Completed Hackathons */}
                  <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-blue-800">Completed Hackathons</CardTitle>
                      <CardDescription className="text-blue-700">
                        Past events with results
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {hackathons.filter(h => h.status === 'completed').length === 0 ? (
                        <p className="text-sm text-gray-500">No completed hackathons</p>
                      ) : (
                        hackathons
                          .filter(h => h.status === 'completed')
                          .map(hackathon => (
                            <div 
                              key={hackathon.id} 
                              className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => handleHackathonChange(hackathon.id)}
                            >
                              <h3 className="font-medium">{hackathon.name}</h3>
                              {hackathon.start_date && hackathon.end_date && (
                                <p className="text-xs text-gray-500">
                                  {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                                </p>
                              )}
                              <Badge className="mt-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>
                            </div>
                          ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Single Hackathon Overview */}
              {viewMode === 'single' && currentHackathon && !isLoading && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{currentHackathon.name}</CardTitle>
                      <CardDescription>
                        {currentHackathon.start_date && currentHackathon.end_date ? (
                          `${new Date(currentHackathon.start_date).toLocaleDateString()} - ${new Date(currentHackathon.end_date).toLocaleDateString()}`
                        ) : 'Dates TBD'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-indigo-600 mr-2" />
                          <span>{stats.totalTeams} Teams</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-600 mr-2" />
                          <span>{submissions?.length || 0} Submissions</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-4 w-4 text-purple-600 mr-2" />
                          <span>{stats.totalEvaluations} Evaluations</span>
                        </div>
                        <div className="flex items-center">
                          <LightbulbIcon className="h-4 w-4 text-amber-600 mr-2" />
                          <span>{stats.totalInsights} Insights</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center"
                          onClick={() => setActiveTab('teams')}
                        >
                          <Users className="h-8 w-8 text-indigo-600 mb-2" />
                          <span className="font-medium">View Teams</span>
                          <span className="text-xs text-gray-500 mt-1">Team data and details</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center"
                          onClick={() => setActiveTab('evaluations')}
                        >
                          <Award className="h-8 w-8 text-purple-600 mb-2" />
                          <span className="font-medium">View Evaluations</span>
                          <span className="text-xs text-gray-500 mt-1">Team scores and feedback</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-auto py-4 flex flex-col items-center justify-center"
                          onClick={() => navigate(`/insights${selectedHackathonId ? `/${selectedHackathonId}` : ''}`)}
                        >
                          <LightbulbIcon className="h-8 w-8 text-amber-600 mb-2" />
                          <span className="font-medium">View Insights</span>
                          <span className="text-xs text-gray-500 mt-1">AI-generated analysis</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            {/* Teams Tab Content */}
            <TabsContent value="teams" className="mt-6">
              {viewMode === 'single' && (
                <div className="space-y-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="w-full md:w-40">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Status" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Team List */}
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/5" />
                              <Skeleton className="h-4 w-1/5" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : filteredTeamSummaries.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center mb-4">
                        <Clipboard className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium">No teams found</h3>
                      <p className="text-gray-500 mt-1">
                        {teamSummaries.data?.length ? 'Try adjusting your search or filters' : 'No team data available'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTeamSummaries.map(summary => (
                        <Card key={summary.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-start">
                              <div className="p-6 flex-1">
                                <h3 className="text-lg font-medium">{summary.team_name}</h3>
                                <div className="flex items-center mt-1">
                                  <Badge className={`${
                                    summary.status === 'success' ? 'bg-green-100 text-green-800' :
                                    summary.status === 'processing' ? 'bg-amber-100 text-amber-800' :
                                    summary.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {summary.status.charAt(0).toUpperCase() + summary.status.slice(1)}
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-2">
                                    Generated: {new Date(summary.generated_at).toLocaleString()}
                                  </span>
                                </div>
                                
                                {summary.markdown_summary ? (
                                  <div className="mt-4 text-sm text-gray-700">
                                    <p>{summary.markdown_summary.substring(0, 150)}...</p>
                                  </div>
                                ) : (
                                  <div className="mt-4 text-sm text-gray-700">
                                    <p>{summary.summary.substring(0, 150)}...</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="w-full md:w-44 bg-gray-50 p-6 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start border-t md:border-t-0 md:border-l border-gray-100">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => navigate(`/team/${summary.team_name}/${selectedHackathonId}`)}
                                >
                                  View Details
                                </Button>
                                
                                {/* Evaluation status */}
                                {teamEvaluations.data?.some(e => e.team_name === summary.team_name) ? (
                                  <div className="flex items-center mt-0 md:mt-4 text-green-600">
                                    <div className="h-2 w-2 rounded-full bg-green-600 mr-1"></div>
                                    <span className="text-xs">Evaluated</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center mt-0 md:mt-4 text-gray-400">
                                    <div className="h-2 w-2 rounded-full bg-gray-300 mr-1"></div>
                                    <span className="text-xs">Not Evaluated</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Evaluations Tab Content */}
            <TabsContent value="evaluations" className="mt-6">
              {viewMode === 'single' && (
                <div className="space-y-6">
                  {/* Header with stats */}
                  <Card className="bg-purple-50 border-purple-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="text-lg font-medium">Team Evaluations</h3>
                          <p className="text-gray-600">AI-powered evaluation results for all teams</p>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center">
                          <div className="bg-white px-4 py-2 rounded-lg border border-purple-200 flex items-center">
                            <div>
                              <span className="text-sm text-gray-600">Completion</span>
                              <div className="flex items-center">
                                <span className="text-xl font-bold mr-2">{stats.completionRate}%</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ width: `${stats.completionRate}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            className="ml-4 bg-purple-600 hover:bg-purple-700"
                            onClick={() => navigate(`/leaderboard/${selectedHackathonId}`)}
                          >
                            <Trophy className="mr-2 h-4 w-4" />
                            View Leaderboard
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Evaluations list */}
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-1/5" />
                              <Skeleton className="h-6 w-1/5" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : !teamEvaluations.data || teamEvaluations.data.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center mb-4">
                        <Award className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium">No evaluations found</h3>
                      <p className="text-gray-500 mt-1 mb-4">
                        Teams need to be evaluated to see results here
                      </p>
                      <Button 
                        onClick={() => navigate(`/hackathons`)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Set Up Evaluation
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {teamEvaluations.data.map((evaluation, i) => (
                        <Card key={i}>
                          <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row items-start">
                              <div className="p-6 flex-1">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-medium">{evaluation.team_name}</h3>
                                  <div className="flex items-center">
                                    <span className="text-2xl font-bold text-purple-600">{evaluation.total_score}</span>
                                    <span className="text-sm text-gray-500">/5.0</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center mt-1">
                                  <Badge className="bg-green-100 text-green-800">
                                    Evaluated
                                  </Badge>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(evaluation.generated_at).toLocaleString()}
                                  </span>
                                </div>
                                
                                {/* Score breakdown */}
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {evaluation.scores && Object.entries(evaluation.scores).map(([criterion, data]: [string, any], i) => (
                                    <div key={i} className="text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">{criterion}</span>
                                        <span className="font-medium">{data.score}/5.0</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div 
                                          className="bg-purple-600 h-1.5 rounded-full" 
                                          style={{ width: `${(data.score / 5) * 100}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="w-full md:w-44 bg-gray-50 p-6 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-start border-t md:border-t-0 md:border-l border-gray-100">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                                  onClick={() => navigate(`/team/${evaluation.team_name}/${selectedHackathonId}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            {/* Insights Tab Content */}
            <TabsContent value="insights" className="mt-6">
              {viewMode === 'single' && (
                <div className="space-y-6">
                  {/* Header */}
                  <Card className="bg-amber-50 border-amber-100">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                          <h3 className="text-lg font-medium">Hackathon Insights</h3>
                          <p className="text-gray-600">AI-generated analysis and trends</p>
                        </div>
                        
                        <Button 
                          className="mt-4 md:mt-0 bg-amber-600 hover:bg-amber-700"
                          onClick={() => navigate(`/insights/${selectedHackathonId}`)}
                        >
                          <LightbulbIcon className="mr-2 h-4 w-4" />
                          View Full Insights
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Insights previews */}
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <Skeleton className="h-6 w-1/3 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-3/4" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : !hackathonInsights.data || hackathonInsights.data.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-3 inline-flex items-center justify-center mb-4">
                        <LightbulbIcon className="h-6 w-6 text-gray-500" />
                      </div>
                      <h3 className="text-lg font-medium">No insights found</h3>
                      <p className="text-gray-500 mt-1 mb-4">
                        Insights need to be generated to see results here
                      </p>
                      <Button 
                        onClick={() => navigate(`/insights/${selectedHackathonId}`)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        <LightbulbIcon className="mr-2 h-4 w-4" />
                        Generate Insights
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hackathonInsights.data.slice(0, 3).map((insight, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-medium mb-2">{insight.title}</h3>
                            <p className="text-gray-700">
                              {insight.markdown_content 
                                ? insight.markdown_content.substring(0, 200) 
                                : insight.content.substring(0, 200)}...
                            </p>
                            <div className="mt-4 flex justify-end">
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-amber-600"
                                onClick={() => navigate(`/insights/${selectedHackathonId}`)}
                              >
                                Read more
                                <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {hackathonInsights.data.length > 3 && (
                        <div className="text-center">
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/insights/${selectedHackathonId}`)}
                          >
                            View all {hackathonInsights.data.length} insights
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;