import React, { useState } from 'react';
import { useTeamBlogs, useTeamBlog, useTeamBlogMarkdown, useGenerateTeamBlog } from '@/hooks/use-data';
import { useQueryClient } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { BookOpen, BookText, RefreshCw, AlertCircle, ChevronLeft, PenTool } from 'lucide-react';
import { parse } from 'marked';
import { useHackathonContext } from '@/contexts/HackathonContext';

const TeamBlogs = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { selectedHackathonId } = useHackathonContext();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  // Fetch team blogs data
  const teamBlogs = useTeamBlogs(selectedHackathonId);
  const teamBlog = useTeamBlog(selectedTeam || '', selectedHackathonId);
  const teamBlogMarkdown = useTeamBlogMarkdown(selectedTeam || '', selectedHackathonId);
  
  // Mutation for generating blogs
  const generateTeamBlog = useGenerateTeamBlog(queryClient);
  
  // Loading and error states
  const isLoading = teamBlogs.isLoading;
  const isBlogLoading = teamBlog.isLoading || teamBlogMarkdown.isLoading;
  const isGenerating = generateTeamBlog.isPending;
  const hasError = teamBlogs.isError;
  
  const handleGenerateBlog = (teamName: string) => {
    generateTeamBlog.mutate({ 
      teamName, 
      hackathonId: selectedHackathonId 
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/leaderboard${selectedHackathonId ? `/${selectedHackathonId}` : ''}`} 
                className="flex items-center text-purple-600 hover:text-purple-700"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Back to Leaderboard</span>
              </Link>
            </div>
            <h1 className="text-2xl font-bold">Team Blogs</h1>
          </div>
          
          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load team blogs. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="bg-white">
                  <CardHeader className="pb-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : !teamBlogs.data || !Array.isArray(teamBlogs.data) || teamBlogs.data.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium mb-2">No Team Blogs Available</h3>
              <p className="text-gray-500 mb-6">
                Start evaluating teams to generate blogs for them
              </p>
              <Button asChild>
                <Link to={`/leaderboard${selectedHackathonId ? `/${selectedHackathonId}` : ''}`}>
                  View Leaderboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(teamBlogs.data) && teamBlogs.data.map((blog: any) => (
                <Card key={blog.id} className={`${selectedTeam === blog.team_name ? 'border-purple-400 ring-1 ring-purple-400' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle>{blog.team_name}</CardTitle>
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
                    </div>
                    <CardDescription>
                      {blog.created_at ? `Generated on ${new Date(blog.created_at).toLocaleDateString()}` : 'Not yet generated'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-gray-600 line-clamp-3">
                      {blog.content 
                        ? (typeof blog.content === 'string' 
                            ? blog.content.substring(0, 120) + '...'
                            : 'Content available') 
                        : 'No content available'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant={selectedTeam === blog.team_name ? "default" : "outline"}
                      onClick={() => setSelectedTeam(blog.team_name)}
                    >
                      <BookText className="h-4 w-4 mr-2" />
                      Read Blog
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isGenerating}
                      onClick={() => handleGenerateBlog(blog.team_name)}
                    >
                      <RefreshCw className={`h-4 w-4 ${isGenerating && 'animate-spin'}`} />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {selectedTeam && (
            <div className="mt-8">
              <Card className="bg-white">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{selectedTeam} Blog</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTeam(null)}
                    >
                      Close
                    </Button>
                  </div>
                  {teamBlog.data && teamBlog.data.created_at && (
                    <CardDescription>
                      Generated: {new Date(teamBlog.data.created_at).toLocaleString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {isBlogLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : teamBlog.data ? (
                    <div className="prose max-w-none">
                      {teamBlogMarkdown.data ? (
                        <div dangerouslySetInnerHTML={{ __html: parse(teamBlogMarkdown.data) }} />
                      ) : teamBlog.data.content ? (
                        <pre className="whitespace-pre-wrap">{teamBlog.data.content}</pre>
                      ) : (
                        <p className="text-gray-500 italic">No blog content available</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <PenTool className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                      <h3 className="text-lg font-medium mb-2">No Blog Available</h3>
                      <p className="text-gray-600 mb-4">
                        Generate a blog for this team to see their content.
                      </p>
                      <Button 
                        onClick={() => handleGenerateBlog(selectedTeam)}
                        disabled={isGenerating}
                      >
                        {isGenerating ? 'Generating...' : 'Generate Blog'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamBlogs;