import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name');
        }
        await signup(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img 
                src="/Logo.png" 
                alt="CreativePro Logo" 
                className="w-20 h-20 object-contain rounded-full shadow-lg ring-4 ring-white/20"
              />
              {/* Soft glow effect */}
              <div className="absolute inset-0 rounded-full bg-white/10 blur-sm -z-10"></div>
            </div>
          </div>
          <h1 className="text-white text-3xl font-bold">CreativePro</h1>
          <p className="text-indigo-100 mt-1">Share and validate startup ideas</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                !isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (isLogin ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Instructions */}
          <div className="mt-6 text-center text-xs text-gray-500">
            {isLogin ? (
              <p>
                Don't have an account? Click "Sign Up" above to create one with your own name and email.
              </p>
            ) : (
              <p>
                Create your account with your real name and email to get started with CreativePro.
              </p>
            )}
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-indigo-600 hover:text-indigo-800">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;