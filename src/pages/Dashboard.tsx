
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import HackathonSection from '@/components/dashboard/HackathonSection';

const mockHackathons = {
  past: [
    {
      id: '1',
      name: 'Spring Innovation Challenge 2024',
      date: 'Mar 15-17, 2024',
      teams: 12,
      presentations: 18,
      insights: 24,
      status: 'completed',
    }
  ],
  inProgress: [
    {
      id: '2',
      name: 'Health Tech Hackathon',
      date: 'Feb 5-7, 2024',
      teams: 8,
      presentations: 10,
      insights: 15,
      status: 'completed',
    }
  ],
  upcoming: [
    {
      id: '3',
      name: 'Fintech Solutions Hackathon',
      date: 'Jan 20-22, 2024',
      teams: 10,
      presentations: 14,
      insights: 18,
      status: 'completed',
    }
  ]
};

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col mb-8">
            <h1 className="text-2xl font-bold text-center">Hackathon Dashboard</h1>
            <p className="text-gray-600 text-center">Manage and view all your hackathon events</p>
          </div>

          <AnalyticsSection />

          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <Input
              placeholder="Search hackathons..."
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

          {/* Hackathon Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HackathonSection
              title="Past Hackathons"
              bgColor="bg-green-50"
              hackathons={mockHackathons.past}
            />
            <HackathonSection
              title="In Progress"
              bgColor="bg-blue-50"
              hackathons={mockHackathons.inProgress}
            />
            <HackathonSection
              title="Upcoming"
              bgColor="bg-purple-50"
              hackathons={mockHackathons.upcoming}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
