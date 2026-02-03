import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetMaintenanceRecord } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear } from '../../utils/dates';
import { shouldShowOverdueNotice } from '../../utils/overdue';
import DashboardCard from '../../components/layout/DashboardCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, FileText, MessageSquare, Bell, DoorOpen, User, AlertCircle } from 'lucide-react';

export default function FlatDashboardPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: maintenanceRecord } = useGetMaintenanceRecord(
    flatNumber,
    getCurrentMonth(),
    getCurrentYear()
  );

  const showOverdue = maintenanceRecord && shouldShowOverdueNotice(maintenanceRecord.isPaid);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, Flat {flatNumber.toString()}</h1>
        <p className="text-muted-foreground mt-1">Manage your society activities</p>
      </div>

      {showOverdue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your maintenance payment for {getCurrentMonth()} is overdue. Please pay as soon as possible.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard
          title="Maintenance"
          description={maintenanceRecord?.isPaid ? 'Payment submitted' : 'Payment pending'}
          icon={CreditCard}
          variant={showOverdue ? 'warning' : maintenanceRecord?.isPaid ? 'success' : 'default'}
          action={{
            label: 'View Details',
            onClick: () => navigate({ to: '/maintenance' }),
          }}
        />

        <DashboardCard
          title="Expenditures"
          description="View monthly society expenses"
          icon={FileText}
          action={{
            label: 'View Expenditures',
            onClick: () => navigate({ to: '/expenditures' }),
          }}
        />

        <DashboardCard
          title="Complaints"
          description="Lodge and track complaints"
          icon={MessageSquare}
          action={{
            label: 'Manage Complaints',
            onClick: () => navigate({ to: '/complaints' }),
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

        <DashboardCard
          title="Visitor Requests"
          description="Approve or decline visitor entries"
          icon={DoorOpen}
          action={{
            label: 'View Requests',
            onClick: () => navigate({ to: '/my-visitor-requests' }),
          }}
        />

        <DashboardCard
          title="Profile"
          description="Manage your contact numbers"
          icon={User}
          action={{
            label: 'Edit Profile',
            onClick: () => navigate({ to: '/profile' }),
          }}
        />
      </div>
    </div>
  );
}
