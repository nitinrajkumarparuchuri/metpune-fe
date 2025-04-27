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
<>This page is under construction</>
  );
};

export default TeamBlogs;