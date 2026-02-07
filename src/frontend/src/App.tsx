import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ActorProvider } from './contexts/ActorContext';
import LoginPage from './pages/LoginPage';
import FlatDashboardPage from './pages/flat/FlatDashboardPage';
import SecretaryDashboardPage from './pages/secretary/SecretaryDashboardPage';
import GuardDashboardPage from './pages/guard/GuardDashboardPage';
import MaintenancePage from './pages/flat/MaintenancePage';
import ComplaintsPage from './pages/flat/ComplaintsPage';
import NoticesPage from './pages/common/NoticesPage';
import VisitorRequestsPage from './pages/flat/VisitorRequestsPage';
import NotificationsPage from './pages/common/NotificationsPage';
import PaymentsPage from './pages/secretary/PaymentsPage';
import ComplaintsAdminPage from './pages/secretary/ComplaintsAdminPage';
import ExpendituresAdminPage from './pages/secretary/ExpendituresAdminPage';
import SettingsPage from './pages/secretary/SettingsPage';
import GuardVisitorRequestsPage from './pages/guard/VisitorRequestsPage';
import VisitorRequestCreatePage from './pages/guard/VisitorRequestCreatePage';
import VisitorRequestDetailPage from './pages/guard/VisitorRequestDetailPage';
import PaymentsReportPrintPage from './pages/secretary/PaymentsReportPrintPage';
import ComplaintsReportPrintPage from './pages/secretary/ComplaintsReportPrintPage';
import ExpendituresReportPrintPage from './pages/secretary/ExpendituresReportPrintPage';
import NoticesReportPrintPage from './pages/secretary/NoticesReportPrintPage';
import ProfileSetupModal from './components/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import StartupErrorScreen from './components/StartupErrorScreen';
import { sanitizeError } from './utils/sanitizeError';

function AuthenticatedApp() {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
    error: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setShowProfileSetup(true);
    } else {
      setShowProfileSetup(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (profileError) {
    return (
      <StartupErrorScreen
        onRetry={() => refetchProfile()}
        onLogout={handleLogout}
        errorDetail={sanitizeError(profileError)}
      />
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (!userProfile) {
    return (
      <StartupErrorScreen
        onRetry={() => refetchProfile()}
        onLogout={handleLogout}
        errorDetail="Unable to load user profile. Please try again."
      />
    );
  }

  const userType = userProfile.userType;

  const rootRoute = createRootRoute({
    component: () => (
      <AppLayout>
        <Outlet />
      </AppLayout>
    ),
  });

  let indexRoute;
  let routes;

  if (userType === 'Secretary') {
    indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: SecretaryDashboardPage,
    });

    routes = [
      indexRoute,
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/payments',
        component: PaymentsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/complaints',
        component: ComplaintsAdminPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/expenditures',
        component: ExpendituresAdminPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/notices',
        component: NoticesPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/settings',
        component: SettingsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/notifications',
        component: NotificationsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/reports/payments/print',
        component: PaymentsReportPrintPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/reports/complaints/print',
        component: ComplaintsReportPrintPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/reports/expenditures/print',
        component: ExpendituresReportPrintPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/reports/notices/print',
        component: NoticesReportPrintPage,
      }),
    ];
  } else if (userType === 'Guard') {
    indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: GuardDashboardPage,
    });

    routes = [
      indexRoute,
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/visitor-requests',
        component: GuardVisitorRequestsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/visitor-requests/create',
        component: VisitorRequestCreatePage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/visitor-requests/$requestId',
        component: VisitorRequestDetailPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/notifications',
        component: NotificationsPage,
      }),
    ];
  } else {
    indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: FlatDashboardPage,
    });

    routes = [
      indexRoute,
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/maintenance',
        component: MaintenancePage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/complaints',
        component: ComplaintsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/notices',
        component: NoticesPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/visitor-requests',
        component: VisitorRequestsPage,
      }),
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/notifications',
        component: NotificationsPage,
      }),
    ];
  }

  const routeTree = rootRoute.addChildren(routes);
  const router = createRouter({ routeTree });

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <ActorProvider>
      <AuthenticatedApp />
    </ActorProvider>
  );
}
