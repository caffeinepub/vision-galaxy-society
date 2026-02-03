import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
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
import AppLayout from './components/layout/AppLayout';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity || !userProfile) {
    return <LoginPage />;
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
]);

const router = createRouter({ routeTree });

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
