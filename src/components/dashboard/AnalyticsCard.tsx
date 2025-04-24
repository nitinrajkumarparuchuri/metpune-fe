import React from 'react';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface AnalyticsCardProps {
  title: string;
  value: number;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
  children?: React.ReactNode;
}

const AnalyticsCard = ({ 
  title, 
  value, 
  percentage = 0, 
  trend = 'neutral', 
  description,
  children 
}: AnalyticsCardProps) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="flex items-end mb-2">
        <span className="text-3xl font-bold">{value}</span>
        {percentage > 0 && (
          <div className="flex items-center ml-4 mb-1">
            <span 
              className={`text-sm font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}
            >
              {percentage}%
            </span>
            {trend === 'up' && <ArrowUpIcon className="w-4 h-4 text-green-600 ml-1" />}
            {trend === 'down' && <ArrowDownIcon className="w-4 h-4 text-red-600 ml-1" />}
          </div>
        )}
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      {children && (
        <div className="mt-4 h-[150px]">
          {children}
        </div>
      )}
    </Card>
  );
};

export default AnalyticsCard;