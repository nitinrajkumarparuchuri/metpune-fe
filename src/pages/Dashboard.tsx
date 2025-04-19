
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';
import HackathonCard from '@/components/HackathonCard';

const insightsData = [
  { name: 'Jan', value: 15 },
  { name: 'Feb', value: 12 },
  { name: 'Mar', value: 20 },
  { name: 'Apr', value: 15 },
];

const growthData = [
  { name: 'Q2 23', value: 2 },
  { name: 'Q3 23', value: 3 },
  { name: 'Q4 23', value: 4 },
  { name: 'Q1 24', value: 6 },
];

const teamDistribution = [
  { name: 'AI/ML', value: 35, color: '#8884d8' },
  { name: 'Blockchain', value: 25, color: '#82ca9d' },
  { name: 'Health Tech', value: 20, color: '#ffc658' },
  { name: 'AR/VR', value: 10, color: '#ff8042' },
  { name: 'Fintech', value: 10, color: '#0088fe' },
];

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

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Insights Generated */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Insights Generated</h3>
              <p className="text-sm text-gray-600 mb-4">Monthly trend</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insightsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Hackathon Growth */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Hackathon Growth</h3>
              <p className="text-sm text-gray-600 mb-4">Quarterly trend</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Team Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-2">Team Distribution</h3>
              <p className="text-sm text-gray-600 mb-4">By technology focus</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={teamDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {teamDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

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
            {/* Past Hackathons */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Past Hackathons</h2>
              <div className="space-y-4">
                {mockHackathons.past.map(hackathon => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">In Progress</h2>
              <div className="space-y-4">
                {mockHackathons.inProgress.map(hackathon => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Upcoming</h2>
              <div className="space-y-4">
                {mockHackathons.upcoming.map(hackathon => (
                  <HackathonCard key={hackathon.id} hackathon={hackathon} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
