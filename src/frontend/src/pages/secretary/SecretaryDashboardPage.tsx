import { useNavigate } from '@tanstack/react-router';
import { useGetOverdueFlats } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear } from '../../utils/dates';
import { isOverduePeriod } from '../../utils/overdue';
import DashboardCard from '../../components/layout/DashboardCard';
import { CreditCard, AlertCircle, FileText, MessageSquare, Bell, Settings } from 'lucide-react';

export default function SecretaryDashboardPage() {
  const navigate = useNavigate();
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();

  const { data: overdueFlats = [] } = useGetOverdueFlats(currentMonth, currentYear);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Secretary Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage society operations</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Payments"
          description="Review maintenance payments"
          icon={CreditCard}
          action={{
            label: 'Review Payments',
            onClick: () => navigate({ to: '/payments' }),
          }}
        />

        {isOverduePeriod() && (
          <DashboardCard
            title="Overdue"
            description={`${overdueFlats.length} flats overdue`}
            icon={AlertCircle}
            variant={overdueFlats.length > 0 ? 'warning' : 'default'}
            action={{
              label: 'View Overdue',
              onClick: () => navigate({ to: '/overdue' }),
            }}
          />
        )}

        <DashboardCard
          title="Expenditures"
          description="Manage monthly expenses"
          icon={FileText}
          action={{
            label: 'Manage Expenditures',
            onClick: () => navigate({ to: '/expenditures/admin' }),
          }}
        />

        <DashboardCard
          title="Complaints"
          description="Review and resolve complaints"
          icon={MessageSquare}
          action={{
            label: 'View Complaints',
            onClick: () => navigate({ to: '/complaints/admin' }),
          }}
        />

        <DashboardCard
          title="Notices"
          description="Send announcements to residents"
          icon={Bell}
          action={{
            label: 'Manage Notices',
            onClick: () => navigate({ to: '/notices' }),
          }}
        />

        <DashboardCard
          title="Settings"
          description="Configure UPI and WhatsApp"
          icon={Settings}
          action={{
            label: 'Open Settings',
            onClick: () => navigate({ to: '/settings' }),
          }}
        />
      </div>
    </div>
  );
}
