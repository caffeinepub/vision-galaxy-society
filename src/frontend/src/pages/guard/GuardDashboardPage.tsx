import { useNavigate } from '@tanstack/react-router';
import { useGetAllVisitorRequests } from '../../hooks/useQueries';
import DashboardCard from '../../components/layout/DashboardCard';
import { DoorOpen, Bell, Plus } from 'lucide-react';

export default function GuardDashboardPage() {
  const navigate = useNavigate();
  const { data: visitorRequests = [] } = useGetAllVisitorRequests();

  const pendingCount = visitorRequests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Guard Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage visitor entries</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard
          title="Visitor Requests"
          description={`${pendingCount} pending approval`}
          icon={DoorOpen}
          action={{
            label: 'View All Requests',
            onClick: () => navigate({ to: '/visitor-requests' }),
          }}
        />

        <DashboardCard
          title="Create Request"
          description="Send new visitor approval request"
          icon={Plus}
          action={{
            label: 'Create Request',
            onClick: () => navigate({ to: '/visitor-requests/create' }),
          }}
        />

        <DashboardCard
          title="Notices"
          description="View society announcements"
          icon={Bell}
          action={{
            label: 'View Notices',
            onClick: () => navigate({ to: '/notices' }),
          }}
        />
      </div>
    </div>
  );
}
