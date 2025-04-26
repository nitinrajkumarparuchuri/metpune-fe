import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FilePlus2, 
  BarChart3, 
  Award, 
  Trophy, 
  FileText, 
  Newspaper,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import Header from '@/components/Header';
import { useHackathonContext } from '@/contexts/HackathonContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const navigate = useNavigate();
  const { selectedHackathon, selectedHackathonId, isLoading } = useHackathonContext();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Hackathon AI Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Generate insights, evaluate projects, and manage all your hackathon needs in one place.
            </p>
            
            {!selectedHackathonId && !isLoading && (
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={() => navigate('/hackathons')}
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <PlusCircle className="h-5 w-5" />
                  Create Your First Hackathon
                </Button>
              </div>
            )}
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="pb-6">
                    <Skeleton className="h-24 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {/* Main actions grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Manage Hackathons */}
              <Card className="border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                    <FilePlus2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle>Manage Hackathons</CardTitle>
                  <CardDescription>Create, view and manage your hackathons</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  {selectedHackathon ? (
                    <p>Currently selected: <span className="font-medium text-indigo-600">{selectedHackathon.name}</span></p>
                  ) : (
                    <p>No hackathon selected. Set up your first hackathon to get started.</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Link to="/hackathons">
                      <span className="flex items-center">
                        Manage Hackathons
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Dashboard */}
              <Card className="border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>View project submissions and team data</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>Monitor hackathon progress, team submissions, and project status.</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                    <Link to="/dashboard">
                      <span className="flex items-center">
                        View Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Evaluation */}
              <Card className="border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center mb-2">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle>Evaluation Criteria</CardTitle>
                  <CardDescription>Set up judging criteria for evaluations</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>Configure custom evaluation criteria and scoring weights.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={!selectedHackathonId}
                  >
                    <Link to={`/judgement-criteria${selectedHackathonId ? `/${selectedHackathonId}` : ''}`}>
                      <span className="flex items-center">
                        Manage Criteria
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Insights */}
              <Card className="border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle>Hackathon Insights</CardTitle>
                  <CardDescription>AI-generated insights about all projects</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>Get AI-powered analysis of trends, technologies, and themes across all projects.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={!selectedHackathonId}
                  >
                    <Link to={`/insights${selectedHackathonId ? `/${selectedHackathonId}` : ''}`}>
                      <span className="flex items-center">
                        View Insights
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Team Blogs */}
              <Card className="border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                    <Newspaper className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle>Team Blogs</CardTitle>
                  <CardDescription>AI-generated blog posts for each team</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>Generate professional blog posts summarizing each team's project and journey.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!selectedHackathonId}
                  >
                    <Link to={`/team-blogs${selectedHackathonId ? `/${selectedHackathonId}` : ''}`}>
                      <span className="flex items-center">
                        View Team Blogs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Leaderboard */}
              <Card className="border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                    <Trophy className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription>View team rankings and scores</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-gray-500">
                  <p>See the current standings, team scores, and evaluation breakdowns.</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    asChild 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={!selectedHackathonId}
                  >
                    <Link to={`/leaderboard${selectedHackathonId ? `/${selectedHackathonId}` : ''}`}>
                      <span className="flex items-center">
                        View Leaderboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          {/* Call to action */}
          {selectedHackathonId && !isLoading && (
            <div className="mt-16 text-center">
              <p className="text-gray-500 mb-4">Need to start a new hackathon?</p>
              <Button 
                onClick={() => navigate('/hackathons')}
                variant="outline" 
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Hackathon
              </Button>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Hackathon AI Evaluation System &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;