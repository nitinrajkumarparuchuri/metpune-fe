
import React, { useState } from 'react';
import Header from '@/components/Header';
import TeamCard from '@/components/TeamCard';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const mockTeams = [
  {
    id: '1',
    name: 'Team Alpha',
    project: 'EcoTrack',
    status: 'success',
    summary: 'An AI-powered sustainability tracker that helps businesses monitor and reduce their carbon footprint through real-time analytics.',
  },
  {
    id: '2',
    name: 'Digital Nomads',
    project: 'RemoteFlow',
    status: 'processing',
    summary: 'A collaborative workspace platform designed specifically for distributed teams with integrated AI assistance.',
  },
  {
    id: '3',
    name: 'CodeCrafters',
    project: 'DevMentor',
    status: 'pending',
    summary: 'An intelligent coding companion that provides real-time suggestions and best practices while you code.',
  },
] as const;

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
