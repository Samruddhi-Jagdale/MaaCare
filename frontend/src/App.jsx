// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import WomanDashboard from './pages/WomanDashboard';
import Education from './pages/Education';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/education" element={<Education />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/worker"
        element={
          <ProtectedRoute allowedRoles={["worker"]}>
            <WorkerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/woman"
        element={
          <ProtectedRoute allowedRoles={["woman"]}>
            <WomanDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppRoutes />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}
