import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedLayout from '@/components/layouts/ProtectedLayout';
import AppLayout from '@/components/layouts/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import Projects from '@/pages/auth/projects/Projects';
import ProjectDetails from '@/pages/auth/projects/ProjectDetails';
import Issues from '@/pages/auth/issues/Issues';
import IssueDetails from '@/pages/auth/issues/IssueDetails';

// Lazy load auth pages
const Login = React.lazy(() => import('@/pages/auth/Login'));
const Register = React.lazy(() => import('@/pages/auth/Register'));

const PageLoader = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <Loader2 size={28} className="animate-spin text-indigo-600" />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with App Shell */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/issues/:id" element={<IssueDetails />} />
            <Route path="/settings" element={<div className="text-muted-foreground">Settings placeholder</div>} />
            <Route path="/members" element={<div className="text-muted-foreground">Members placeholder</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}