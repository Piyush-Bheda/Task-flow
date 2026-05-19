import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import AppLayout from "./components/layouts/AppLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./components/dashboard/Dashboard";
const Issues = lazy(() => import("./pages/auth/issues/Issues"));
const IssueDetails = lazy(() => import("./pages/auth/issues/IssueDetails"));

const Projects = lazy(() => import("./pages/auth/projects/Projects"));
const ProjectDetails = lazy(() => import("./pages/auth/projects/ProjectDetails"));

const PageLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

function ProjectsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Projects />
    </Suspense>
  );
}

function ProjectDetailsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ProjectDetails />
    </Suspense>
  );
}

function IssuesPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Issues />
    </Suspense>
  );
}

function IssueDetailsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <IssueDetails />
    </Suspense>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/issues/:id" element={<IssueDetailsPage />} />
          <Route path="/settings" element={<div className="text-muted-foreground">Settings placeholder</div>} />
          <Route path="/members" element={<div className="text-muted-foreground">Members placeholder</div>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}