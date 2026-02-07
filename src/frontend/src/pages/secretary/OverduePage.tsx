import { useState } from 'react';
import { useGetOverdueFlats, useNotifyOverdueFlats } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { QueryStateCard } from '../../components/QueryStateCard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - i);

export default function OverduePage() {
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: overdueFlats = [], isLoading, error, refetch } = useGetOverdueFlats(selectedMonth, BigInt(selectedYear));
  const notifyMutation = useNotifyOverdueFlats();

  const handleNotify = async () => {
    try {
      await notifyMutation.mutateAsync({
        month: selectedMonth,
        year: BigInt(selectedYear),
      });
      toast.success(`Notifications sent to ${overdueFlats.length} overdue flats`);
    } catch (err) {
      toast.error('Failed to send notifications: ' + String(err));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overdue Payments</h1>
        <p className="text-muted-foreground mt-1">Track and notify flats with pending maintenance payments</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Year</label>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleNotify} 
          disabled={notifyMutation.isPending || overdueFlats.length === 0}
          variant="default"
        >
          <Bell className="h-4 w-4 mr-2" />
          {notifyMutation.isPending ? 'Sending...' : 'Notify All'}
        </Button>
      </div>

      <QueryStateCard
        isLoading={isLoading}
        isError={!!error}
        error={error}
        isEmpty={overdueFlats.length === 0}
        emptyMessage={`No overdue payments for ${selectedMonth} ${selectedYear}`}
        onRetry={refetch}
        title="Overdue Flats"
        description={`${overdueFlats.length} flats with pending payments`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overdue Flats</CardTitle>
            <CardDescription>
              {overdueFlats.length} flats with pending payments for {selectedMonth} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat Number</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueFlats.map((flatNumber) => (
                  <TableRow key={flatNumber.toString()}>
                    <TableCell className="font-medium">Flat {flatNumber.toString()}</TableCell>
                    <TableCell>
                      <span className="text-destructive font-medium">Overdue</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </QueryStateCard>
    </div>
  );
}
