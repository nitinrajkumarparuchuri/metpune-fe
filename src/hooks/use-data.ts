import { useQuery, useMutation, QueryClient } from '@tanstack/react-query';
import apiService, { 
  TeamSummary, 
  TeamEvaluation, 
  HackathonInsight, 
  JudgingCriterion,
  LeaderboardEntry
} from '@/lib/api';

// Query keys
export const QUERY_KEYS = {
  HACKATHONS: ['hackathons'],
  HACKATHON: (id: number) => ['hackathon', id],
  
  TEAM_SUMMARIES: (hackathonId?: number) => 
    hackathonId ? ['teamSummaries', { hackathonId }] : ['teamSummaries'],
  TEAM_SUMMARY: (teamName: string, hackathonId?: number) => 
    hackathonId ? ['teamSummary', teamName, { hackathonId }] : ['teamSummary', teamName],
  
  TEAM_EVALUATIONS: (hackathonId?: number) => 
    hackathonId ? ['teamEvaluations', { hackathonId }] : ['teamEvaluations'],
  TEAM_EVALUATION: (teamName: string, hackathonId?: number) => 
    hackathonId ? ['teamEvaluation', teamName, { hackathonId }] : ['teamEvaluation', teamName],
  
  LEADERBOARD: (hackathonId?: number) => 
    hackathonId ? ['leaderboard', { hackathonId }] : ['leaderboard'],
  
  TEAM_BLOGS: (hackathonId?: number) => 
    hackathonId ? ['teamBlogs', { hackathonId }] : ['teamBlogs'],
  TEAM_BLOG: (teamName: string, hackathonId?: number) => 
    hackathonId ? ['teamBlog', teamName, { hackathonId }] : ['teamBlog', teamName],
  TEAM_BLOG_MARKDOWN: (teamName: string, hackathonId?: number) => 
    hackathonId ? ['teamBlogMarkdown', teamName, { hackathonId }] : ['teamBlogMarkdown', teamName],
  
  HACKATHON_INSIGHTS: (hackathonId?: number) => 
    hackathonId ? ['hackathonInsights', { hackathonId }] : ['hackathonInsights'],
  HACKATHON_INSIGHTS_MARKDOWN: (hackathonId?: number) => 
    hackathonId ? ['hackathonInsightsMarkdown', { hackathonId }] : ['hackathonInsightsMarkdown'],
  
  JUDGING_CRITERIA: (hackathonId?: number) => 
    hackathonId ? ['judgingCriteria', { hackathonId }] : ['judgingCriteria'],
  
  SUBMISSIONS: (hackathonId?: number) => 
    hackathonId ? ['submissions', { hackathonId }] : ['submissions'],
  SUBMISSION_SUMMARIES: (hackathonId?: number) => 
    hackathonId ? ['submissionSummaries', { hackathonId }] : ['submissionSummaries'],
};

// Helper function to invalidate cache
const invalidateQueries = (queryClient: QueryClient, keys: string[][]) => {
  keys.forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

// Hackathon Hooks
export const useHackathons = () => {
  return useQuery<Hackathon[]>({
    queryKey: QUERY_KEYS.HACKATHONS,
    queryFn: () => apiService.getHackathons(),
  });
};

export const useHackathon = (id: number) => {
  return useQuery<Hackathon>({
    queryKey: QUERY_KEYS.HACKATHON(id),
    queryFn: () => apiService.getHackathon(id),
    enabled: !!id,
  });
};

export const useCreateHackathon = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: (hackathon: Omit<Hackathon, 'id'>) => apiService.createHackathon(hackathon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HACKATHONS });
    },
  });
};

export const useUpdateHackathon = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ id, hackathon }: { id: number; hackathon: Partial<Hackathon> }) => 
      apiService.updateHackathon(id, hackathon),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HACKATHONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HACKATHON(variables.id) });
    },
  });
};

// Team Summaries Hooks
export const useTeamSummaries = (hackathonId?: number) => {
  return useQuery<TeamSummary[]>({
    queryKey: QUERY_KEYS.TEAM_SUMMARIES(hackathonId),
    queryFn: async () => {
      console.log(`Fetching team summaries${hackathonId ? ` for hackathon ${hackathonId}` : ''}...`);
      const result = await apiService.getTeamSummaries(hackathonId);
      console.log('Team summaries result:', result);
      return result;
    },
  });
};

export const useTeamSummary = (teamName: string, hackathonId?: number) => {
  return useQuery<TeamSummary>({
    queryKey: QUERY_KEYS.TEAM_SUMMARY(teamName, hackathonId),
    queryFn: () => apiService.getTeamSummary(teamName, hackathonId),
    enabled: !!teamName,
  });
};

export const useGenerateTeamSummary = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ teamName, hackathonId }: { teamName: string, hackathonId?: number }) => 
      apiService.generateTeamSummary(teamName, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      invalidateQueries(queryClient, [
        [QUERY_KEYS.TEAM_SUMMARIES(hackathonId)[0]],
        [QUERY_KEYS.HACKATHON_INSIGHTS(hackathonId)[0]],
      ]);
    },
  });
};

// Team Evaluations Hooks
export const useTeamEvaluations = (hackathonId?: number) => {
  return useQuery<TeamEvaluation[]>({
    queryKey: QUERY_KEYS.TEAM_EVALUATIONS(hackathonId),
    queryFn: async () => {
      console.log(`Fetching team evaluations${hackathonId ? ` for hackathon ${hackathonId}` : ''}...`);
      const result = await apiService.getTeamEvaluations(hackathonId);
      console.log('Team evaluations result:', result);
      return result;
    },
  });
};

export const useTeamEvaluation = (teamName: string, hackathonId?: number) => {
  return useQuery<TeamEvaluation>({
    queryKey: QUERY_KEYS.TEAM_EVALUATION(teamName, hackathonId),
    queryFn: () => apiService.getTeamEvaluation(teamName, hackathonId),
    enabled: !!teamName,
  });
};

export const useGenerateTeamEvaluation = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ teamName, hackathonId }: { teamName: string, hackathonId?: number }) => 
      apiService.generateTeamEvaluation(teamName, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      invalidateQueries(queryClient, [
        [QUERY_KEYS.TEAM_EVALUATIONS(hackathonId)[0]],
        [QUERY_KEYS.LEADERBOARD(hackathonId)[0]],
      ]);
    },
  });
};

export const useLeaderboard = (hackathonId?: number) => {
  return useQuery<LeaderboardEntry[]>({
    queryKey: QUERY_KEYS.LEADERBOARD(hackathonId),
    queryFn: () => apiService.getLeaderboard(hackathonId),
  });
};

// Team Blogs Hooks
export const useTeamBlogs = (hackathonId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM_BLOGS(hackathonId),
    queryFn: async () => {
      try {
        const result = await apiService.getTeamBlogs(hackathonId);
        console.log(`Team blogs result${hackathonId ? ` for hackathon ${hackathonId}` : ''}:`, result);
        return result;
      } catch (error) {
        console.error(`Error fetching team blogs${hackathonId ? ` for hackathon ${hackathonId}` : ''}:`, error);
        return [];
      }
    },
  });
};

export const useTeamBlog = (teamName: string, hackathonId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.TEAM_BLOG(teamName, hackathonId),
    queryFn: () => apiService.getTeamBlog(teamName, hackathonId),
    enabled: !!teamName,
  });
};

export const useTeamBlogMarkdown = (teamName: string, hackathonId?: number) => {
  return useQuery<string>({
    queryKey: QUERY_KEYS.TEAM_BLOG_MARKDOWN(teamName, hackathonId),
    queryFn: () => apiService.getTeamBlogMarkdown(teamName, hackathonId),
    enabled: !!teamName,
  });
};

export const useGenerateTeamBlog = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ teamName, hackathonId }: { teamName: string, hackathonId?: number }) => 
      apiService.generateTeamBlog(teamName, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      invalidateQueries(queryClient, [
        [QUERY_KEYS.TEAM_BLOGS(hackathonId)[0]],
      ]);
    },
  });
};

// Hackathon Insights Hooks
export const useHackathonInsights = (hackathonId?: number) => {
  return useQuery<HackathonInsight[]>({
    queryKey: QUERY_KEYS.HACKATHON_INSIGHTS(hackathonId),
    queryFn: () => apiService.getHackathonInsights(hackathonId),
  });
};

export const useHackathonInsightsMarkdown = (hackathonId?: number) => {
  return useQuery<string>({
    queryKey: QUERY_KEYS.HACKATHON_INSIGHTS_MARKDOWN(hackathonId),
    queryFn: () => apiService.getHackathonInsightsMarkdown(hackathonId),
  });
};

export const useGenerateHackathonInsights = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: (hackathonId?: number) => apiService.generateHackathonInsights(hackathonId),
    onSuccess: (_, hackathonId) => {
      invalidateQueries(queryClient, [
        [QUERY_KEYS.HACKATHON_INSIGHTS(hackathonId)[0]],
        [QUERY_KEYS.HACKATHON_INSIGHTS_MARKDOWN(hackathonId)[0]],
      ]);
    },
  });
};

// Judging Criteria Hooks
export const useJudgingCriteria = (hackathonId?: number) => {
  return useQuery<JudgingCriterion[]>({
    queryKey: QUERY_KEYS.JUDGING_CRITERIA(hackathonId),
    queryFn: () => apiService.getJudgingCriteria(hackathonId),
  });
};

export const useCreateJudgingCriterion = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ criterion, hackathonId }: 
      { criterion: Omit<JudgingCriterion, 'id'>, hackathonId?: number }) => 
      apiService.createJudgingCriterion(criterion, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JUDGING_CRITERIA(hackathonId) });
    },
  });
};

export const useUpdateJudgingCriterion = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ id, criterion, hackathonId }: 
      { id: number; criterion: Partial<JudgingCriterion>; hackathonId?: number }) => 
      apiService.updateJudgingCriterion(id, criterion, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JUDGING_CRITERIA(hackathonId) });
    },
  });
};

export const useDeleteJudgingCriterion = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: ({ id, hackathonId }: { id: number, hackathonId?: number }) => 
      apiService.deleteJudgingCriterion(id, hackathonId),
    onSuccess: (_, variables) => {
      const { hackathonId } = variables;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JUDGING_CRITERIA(hackathonId) });
    },
  });
};

// Document Processing Hooks
export const useStartIngestion = (queryClient: QueryClient) => {
  return useMutation({
    mutationFn: (hackathonId?: number) => apiService.startIngestion(hackathonId),
    onSuccess: (_, hackathonId) => {
      invalidateQueries(queryClient, [
        [QUERY_KEYS.SUBMISSIONS(hackathonId)[0]],
        [QUERY_KEYS.SUBMISSION_SUMMARIES(hackathonId)[0]],
      ]);
    },
  });
};

export const useSubmissions = (hackathonId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUBMISSIONS(hackathonId),
    queryFn: () => apiService.getSubmissions(hackathonId),
  });
};

export const useSubmissionSummaries = (hackathonId?: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.SUBMISSION_SUMMARIES(hackathonId),
    queryFn: () => apiService.getSubmissionSummaries(hackathonId),
  });
};