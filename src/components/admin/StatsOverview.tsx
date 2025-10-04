import React from 'react';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';

interface StatsOverviewProps {
  totalCustomers: number;
  totalSubmissions: number;
  submittedCount: number;
  completedCount: number;
}

export default function StatsOverview({
  totalCustomers,
  totalSubmissions,
  submittedCount,
  completedCount
}: StatsOverviewProps) {
  const stats = [
    {
      label: 'Total Customers',
      value: totalCustomers,
      color: 'red',
      icon: <Users className="w-6 h-6" />
    },
    {
      label: 'Total Submissions',
      value: totalSubmissions,
      color: 'blue',
      icon: <FileText className="w-6 h-6" />
    },
    {
      label: 'Submitted',
      value: submittedCount,
      color: 'yellow',
      icon: <Clock className="w-6 h-6" />
    },
    {
      label: 'Completed',
      value: completedCount,
      color: 'green',
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center text-${stat.color}-600`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
