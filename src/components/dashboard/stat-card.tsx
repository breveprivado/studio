import React from 'react';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgClass: string;
  valueColorClass: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, iconBgClass, valueColorClass, description }) => {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${valueColorClass}`}>{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBgClass}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
