import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { IdeaProvider } from './contexts/IdeaContext';
import HomePage from './pages/HomePage';
import IdeaDetailsPage from './pages/IdeaDetailsPage';
import SubmitIdeaPage from './pages/SubmitIdeaPage';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <IdeaProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/idea/:id" element={<IdeaDetailsPage />} />
              <Route 
                path="/submit" 
                element={
                  <ProtectedRoute>
                    <SubmitIdeaPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile/:userId" 
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </IdeaProvider>
    </AuthProvider>
  );
}

export default App;