import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, BarChart, RefreshCw, CheckCircle } from 'lucide-react';
import { useTeamSummary, useTeamEvaluation, useGenerateTeamSummary, useGenerateTeamEvaluation } from '@/hooks/use-data';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { parse } from 'marked';

const TeamDetails = () => {
  const { teamName = '' } = useParams<{ teamName: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('summary');
  
  // Fetch team data
  const summary = useTeamSummary(teamName);
  const evaluation = useTeamEvaluation(teamName);
  
  // Mutations for generating data
  const generateSummary = useGenerateTeamSummary(queryClient);
  const generateEvaluation = useGenerateTeamEvaluation(queryClient);
  
  // Loading and error states
  const isLoading = summary.isLoading || evaluation.isLoading;
  const isGenerating = generateSummary.isPending || generateEvaluation.isPending;
  const hasError = summary.isError || evaluation.isError;
  
  // Handle generation of team summary
  const handleGenerateSummary = () => {
    generateSummary.mutate(teamName);
  };
  
  // Handle generation of team evaluation
  const handleGenerateEvaluation = () => {
    generateEvaluation.mutate(teamName);
  };
  
  // Status badges
  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'success': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">{decodeURIComponent(teamName)}</h1>
          </div>
          
          {/* Error Alert */}
          {hasError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load team data. Please try again later.
              </AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">
                <FileText className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="evaluation">
                <BarChart className="h-4 w-4 mr-2" />
                Evaluation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary">
              <Card className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : summary.data ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Team Summary</h2>
                      {getStatusBadge(summary.data.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Generated at: {new Date(summary.data.generated_at).toLocaleString()}
                    </p>
                    <div className="mt-4 prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: 
                        summary.data.markdown_summary 
                          ? parse(summary.data.markdown_summary) 
                          : `<p>${summary.data.summary}</p>` 
                      }} />
                    </div>
                    <Button 
                      className="mt-6"
                      onClick={handleGenerateSummary}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Summary
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Summary Available</h3>
                    <p className="text-gray-600 mb-4">
                      There's no summary for this team yet. Generate one now.
                    </p>
                    <Button onClick={handleGenerateSummary} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="evaluation">
              <Card className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ) : evaluation.data ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Team Evaluation</h2>
                      {getStatusBadge(evaluation.data.status)}
                    </div>
                    <div className="flex items-center mb-6">
                      <div className="text-3xl font-bold mr-4">
                        {evaluation.data.total_score}/100
                      </div>
                      <p className="text-sm text-gray-600">
                        Generated at: {new Date(evaluation.data.generated_at).toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Scores by criteria */}
                    <div className="space-y-4 mb-6">
                      <h3 className="text-lg font-medium">Scores by Criteria</h3>
                      {evaluation.data.scores?.map((score, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between mb-2">
                            <span className="font-medium">{score.criterion}</span>
                            <span>{score.score}/20</span>
                          </div>
                          <p className="text-sm text-gray-700">{score.feedback}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-medium mb-2">Overall Feedback</h3>
                      <p className="text-gray-700">{evaluation.data.feedback}</p>
                    </div>
                    
                    <Button 
                      className="mt-6"
                      onClick={handleGenerateEvaluation}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate Evaluation
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">No Evaluation Available</h3>
                    <p className="text-gray-600 mb-4">
                      There's no evaluation for this team yet. Generate one now.
                    </p>
                    <Button onClick={handleGenerateEvaluation} disabled={isGenerating}>
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Generate Evaluation
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default TeamDetails;