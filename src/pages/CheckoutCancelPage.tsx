import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, Heart, RefreshCw } from 'lucide-react';
import Header from '../components/Header';

const CheckoutCancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Cancel Header */}
            <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-8 text-center">
              <XCircle className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
              <p className="text-gray-100">No charges were made</p>
            </div>

            {/* Cancel Content */}
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  That's okay!
                </h2>
                <p className="text-gray-600">
                  Your payment was cancelled and no charges were made to your account. 
                  You can try again anytime or continue exploring amazing ideas.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Other ways to support:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Upvote ideas you find interesting</li>
                  <li>• Leave thoughtful comments and feedback</li>
                  <li>• Share ideas with your network</li>
                  <li>• Submit your own innovative ideas</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </Link>
                
                <button
                  onClick={() => window.history.back()}
                  className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>
              </div>

              {/* Support Message */}
              <div className="mt-6 text-center">
                <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Your engagement and participation already make CreativePro better for everyone!
                </p>
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Questions about payments? Feel free to reach out to our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCancelPage;