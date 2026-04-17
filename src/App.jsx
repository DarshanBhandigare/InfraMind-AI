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
import DashboardLayout from './components/DashboardLayout';

import { useLocation } from 'react-router-dom';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  return user ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

// Layout Wrapper to switch between Landing and Dashboard
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Routes that should NOT have the Sidebar (Landing/Auth/Public)
  const isPublicReport = location.pathname === '/report' && !user;
  const publicRoutes = ['/', '/login', '/signup', '/about', '/contact', '/admin/login', '/alerts'];
  
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
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/report" element={<CitizenReport />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              
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
