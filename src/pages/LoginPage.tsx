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
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Custom lightbulb logo component
  const LightbulbLogo = ({ className }: { className: string }) => (
    <div className={`${className} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center relative overflow-hidden`}>
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 opacity-90"></div>
      
      {/* Lightbulb icon */}
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="relative z-10 text-white"
        style={{ width: '60%', height: '60%' }}
      >
        {/* Bulb body */}
        <path 
          d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 5.5V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.5C7.5 13.5 6 11.5 6 9a6 6 0 0 1 6-6z" 
          fill="currentColor"
        />
        {/* Light rays */}
        <path 
          d="M12 1v2M4.22 4.22l1.42 1.42M1 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M23 12h-2M18.36 18.36l1.42 1.42" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      
      {/* Subtle shine effect */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-white opacity-30 rounded-full"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="absolute top-4 right-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
          DEMO ONLY
        </div>

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-center">
          <div className="flex justify-center mb-3">
            <LightbulbLogo className="w-12 h-12" />
          </div>
          <h1 className="text-white text-2xl font-bold">CreativePro</h1>
          <p className="text-indigo-100 mt-1">Share and validate startup ideas</p>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
                !isLogin
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Alex Chen"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
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
                Password
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

          {/* Demo Notice */}
          <div className="mt-6 text-center text-xs text-gray-500">
            This is a demo. Use any email and password to {isLogin ? 'login' : 'sign up'}.
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