
import React, { useState } from 'react';
import Header from '@/components/Header';
import TeamCard from '@/components/TeamCard';
import { Input } from '@/components/ui/input';

const mockTeams = {
  inProgress: [
    {
      id: '1',
      name: 'Team Alpha',
      project: 'EcoTrack',
      status: 'processing',
      summary: 'An AI-powered sustainability tracker that helps businesses monitor and reduce their carbon footprint through real-time analytics.',
    },
  ],
  upcoming: [
    {
      id: '2',
      name: 'Digital Nomads',
      project: 'RemoteFlow',
      status: 'pending',
      summary: 'A collaborative workspace platform designed specifically for distributed teams with integrated AI assistance.',
    },
  ],
  past: [
    {
      id: '3',
      name: 'CodeCrafters',
      project: 'DevMentor',
      status: 'success',
      summary: 'An intelligent coding companion that provides real-time suggestions and best practices while you code.',
    },
  ],
} as const;

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <h1 className="text-3xl font-bold">Hackathon Projects</h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* In Progress Hackathons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-purple-600">In Progress Hackathons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeams.inProgress.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>

          {/* Upcoming Hackathons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-blue-500">Upcoming Hackathons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeams.upcoming.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>

          {/* Past Hackathons */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-600">Past Hackathons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTeams.past.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
