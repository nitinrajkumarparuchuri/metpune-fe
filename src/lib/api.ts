import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api-url.com/api'
    : '/api', // Using relative path for API to work with Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 second (2 minute) timeout for long operations
});

// Add request interceptor for debugging
api.interceptors.request.use(request => {
  console.log('⬆️ API Request:', request.method?.toUpperCase(), request.url);
  return request;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Types
export interface Hackathon {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'completed' | 'archived';
  created_at?: string;
  updated_at?: string;
}

export interface Team {
  id: string;
  name: string;
  project: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  summary: string;
  hackathon_id?: number;
}

export interface TeamSummary {
  id: number;
  team_name: string;
  status: string;
  summary: string;
  generated_at: string;
  markdown_summary?: string;
  hackathon_id: number;
  hackathon?: Hackathon;
}

export interface TeamEvaluation {
  id: number;
  team_name: string;
  status: string;
  total_score: number;
  feedback: string;
  scores: {
    criterion: string;
    score: number;
    feedback: string;
  }[];
  generated_at: string;
  hackathon_id: number;
  hackathon?: Hackathon;
}

export interface HackathonInsight {
  id: number;
  title: string;
  content: string;
  status: string;
  generated_at: string;
  markdown_content?: string;
  hackathon_id: number;
  hackathon?: Hackathon;
}

export interface JudgingCriterion {
  id: number;
  name: string;
  description: string;
  weight: number;
  hackathon_id?: number;
}

export interface LeaderboardEntry {
  team_name: string;
  total_score: number;
  rank: number;
}

// API Functions
export const apiService = {
  // Hackathons
  getHackathons: async (): Promise<Hackathon[]> => {
    const response = await api.get('/hackathons');
    return response.data;
  },

  getHackathon: async (id: number): Promise<Hackathon> => {
    const response = await api.get(`/hackathons/${id}`);
    return response.data;
  },

  createHackathon: async (hackathon: Omit<Hackathon, 'id'>): Promise<Hackathon> => {
    const response = await api.post('/hackathons', hackathon);
    return response.data;
  },

  updateHackathon: async (id: number, hackathon: Partial<Hackathon>): Promise<Hackathon> => {
    const response = await api.put(`/hackathons/${id}`, hackathon);
    return response.data;
  },

  // Team Summaries
  getTeamSummaries: async (hackathonId?: number): Promise<TeamSummary[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/team_summaries` : '/team_summaries';
    const response = await api.get(url);
    // Check if the data is nested within a team_summaries property
    if (response.data && response.data.team_summaries) {
      return response.data.team_summaries;
    }
    return response.data;
  },

  getTeamSummary: async (teamName: string, hackathonId?: number): Promise<TeamSummary> => {
    const url = hackathonId 
      ? `/hackathons/${hackathonId}/team_summaries/${teamName}` 
      : `/team_summaries/${teamName}`;
    const response = await api.get(url);
    return response.data;
  },

  generateTeamSummary: async (teamName: string, hackathonId?: number): Promise<{ job_id: string }> => {
    const url = hackathonId 
      ? `/hackathons/${hackathonId}/team_summaries/generate` 
      : '/team_summaries/generate';
    const response = await api.post(url, { team_name: teamName });
    return response.data;
  },

  // Team Evaluations
  getTeamEvaluations: async (hackathonId?: number): Promise<TeamEvaluation[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/team_evaluations` : '/team_evaluations';
    const response = await api.get(url);
    return response.data;
  },

  getTeamEvaluation: async (teamName: string, hackathonId?: number): Promise<TeamEvaluation> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/team_evaluations/${teamName}`
      : `/team_evaluations/${teamName}`;
    const response = await api.get(url);
    return response.data;
  },

  generateTeamEvaluation: async (teamName: string, hackathonId?: number): Promise<{ job_id: string }> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/team_evaluations/generate`
      : '/team_evaluations/generate';
    const response = await api.post(url, { team_name: teamName });
    return response.data;
  },

  getLeaderboard: async (hackathonId?: number): Promise<LeaderboardEntry[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/leaderboard` : '/leaderboard';
    const response = await api.get(url);
    // Check if the response data is wrapped
    if (response.data && response.data.leaderboard) {
      return response.data.leaderboard;
    }
    return response.data;
  },

  // Team Blogs
  getTeamBlogs: async (hackathonId?: number): Promise<any[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/team_blogs` : '/team_blogs';
    const response = await api.get(url);
    // Check if the response data is an array, if not, extract the array from the nested structure or return an empty array
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.team_blogs && Array.isArray(response.data.team_blogs)) {
      return response.data.team_blogs;
    } else {
      console.error('Unexpected response format from team_blogs endpoint:', response.data);
      return [];
    }
  },

  getTeamBlog: async (teamName: string, hackathonId?: number): Promise<any> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/team_blogs/${teamName}`
      : `/team_blogs/${teamName}`;
    const response = await api.get(url);
    // Check if the data is wrapped in a team_blog property
    if (response.data && response.data.team_blog) {
      return response.data.team_blog;
    }
    return response.data;
  },

  getTeamBlogMarkdown: async (teamName: string, hackathonId?: number): Promise<string> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/team_blogs/${teamName}/markdown`
      : `/team_blogs/${teamName}/markdown`;
    const response = await api.get(url);
    // The backend returns plain text markdown content directly
    if (typeof response.data === 'string') {
      return response.data;
    }
    // Or it might return it in a nested object
    else if (response.data && response.data.markdown_content) {
      return response.data.markdown_content;
    } else {
      console.error('Unexpected response format from markdown endpoint:', response.data);
      return '';
    }
  },

  generateTeamBlog: async (teamName: string, hackathonId?: number): Promise<{ job_id: string }> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/team_blogs/generate`
      : '/team_blogs/generate';
    const response = await api.post(url, { team_name: teamName });
    return response.data;
  },

  // Hackathon Insights
  getHackathonInsights: async (hackathonId?: number): Promise<HackathonInsight[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/hackathon_insights` : '/hackathon_insights';
    const response = await api.get(url);
    return response.data;
  },

  getHackathonInsightsMarkdown: async (hackathonId?: number): Promise<string> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/hackathon_insights/markdown`
      : '/hackathon_insights/markdown';
    const response = await api.get(url);
    return response.data.markdown_content;
  },

  generateHackathonInsights: async (hackathonId?: number): Promise<{ job_id: string }> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/hackathon_insights/generate`
      : '/hackathon_insights/generate';
    const response = await api.post(url);
    return response.data;
  },

  // Judging Criteria
  getJudgingCriteria: async (hackathonId?: number): Promise<JudgingCriterion[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/judging_criteria` : '/judging_criteria';
    const response = await api.get(url);
    return response.data;
  },

  createJudgingCriterion: async (
    criterion: Omit<JudgingCriterion, 'id'>,
    hackathonId?: number
  ): Promise<JudgingCriterion> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/judging_criteria` : '/judging_criteria';
    const response = await api.post(url, criterion);
    return response.data;
  },

  updateJudgingCriterion: async (
    id: number,
    criterion: Partial<JudgingCriterion>,
    hackathonId?: number
  ): Promise<JudgingCriterion> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/judging_criteria/${id}`
      : `/judging_criteria/${id}`;
    const response = await api.put(url, criterion);
    return response.data;
  },

  deleteJudgingCriterion: async (id: number, hackathonId?: number): Promise<void> => {
    const url = hackathonId
      ? `/hackathons/${hackathonId}/judging_criteria/${id}`
      : `/judging_criteria/${id}`;
    await api.delete(url);
  },

  // Document Management
  startIngestion: async (hackathonId?: number): Promise<{ job_id: string }> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/start_ingestion` : '/start_ingestion';
    const response = await api.post(url);
    return response.data;
  },

  getSubmissions: async (hackathonId?: number): Promise<any[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/submissions` : '/submissions';
    const response = await api.get(url);
    return response.data;
  },

  getSubmissionSummaries: async (hackathonId?: number): Promise<any[]> => {
    const url = hackathonId ? `/hackathons/${hackathonId}/summaries` : '/summaries';
    const response = await api.get(url);
    return response.data;
  }
};

export default apiService;