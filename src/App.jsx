import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CitizenReport from './pages/CitizenReport';
import MapPage from './pages/MapPage';
import Alerts from './pages/Alerts';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import EscalationHub from './pages/EscalationHub';
import DashboardLayout from './components/DashboardLayout';

import { useLocation } from 'react-router-dom';

import { isAdmin } from './utils/adminConfig';

// Protected Route for Citizens
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

// Admin Only Route - Highly Secure
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  if (!user || !isAdmin(user.email)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Admin Login Route - Prevents access if already logged in
const AdminLoginRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    if (isAdmin(user.email)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Layout Wrapper to switch between Landing and Dashboard
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Routes that should NOT have the Sidebar
  const isPublicReport = location.pathname === '/report' && !user;
  const publicRoutes = ['/', '/login', '/signup', '/about', '/contact', '/admin/login'];
  
  if (user && !publicRoutes.includes(location.pathname) && !isPublicReport) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <AppLayout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/admin/login" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
              <Route path="/report" element={<CitizenReport />} />

              {/* Citizen & Public Content */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/hub" element={<EscalationHub />} />
              
              {/* Admin Only Content */}
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AppLayout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
