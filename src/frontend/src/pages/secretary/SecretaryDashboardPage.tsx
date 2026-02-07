import { useNavigate } from '@tanstack/react-router';
import { useGetOverdueFlats } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear } from '../../utils/dates';
import { isOverduePeriod } from '../../utils/overdue';
import DashboardCard from '../../components/layout/DashboardCard';
import { CreditCard, AlertCircle, FileText, MessageSquare, Bell, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeError } from '../../utils/sanitizeError';

export default function SecretaryDashboardPage() {
  const navigate = useNavigate();
  const currentMonth = getCurrentMonth();
  const currentYear = getCurrentYear();
  const showOverdueCard = isOverduePeriod();

  const { 
    data: overdueFlats = [], 
    isLoading: overdueLoading,
    error: overdueError,
    refetch: refetchOverdue
  } = useGetOverdueFlats(currentMonth, currentYear, showOverdueCard);

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

        {showOverdueCard && (
          <DashboardCard
            title="Overdue"
            description={
              overdueLoading 
                ? 'Loading overdue flats...' 
                : overdueError 
                ? 'Error loading overdue data'
                : `${overdueFlats.length} flats overdue`
            }
            icon={AlertCircle}
            variant={overdueFlats.length > 0 ? 'warning' : 'default'}
            action={{
              label: 'View Overdue',
              onClick: () => navigate({ to: '/overdue' }),
            }}
          >
            {overdueError && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription className="text-xs flex items-center justify-between gap-2">
                  <span>{sanitizeError(overdueError)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      refetchOverdue();
                    }}
                    className="h-6 px-2"
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </DashboardCard>
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
