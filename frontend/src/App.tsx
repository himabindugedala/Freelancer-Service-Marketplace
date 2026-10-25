import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { BrowseServices } from './pages/public/BrowseServices';
import { ServiceDetail } from './pages/public/ServiceDetail';
import { BrowseFreelancers } from './pages/public/BrowseFreelancers';
import { FreelancerProfileDetail } from './pages/public/FreelancerProfileDetail';
import { HowItWorks } from './pages/public/HowItWorks';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { PostProject } from './pages/client/PostProject';
import { MyProjects } from './pages/client/MyProjects';
import { ProjectProposals } from './pages/client/ProjectProposals';
import { ClientOrders } from './pages/client/ClientOrders';
import { ClientOrderDetail } from './pages/client/ClientOrderDetail';

// Freelancer Pages
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { MyServices } from './pages/freelancer/MyServices';
import { CreateEditService } from './pages/freelancer/CreateEditService';
import { BrowseProjects } from './pages/freelancer/BrowseProjects';
import { ProjectDetail } from './pages/freelancer/ProjectDetail';
import { MyProposals } from './pages/freelancer/MyProposals';
import { FreelancerOrders } from './pages/freelancer/FreelancerOrders';
import { FreelancerOrderDetail } from './pages/freelancer/FreelancerOrderDetail';

// Shared Pages
import { MessagesPage } from './pages/shared/MessagesPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { SavedItemsPage } from './pages/shared/SavedItemsPage';
import { SettingsPage } from './pages/shared/SettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminReports } from './pages/admin/AdminReports';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <Routes>
              {/* Public & Shared Routes wrapped in MainLayout */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="services" element={<BrowseServices />} />
                <Route path="services/:id" element={<ServiceDetail />} />
                <Route path="freelancers" element={<BrowseFreelancers />} />
                <Route path="freelancers/:id" element={<FreelancerProfileDetail />} />
                <Route path="projects" element={<BrowseProjects />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="how-it-works" element={<HowItWorks />} />

                {/* Auth */}
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />

                {/* Authenticated Shared Pages */}
                <Route
                  path="messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="saved"
                  element={
                    <ProtectedRoute>
                      <SavedItemsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Client Routes */}
                <Route
                  path="client"
                  element={
                    <ProtectedRoute allowedRoles={['client', 'admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="projects/new" element={<PostProject />} />
                  <Route path="projects" element={<MyProjects />} />
                  <Route path="projects/:projectId/proposals" element={<ProjectProposals />} />
                  <Route path="orders" element={<ClientOrders />} />
                  <Route path="orders/:id" element={<ClientOrderDetail />} />
                </Route>

                {/* Freelancer Routes */}
                <Route
                  path="freelancer"
                  element={
                    <ProtectedRoute allowedRoles={['freelancer', 'admin']}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<FreelancerDashboard />} />
                  <Route path="services" element={<MyServices />} />
                  <Route path="services/new" element={<CreateEditService />} />
                  <Route path="services/edit/:id" element={<CreateEditService />} />
                  <Route path="proposals" element={<MyProposals />} />
                  <Route path="orders" element={<FreelancerOrders />} />
                  <Route path="orders/:id" element={<FreelancerOrderDetail />} />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="reports" element={<AdminReports />} />
                </Route>

                {/* 404 Catch All */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
