import React from 'react';
import { Crown, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SubscriptionStatus: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-800">Subscription Status</h3>
        <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border bg-gray-50 border-gray-200 text-gray-600">
          <Crown className="h-4 w-4" />
          <span>Free Plan</span>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 text-sm font-medium">Demo Mode</p>
            <p className="text-blue-700 text-xs">
              Subscription management requires backend integration with Stripe and a database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;