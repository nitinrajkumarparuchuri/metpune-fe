import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HackathonProvider } from "./contexts/HackathonContext";
import Home from "./pages/Home";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Hackathons from "./pages/Hackathons";
import Dashboard from "./pages/Dashboard";
import JudgementCriteria from "./pages/JudgementCriteria";
import TeamDetails from "./pages/TeamDetails";
import HackathonInsights from "./pages/HackathonInsights";
import TeamBlogs from "./pages/TeamBlogs";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

// Create a new query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Query error:', error);
      },
      // Force debug mode to true for all queries
      meta: {
        debug: true,
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  },
});

// Log when the client is created
console.log('QueryClient created:', queryClient);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HackathonProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/index" element={<Index />} />
            <Route path="/hackathons" element={<Hackathons />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team/:teamName" element={<TeamDetails />} />
            <Route path="/team/:teamName/:hackathonId" element={<TeamDetails />} />
            <Route path="/insights" element={<HackathonInsights />} />
            <Route path="/insights/:hackathonId" element={<HackathonInsights />} />
            <Route path="/judgement-criteria" element={<JudgementCriteria />} />
            <Route path="/judgement-criteria/:hackathonId" element={<JudgementCriteria />} />
            <Route path="/team-blogs" element={<TeamBlogs />} />
            <Route path="/team-blogs/:hackathonId" element={<TeamBlogs />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/leaderboard/:hackathonId" element={<Leaderboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HackathonProvider>
  </QueryClientProvider>
);

export default App;