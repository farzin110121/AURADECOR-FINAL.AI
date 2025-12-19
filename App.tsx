
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import OwnerLayout from './components/owner/OwnerLayout';
import SupplierLayout from './components/supplier/SupplierLayout';
import PublicLayout from './components/common/PublicLayout';
import ProjectPage from './pages/owner/ProjectPage';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Owner Routes */}
      <Route
        path="/owner"
        element={
          <ProtectedRoute role="owner">
            <OwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="projects/:projectId" element={<ProjectPage />} />
        {/* Add other owner routes here, e.g., projects, subscription */}
      </Route>

      {/* Supplier Routes */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute role="supplier">
            <SupplierLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SupplierDashboard />} />
        {/* Add other supplier routes here, e.g., leads, profile */}
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
};

export default App;
