import React, { useState, useEffect } from 'react';
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
  useGenerateTeamBlog,
  useHackathons,
  QUERY_KEYS
} from '@/hooks/use-data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ChevronRight,
  Code,
  Bot,
  Lightbulb,
  Trophy,
  AlertTriangle,
  Sparkles,
  ListIcon,
  Filter
} from 'lucide-react';
import { parse } from 'marked';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Helper function to extract specific sections from the markdown content
// Define interface for structured insights
interface HistogramData {
  name: string;
  count: number;
  percentage: number;
}

interface StructuredInsights {
  programming_languages: {
    description: string;
    data: HistogramData[];
    insights: string;
  };
  ai_tools: {
    description: string;
    data: HistogramData[];
    insights: string;
  };
  coherent_ideas: {
    description: string;
    list: string[];
    insights: string;
  };
  common_wins: {
    description: string;
    list: string[];
    insights: string;
  };
  common_pitfalls: {
    description: string;
    list: string[];
    insights: string;
  };
  innovative_ideas: {
    description: string;
    list: string[];
    insights: string;
  };
  executive_summary: string;
  recommendations: string;
}

// Parse structured insights from content
const parseInsights = (content: string): StructuredInsights | null => {
  try {
    // Check if content is valid JSON
    if (content.trim().startsWith('{') && content.trim().endsWith('}')) {
      return JSON.parse(content);
    }
    
    // Try to extract JSON from markdown or text content
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|```([\s\S]*?)```|\{[\s\S]*"programming_languages"[\s\S]*\}/m);
    if (jsonMatch) {
      const jsonStr = jsonMatch[1] || jsonMatch[2] || jsonMatch[0];
      return JSON.parse(jsonStr.trim());
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing insights JSON:", error);
    return null;
  }
};

// Legacy section extractor for backwards compatibility
const extractInsightSection = (markdown: string, sectionName: string): string => {
  try {
    // Look for the section header with various heading levels (##, ###, etc.)
    const sectionRegex = new RegExp(`(#+)\\s*${sectionName}[^\n]*\\n([\\s\\S]*?)(?=\\n#+\\s|$)`, 'i');
    const match = markdown.match(sectionRegex);
    
    if (match && match[2]) {
      // Parse the extracted section content
      return parse(match[2].trim());
    }
    
    // Try looking for list items with the section name
    const listItemRegex = new RegExp(`[*\\-\\+]\\s*\\*\\*${sectionName}[^*]*\\*\\*:\\s*([\\s\\S]*?)(?=\\n[*\\-\\+]\\s*\\*\\*|$)`, 'i');
    const listMatch = markdown.match(listItemRegex);
    
    if (listMatch && listMatch[1]) {
      return parse(listMatch[1].trim());
    }
    
    // Fall back to looking for the keyword anywhere in the content
    // Create a more flexible regex to find content around the keyword
    const keywordRegex = new RegExp(`(${sectionName}[\\s\\S]*?)(?=\\n#+\\s|$)`, 'i');
    const keywordMatch = markdown.match(keywordRegex);
    
    if (keywordMatch && keywordMatch[1]) {
      // Get a few paragraphs around where the keyword was found
      return parse(keywordMatch[1].trim());
    }
    
    // If we can't find anything, display a formatted message
    return `<p><em>No specific ${sectionName.toLowerCase()} information found in the insights.</em></p>`;
  } catch (error) {
    console.error(`Error extracting ${sectionName} section:`, error);
    return `<p><em>Error processing ${sectionName.toLowerCase()} information.</em></p>`;
  }
};

const HackathonInsights = () => {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedHackathonId, setSelectedHackathonId] = useState<number | undefined>(undefined);
  
  // Fetch hackathons data
  const hackathons = useHackathons();
  
  // Fetch insights data
  const insights = useHackathonInsights(selectedHackathonId);
  const insightsMarkdown = useHackathonInsightsMarkdown(selectedHackathonId);
  
  // Fetch team blogs data
  const teamBlogs = useTeamBlogs(selectedHackathonId);
  const teamBlog = useTeamBlog(selectedTeam || '', selectedHackathonId);
  const teamBlogMarkdown = useTeamBlogMarkdown(selectedTeam || '', selectedHackathonId);
  
  // Mutations for generating content
  const generateInsights = useGenerateHackathonInsights(queryClient);
  const generateTeamBlog = useGenerateTeamBlog(queryClient);
  
  // Auto refresh when insights are generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateInsights.isPending) {
      // Poll for updates every 3 seconds while generating
      interval = setInterval(() => {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.HACKATHON_INSIGHTS(selectedHackathonId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.HACKATHON_INSIGHTS_MARKDOWN(selectedHackathonId) 
        });
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateInsights.isPending, queryClient, selectedHackathonId]);
  
  // Auto refresh when team blogs are generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generateTeamBlog.isPending && selectedTeam) {
      // Poll for updates every 3 seconds while generating
      interval = setInterval(() => {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TEAM_BLOG(selectedTeam, selectedHackathonId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TEAM_BLOG_MARKDOWN(selectedTeam, selectedHackathonId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.TEAM_BLOGS(selectedHackathonId) 
        });
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generateTeamBlog.isPending, queryClient, selectedTeam, selectedHackathonId]);
  
  // Handle hackathon selection
  const handleHackathonChange = (value: string) => {
    if (value === "all") {
      setSelectedHackathonId(undefined);
    } else {
      setSelectedHackathonId(parseInt(value));
    }
    setSelectedTeam(null);
  };
  
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
    generateInsights.mutate(selectedHackathonId);
  };
  
  // Handle generation of team blog
  const handleGenerateTeamBlog = (teamName: string) => {
    generateTeamBlog.mutate({ teamName, hackathonId: selectedHackathonId });
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
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-center">
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
                
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Filter by Hackathon:</span>
                    <div className="w-64">
                      <Select
                        value={selectedHackathonId ? selectedHackathonId.toString() : "all"}
                        onValueChange={handleHackathonChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hackathon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Hackathons</SelectItem>
                        {hackathons.data?.map(hackathon => (
                          <SelectItem key={hackathon.id} value={hackathon.id.toString()}>
                            {hackathon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                  
                {selectedHackathonId && hackathons.data && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    Viewing: {hackathons.data.find(h => h.id === selectedHackathonId)?.name || 'Selected Hackathon'}
                  </Badge>
                )}
                {!selectedHackathonId && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    Viewing: All Hackathons
                  </Badge>
                )}
              </div>
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
                      <h2 className="text-xl font-semibold">
                        {selectedHackathonId 
                          ? latestInsight.title 
                          : "Global Insights Across All Hackathons"}
                      </h2>
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
                    {/* Process the insights data */}
                    {(() => {
                      // Try to parse the structured insights
                      const insightContent = insightsMarkdown.data || latestInsight?.content || '';
                      const structuredInsights = parseInsights(insightContent);
                      
                      if (structuredInsights) {
                        // Render the new structured format
                        return (
                          <Accordion type="single" collapsible className="w-full space-y-2 mt-4">
                            {/* Programming Languages */}
                            <AccordionItem value="languages" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Code className="h-5 w-5 mr-2 text-blue-600" />
                                  <code className="text-lg font-medium text-blue-600">Programming Languages Used</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-blue-50 rounded-md">
                                  {/* Render histogram for programming languages */}
                                  <div className="mb-4">
                                    {structuredInsights.programming_languages.data.map(lang => (
                                      <div key={lang.name} className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{lang.name}</span>
                                          <span className="text-sm">{lang.percentage}% ({lang.count} teams)</span>
                                        </div>
                                        <div className="w-full bg-blue-100 rounded-full h-4">
                                          <div 
                                            className="bg-blue-600 h-4 rounded-full" 
                                            style={{ width: `${lang.percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.programming_languages.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* AI Tools */}
                            <AccordionItem value="ai-tools" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Bot className="h-5 w-5 mr-2 text-purple-600" />
                                  <code className="text-lg font-medium text-purple-600">AI Tools Used</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-purple-50 rounded-md">
                                  {/* Render histogram for AI tools */}
                                  <div className="mb-4">
                                    {structuredInsights.ai_tools.data.map(tool => (
                                      <div key={tool.name} className="mb-2">
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium">{tool.name}</span>
                                          <span className="text-sm">{tool.percentage}% ({tool.count} teams)</span>
                                        </div>
                                        <div className="w-full bg-purple-100 rounded-full h-4">
                                          <div 
                                            className="bg-purple-600 h-4 rounded-full" 
                                            style={{ width: `${tool.percentage}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.ai_tools.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* Coherent Ideas */}
                            <AccordionItem value="coherent-ideas" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                                  <code className="text-lg font-medium text-green-600">Coherent Ideas</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-green-50 rounded-md">
                                  <div className="mb-4">
                                    <ul className="list-disc pl-6 space-y-2">
                                      {structuredInsights.coherent_ideas.list.map((idea, index) => (
                                        <li key={index} className="font-medium">{idea}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.coherent_ideas.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* Common Wins */}
                            <AccordionItem value="wins" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
                                  <code className="text-lg font-medium text-emerald-600">Common Wins</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-emerald-50 rounded-md">
                                  <div className="mb-4">
                                    <ul className="list-disc pl-6 space-y-2">
                                      {structuredInsights.common_wins.list.map((win, index) => (
                                        <li key={index} className="font-medium">{win}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.common_wins.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* Common Pitfalls */}
                            <AccordionItem value="pitfalls" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                  <code className="text-lg font-medium text-red-600">Common Pitfalls</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-red-50 rounded-md">
                                  <div className="mb-4">
                                    <ul className="list-disc pl-6 space-y-2">
                                      {structuredInsights.common_pitfalls.list.map((pitfall, index) => (
                                        <li key={index} className="font-medium">{pitfall}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.common_pitfalls.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* Innovative Ideas */}
                            <AccordionItem value="innovative-ideas" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                                  <code className="text-lg font-medium text-amber-600">Innovative Ideas</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-amber-50 rounded-md">
                                  <div className="mb-4">
                                    <ul className="list-disc pl-6 space-y-2">
                                      {structuredInsights.innovative_ideas.list.map((idea, index) => (
                                        <li key={index} className="font-medium">{idea}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div className="prose max-w-none mt-4">
                                    <h4>Analysis</h4>
                                    <p>{structuredInsights.innovative_ideas.insights}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            {/* Executive Summary */}
                            <AccordionItem value="summary" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <ListIcon className="h-5 w-5 mr-2 text-gray-600" />
                                  <code className="text-lg font-medium text-gray-600">Executive Summary</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-gray-50 rounded-md">
                                  <div className="prose max-w-none">
                                    <p>{structuredInsights.executive_summary}</p>
                                    <h4>Recommendations</h4>
                                    <p>{structuredInsights.recommendations}</p>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      } else {
                        // Fallback to legacy format if structured data is not available
                        return (
                          <Accordion type="single" collapsible className="w-full space-y-2 mt-4">
                            <AccordionItem value="languages" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Code className="h-5 w-5 mr-2 text-blue-600" />
                                  <code className="text-lg font-medium text-blue-600">Programming Languages Used</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-blue-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "Programming Languages") 
                                        : `<p>No programming language data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="ai-tools" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Bot className="h-5 w-5 mr-2 text-purple-600" />
                                  <code className="text-lg font-medium text-purple-600">AI Tools Used</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-purple-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "AI Tools") 
                                        : `<p>No AI tools data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="coherent-ideas" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Lightbulb className="h-5 w-5 mr-2 text-green-600" />
                                  <code className="text-lg font-medium text-green-600">Coherent Ideas</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-green-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "Coherent Ideas") 
                                        : `<p>No coherent ideas data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="wins" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
                                  <code className="text-lg font-medium text-emerald-600">Common Wins</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-emerald-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "Common Wins") 
                                        : `<p>No common wins data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="pitfalls" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                                  <code className="text-lg font-medium text-red-600">Common Pitfalls</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-red-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "Common Pitfalls") 
                                        : `<p>No common pitfalls data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="innovative-ideas" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <Sparkles className="h-5 w-5 mr-2 text-amber-600" />
                                  <code className="text-lg font-medium text-amber-600">Innovative Ideas</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-amber-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? extractInsightSection(insightsMarkdown.data, "Innovative Ideas") 
                                        : `<p>No innovative ideas data available</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                            
                            <AccordionItem value="full-insights" className="border rounded-lg overflow-hidden">
                              <AccordionTrigger className="hover:bg-gray-50 rounded-md px-2">
                                <div className="flex items-center">
                                  <ListIcon className="h-5 w-5 mr-2 text-gray-600" />
                                  <code className="text-lg font-medium text-gray-600">Full Insights</code>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="py-3 px-4 bg-gray-50 rounded-md">
                                  <div 
                                    className="prose max-w-none" 
                                    dangerouslySetInnerHTML={{ 
                                      __html: insightsMarkdown.data 
                                        ? parse(insightsMarkdown.data) 
                                        : `<p>${latestInsight.content}</p>` 
                                    }} 
                                  />
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        );
                      }
                    })()}
                    
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
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Team Blogs</h2>
                </div>
                
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Filter by Hackathon:</span>
                    <div className="w-64">
                      <Select
                        value={selectedHackathonId ? selectedHackathonId.toString() : "all"}
                        onValueChange={handleHackathonChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hackathon" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Hackathons</SelectItem>
                        {hackathons.data?.map(hackathon => (
                          <SelectItem key={hackathon.id} value={hackathon.id.toString()}>
                            {hackathon.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                  
                {selectedHackathonId && hackathons.data && (
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    Viewing: {hackathons.data.find(h => h.id === selectedHackathonId)?.name || 'Selected Hackathon'}
                  </Badge>
                )}
                {!selectedHackathonId && (
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                    Viewing: All Hackathons
                  </Badge>
                )}
              </div>
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