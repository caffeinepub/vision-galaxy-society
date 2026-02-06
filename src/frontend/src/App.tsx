import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import FlatDashboardPage from './pages/flat/FlatDashboardPage';
import SecretaryDashboardPage from './pages/secretary/SecretaryDashboardPage';
import GuardDashboardPage from './pages/guard/GuardDashboardPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import MaintenancePage from './pages/flat/MaintenancePage';
import PaymentsPage from './pages/secretary/PaymentsPage';
import OverduePage from './pages/secretary/OverduePage';
import ExpendituresAdminPage from './pages/secretary/ExpendituresAdminPage';
import ExpendituresPage from './pages/flat/ExpendituresPage';
import SettingsPage from './pages/secretary/SettingsPage';
import ProfilePage from './pages/flat/ProfilePage';
import ComplaintsPage from './pages/flat/ComplaintsPage';
import ComplaintDetailPage from './pages/flat/ComplaintDetailPage';
import ComplaintsAdminPage from './pages/secretary/ComplaintsAdminPage';
import NoticesPage from './pages/common/NoticesPage';
import NoticeDetailPage from './pages/common/NoticeDetailPage';
import CreateNoticePage from './pages/secretary/CreateNoticePage';
import VisitorRequestsPage from './pages/guard/VisitorRequestsPage';
import VisitorRequestCreatePage from './pages/guard/VisitorRequestCreatePage';
import VisitorRequestDetailPage from './pages/guard/VisitorRequestDetailPage';
import FlatVisitorRequestsPage from './pages/flat/VisitorRequestsPage';
import NotificationsPage from './pages/common/NotificationsPage';
import PaymentsReportPrintPage from './pages/secretary/PaymentsReportPrintPage';
import ComplaintsReportPrintPage from './pages/secretary/ComplaintsReportPrintPage';
import ExpendituresReportPrintPage from './pages/secretary/ExpendituresReportPrintPage';
import NoticesReportPrintPage from './pages/secretary/NoticesReportPrintPage';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupModal from './components/ProfileSetupModal';
import StartupErrorScreen from './components/StartupErrorScreen';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, isError, refetch } = useGetCallerUserProfile();
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  // Handle logout
  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  // Handle retry
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    refetch();
  };

  // Show loading during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show error screen if profile fetch failed
  if (isError) {
    return <StartupErrorScreen onRetry={handleRetry} onLogout={handleLogout} />;
  }

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show profile setup modal if profile doesn't exist
  if (showProfileSetup) {
    return <ProfileSetupModal onComplete={() => setShowProfileSetup(false)} />;
  }

  // Show error screen if profile is still null after fetch completed (shouldn't happen but safety check)
  if (!userProfile) {
    return <StartupErrorScreen onRetry={handleRetry} onLogout={handleLogout} />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function IndexComponent() {
  const { data: userProfile } = useGetCallerUserProfile();
  
  if (!userProfile) return null;

  if (userProfile.userType === 'FlatOwner') {
    return <FlatDashboardPage />;
  } else if (userProfile.userType === 'Secretary') {
    return <SecretaryDashboardPage />;
  } else if (userProfile.userType === 'Guard') {
    return <GuardDashboardPage />;
  }
  
  return <div>Unknown user type</div>;
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const changePasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/change-password',
  component: ChangePasswordPage,
});

const maintenanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/maintenance',
  component: MaintenancePage,
});

const paymentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payments',
  component: PaymentsPage,
});

const overdueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/overdue',
  component: OverduePage,
});

const expendituresAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenditures/admin',
  component: ExpendituresAdminPage,
});

const expendituresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/expenditures',
  component: ExpendituresPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const complaintsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaints',
  component: ComplaintsPage,
});

const complaintDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaints/$complaintId',
  component: ComplaintDetailPage,
});

const complaintsAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/complaints/admin',
  component: ComplaintsAdminPage,
});

const noticesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notices',
  component: NoticesPage,
});

const noticeDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notices/$noticeId',
  component: NoticeDetailPage,
});

const createNoticeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notices/create',
  component: CreateNoticePage,
});

const visitorRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visitor-requests',
  component: VisitorRequestsPage,
});

const visitorRequestCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visitor-requests/create',
  component: VisitorRequestCreatePage,
});

const visitorRequestDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visitor-requests/$requestId',
  component: VisitorRequestDetailPage,
});

const flatVisitorRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-visitor-requests',
  component: FlatVisitorRequestsPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const paymentsReportPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/payments/print',
  component: PaymentsReportPrintPage,
});

const complaintsReportPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/complaints/print',
  component: ComplaintsReportPrintPage,
});

const expendituresReportPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/expenditures/print',
  component: ExpendituresReportPrintPage,
});

const noticesReportPrintRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports/notices/print',
  component: NoticesReportPrintPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  changePasswordRoute,
  maintenanceRoute,
  paymentsRoute,
  overdueRoute,
  expendituresAdminRoute,
  expendituresRoute,
  settingsRoute,
  profileRoute,
  complaintsRoute,
  complaintDetailRoute,
  complaintsAdminRoute,
  noticesRoute,
  noticeDetailRoute,
  createNoticeRoute,
  visitorRequestsRoute,
  visitorRequestCreateRoute,
  visitorRequestDetailRoute,
  flatVisitorRequestsRoute,
  notificationsRoute,
  paymentsReportPrintRoute,
  complaintsReportPrintRoute,
  expendituresReportPrintRoute,
  noticesReportPrintRoute,
]);

const router = createRouter({ routeTree });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed, continue without it
    });
  });
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
