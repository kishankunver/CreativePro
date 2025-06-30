import React, { useState, useEffect } from 'react';
import { Bell, X, Clock, CheckCircle } from 'lucide-react';
import { demoNotificationService } from '../services/demoNotifications';

interface DemoNotificationBannerProps {
  requestId?: string;
  className?: string;
}

const DemoNotificationBanner: React.FC<DemoNotificationBannerProps> = ({ 
  requestId, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notificationsExecuted, setNotificationsExecuted] = useState(0);

  useEffect(() => {
    if (!requestId) return;

    // Check if demo is active
    const isDemoActive = demoNotificationService.isDemoActive(requestId);
    setIsVisible(isDemoActive);

    if (!isDemoActive) return;

    // Start countdown
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, 45 - elapsed);
      setTimeRemaining(remaining);

      // Check for executed notifications
      const pending = demoNotificationService.getPendingNotifications(requestId);
      const total = 2; // collaboration_accepted + tip_received
      setNotificationsExecuted(total - pending.length);

      if (remaining === 0 && pending.length === 0) {
        clearInterval(interval);
        // Hide banner after all notifications are done
        setTimeout(() => setIsVisible(false), 3000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [requestId]);

  if (!isVisible) return null;

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg shadow-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {timeRemaining > 0 ? (
              <Clock className="h-5 w-5 animate-pulse" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-sm">
              {timeRemaining > 0 ? '⏳ Demo Notifications Scheduled' : '✅ Demo Complete'}
            </h4>
            <p className="text-blue-100 text-xs">
              {timeRemaining > 0 
                ? `Collaboration acceptance in ${timeRemaining} seconds`
                : `${notificationsExecuted}/2 notifications delivered`
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeRemaining > 0 && (
            <div className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-mono">
              {timeRemaining}s
            </div>
          )}
          <button
            onClick={() => setIsVisible(false)}
            className="text-white opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {timeRemaining > 0 && (
        <div className="mt-3">
          <div className="bg-white bg-opacity-20 rounded-full h-1">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-1000"
              style={{ width: `${((45 - timeRemaining) / 45) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoNotificationBanner;