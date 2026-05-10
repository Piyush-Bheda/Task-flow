import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedLayout from "./components/layouts/ProtectedLayout";
import AppLayout from "./components/layouts/AppLayout";
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<div>Dashboard placeholder</div>} />
          <Route path="/projects" element={<div>Projects placeholder</div>} />
          <Route path="/settings" element={<div>Settings placeholder</div>} />
          <Route path="/members" element={<div>Members placeholder</div>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}