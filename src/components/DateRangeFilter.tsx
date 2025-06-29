import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRangeFilterProps {
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onDateRangeChange }) => {
  const [selectedRange, setSelectedRange] = useState<string>('all');

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;

    switch (range) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      default:
        start = null;
        end = null;
    }

    onDateRangeChange({ start, end });
  };

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-gray-500" />
      <select
        value={selectedRange}
        onChange={(e) => handleRangeChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="week">Past Week</option>
        <option value="month">Past Month</option>
        <option value="year">Past Year</option>
      </select>
    </div>
  );
};

export default DateRangeFilter;