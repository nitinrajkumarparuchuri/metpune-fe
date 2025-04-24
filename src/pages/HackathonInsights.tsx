import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useHackathonInsights, 
  useHackathonInsightsMarkdown, 
  useGenerateHackathonInsights,
  useTeamBlogs,
  useTeamBlog,
  useTeamBlogMarkdown,
  useGenerateTeamBlog
} from '@/hooks/use-data';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  LightbulbIcon, 
  AlertCircle, 
  BookOpen, 
  Users, 
  PenTool,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { parse } from 'marked';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HackathonInsights = () => {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // Fetch insights data
  const insights = useHackathonInsights();
  const insightsMarkdown = useHackathonInsightsMarkdown();
  
  // Fetch team blogs data
  const teamBlogs = useTeamBlogs();
  const teamBlog = useTeamBlog(selectedTeam || '');
  const teamBlogMarkdown = useTeamBlogMarkdown(selectedTeam || '');
  
  // Mutations for generating content
  const generateInsights = useGenerateHackathonInsights(queryClient);
  const generateTeamBlog = useGenerateTeamBlog(queryClient);
  
  // Loading and error states
  const insightsLoading = insights.isLoading || insightsMarkdown.isLoading;
  const blogsLoading = teamBlogs.isLoading;
  const teamBlogLoading = teamBlog.isLoading || teamBlogMarkdown.isLoading;
  
  const insightsGenerating = generateInsights.isPending;
  const teamBlogGenerating = generateTeamBlog.isPending;
  
  const insightsError = insights.isError || insightsMarkdown.isError;
  const blogsError = teamBlogs.isError;
  
  // Handle generation of insights
  const handleGenerateInsights = () => {
    generateInsights.mutate();
  };
  
  // Handle generation of team blog
  const handleGenerateTeamBlog = (teamName: string) => {
    generateTeamBlog.mutate(teamName);
  };
  
  // Get the most recent insight
  const latestInsight = insights.data?.[0];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Hackathon Content Hub</h1>
          
          <Tabs defaultValue="insights" className="w-full mb-8">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="insights">
                <LightbulbIcon className="h-4 w-4 mr-2" />
                Hackathon Insights
              </TabsTrigger>
              <TabsTrigger value="blogs">
                <BookOpen className="h-4 w-4 mr-2" />
                Team Blogs
              </TabsTrigger>
            </TabsList>
            
            {/* INSIGHTS TAB */}
            <TabsContent value="insights" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Hackathon Insights</h2>
                <Button 
                  onClick={handleGenerateInsights}
                  disabled={insightsGenerating}
                >
                  {insightsGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Insights
                    </>
                  )}
                </Button>
              </div>
              
              {/* Error Alert */}
              {insightsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load hackathon insights. Please try again later.
                  </AlertDescription>
                </Alert>
              )}
              
              <Card className="p-6">
                {insightsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : latestInsight ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">{latestInsight.title}</h2>
                      <Badge 
                        className={
                          latestInsight.status === 'success' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }
                      >
                        {latestInsight.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Generated at: {new Date(latestInsight.generated_at).toLocaleString()}
                    </p>
                    <div 
                      className="prose max-w-none" 
                      dangerouslySetInnerHTML={{ 
                        __html: insightsMarkdown.data 
                          ? parse(insightsMarkdown.data) 
                          : `<p>${latestInsight.content}</p>` 
                      }} 
                    />
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <LightbulbIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
                    <p className="text-gray-600 mb-4">
                      Generate insights to see AI-powered analysis of your hackathon.
                    </p>
                    <Button 
                      onClick={handleGenerateInsights}
                      disabled={insightsGenerating}
                    >
                      {insightsGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Insights'
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            {/* BLOGS TAB */}
            <TabsContent value="blogs" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Team Blogs</h2>
              </div>
              
              {/* Error Alert */}
              {blogsError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    Failed to load team blogs. Please try again later.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Teams
                    </h3>
                    
                    {blogsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : teamBlogs.data?.length > 0 ? (
                      <div className="space-y-2">
                        {teamBlogs.data.map((blog: any) => (
                          <Button
                            key={blog.id}
                            variant={selectedTeam === blog.team_name ? "default" : "outline"}
                            className="w-full justify-between"
                            onClick={() => setSelectedTeam(blog.team_name)}
                          >
                            <span>{blog.team_name}</span>
                            <Badge 
                              className={
                                blog.status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : blog.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {blog.status}
                            </Badge>
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No team blogs available</p>
                      </div>
                    )}
                  </Card>
                </div>
                
                <div className="md:col-span-2">
                  <Card className="p-6">
                    {(!selectedTeam || teamBlogLoading) ? (
                      selectedTeam ? (
                        <div className="space-y-4">
                          <Skeleton className="h-8 w-1/3" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-xl font-medium mb-2">Select a Team</h3>
                          <p className="text-gray-500">
                            Choose a team from the list to view their blog
                          </p>
                        </div>
                      )
                    ) : teamBlog.data ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-xl font-semibold">{teamBlog.data.team_name} Blog</h2>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={
                                teamBlog.data.status === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }
                            >
                              {teamBlog.data.status}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleGenerateTeamBlog(teamBlog.data.team_name)}
                              disabled={teamBlogGenerating}
                            >
                              {teamBlogGenerating ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Generated at: {new Date(teamBlog.data.generated_at).toLocaleString()}
                        </p>
                        <div 
                          className="prose max-w-none" 
                          dangerouslySetInnerHTML={{ 
                            __html: teamBlogMarkdown.data 
                              ? parse(teamBlogMarkdown.data) 
                              : `<p>${teamBlog.data.content}</p>` 
                          }} 
                        />
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <PenTool className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                        <h3 className="text-lg font-medium mb-2">No Blog Available</h3>
                        <p className="text-gray-600 mb-4">
                          Generate a blog for this team to see AI-powered content.
                        </p>
                        <Button 
                          onClick={() => handleGenerateTeamBlog(selectedTeam)}
                          disabled={teamBlogGenerating}
                        >
                          {teamBlogGenerating ? 'Generating...' : 'Generate Blog'}
                        </Button>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HackathonInsights;