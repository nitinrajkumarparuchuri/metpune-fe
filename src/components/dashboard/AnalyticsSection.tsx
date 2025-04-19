
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import AnalyticsCard from './AnalyticsCard';

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

const AnalyticsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <AnalyticsCard title="Insights Generated" subtitle="Monthly trend">
        <LineChart data={insightsData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </AnalyticsCard>

      <AnalyticsCard title="Hackathon Growth" subtitle="Quarterly trend">
        <LineChart data={growthData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#82ca9d" />
        </LineChart>
      </AnalyticsCard>

      <AnalyticsCard title="Team Distribution" subtitle="By technology focus">
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
      </AnalyticsCard>
    </div>
  );
};

export default AnalyticsSection;
