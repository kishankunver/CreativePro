import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Heart, Info } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';

const CheckoutSuccessPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  
  const isDemo = searchParams.get('demo') === 'true';

  useEffect(() => {
    // Simulate a brief loading period to show the success animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
              <div className="animate-bounce">
                <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isDemo ? 'Demo Success!' : 'Payment Successful!'}
              </h1>
              <p className="text-green-100">Thank you for your support</p>
            </div>

            {/* Success Content */}
            <div className="p-8">
              {isDemo && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium">Demo Mode</p>
                      <p className="text-blue-700 text-xs">
                        This is a demonstration. No actual payment was processed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Your contribution means the world to us!
                </h2>
                <p className="text-gray-600">
                  Your support helps keep CreativePro running and encourages more amazing ideas from our community.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">What happens next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• {isDemo ? 'In production, you\'d' : 'You\'ll'} receive a confirmation email</li>
                  <li>• Your support helps fund platform improvements</li>
                  <li>• Contributors are motivated by your generosity</li>
                  <li>• The community grows stronger together</li>
                </ul>
              </div>

              {user && (
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600">
                    Logged in as <span className="font-medium">{user.name}</span>
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
                
                <Link
                  to="/submit"
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Share Your Own Idea</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Additional Thank You Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Want to support more? Consider following and upvoting ideas that inspire you!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;