
import React from 'react';
import HackathonCard from '@/components/HackathonCard';

interface HackathonSectionProps {
  title: string;
  bgColor: string;
  hackathons: Array<{
    id: string;
    name: string;
    date: string;
    teams: number;
    presentations: number;
    insights: number;
    status: string;
  }>;
}

const HackathonSection = ({ title, bgColor, hackathons }: HackathonSectionProps) => {
  return (
    <div className={`${bgColor} p-6 rounded-lg`}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {hackathons.map(hackathon => (
          <HackathonCard key={hackathon.id} hackathon={hackathon} />
        ))}
      </div>
    </div>
  );
};

export default HackathonSection;
