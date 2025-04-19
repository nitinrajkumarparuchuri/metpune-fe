
import React from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer } from 'recharts';

interface AnalyticsCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AnalyticsCard = ({ title, subtitle, children }: AnalyticsCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AnalyticsCard;
