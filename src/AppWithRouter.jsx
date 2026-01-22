import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import HomePage from './pages/HomePage';
import App from './App';
import BarPage from './pages/BarPage';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function AppWithRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main pages */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/menu" element={<App />} />
        <Route path="/bar" element={<BarPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/dashboard/*" element={<Dashboard />} />
        
        {/* Catch all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWithRouter;
