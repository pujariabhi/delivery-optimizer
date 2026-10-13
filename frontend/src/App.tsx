import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/DashboardPage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { OrdersPage } from './pages/OrdersPage';
import { RouteOptimizationPage } from './pages/RouteOptimizationPage';
import { FleetManagementPage } from './pages/FleetManagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import { CustomerPortalPage } from './pages/CustomerPortalPage';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/customer" element={<CustomerPortalPage />} />

      <Route
        path="/"
        element={
          user?.role === 'ROLE_CUSTOMER' ? <Navigate to="/customer" replace /> : <MainLayout />
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="tracking" element={<LiveTrackingPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="routes" element={<RouteOptimizationPage />} />
        <Route path="fleet" element={<FleetManagementPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
