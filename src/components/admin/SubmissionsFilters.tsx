import React from 'react';
import { Search, Filter } from 'lucide-react';

interface SubmissionsFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  statusCounts: {
    all: number;
    draft: number;
    submitted: number;
    processing: number;
    completed: number;
  };
}

export default function SubmissionsFilters({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  statusCounts
}: SubmissionsFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title or customer ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>
        <div className="md:w-48">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white transition-all duration-200"
            >
              <option value="all">All Status ({statusCounts.all})</option>
              <option value="draft">Draft ({statusCounts.draft})</option>
              <option value="submitted">Submitted ({statusCounts.submitted})</option>
              <option value="processing">Processing ({statusCounts.processing})</option>
              <option value="completed">Completed ({statusCounts.completed})</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
