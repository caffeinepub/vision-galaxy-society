import { useEffect } from 'react';
import { useGetMaintenanceStatusForAllFlats } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/dates';
import { triggerPrint } from '../../utils/print';

export default function PaymentsReportPrintPage() {
  const params = new URLSearchParams(window.location.search);
  const month = params.get('month') || '';
  const year = params.get('year') || '';

  const { data: flatStatuses = [], isLoading, error } = useGetMaintenanceStatusForAllFlats(month, BigInt(year));

  useEffect(() => {
    if (!isLoading && flatStatuses.length > 0) {
      setTimeout(() => triggerPrint(), 500);
    }
  }, [isLoading, flatStatuses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Error loading payment records: {String(error)}</p>
      </div>
    );
  }

  const paidCount = flatStatuses.filter(s => s.isPaid).length;
  const unpaidCount = flatStatuses.filter(s => !s.isPaid).length;

  return (
    <div className="p-8 max-w-5xl mx-auto print-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Report</h1>
        <p className="text-lg text-muted-foreground">{month} {year}</p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>Total Flats: <strong>{flatStatuses.length}</strong></div>
          <div>Paid: <strong className="text-green-600">{paidCount}</strong></div>
          <div>Unpaid: <strong className="text-red-600">{unpaidCount}</strong></div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flat Number</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>UPI Reference</TableHead>
            <TableHead>Payment Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flatStatuses.map((status, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium">Flat {status.flatNumber.toString()}</TableCell>
              <TableCell>
                <Badge variant={status.isPaid ? 'default' : 'destructive'}>
                  {status.isPaid ? 'Paid' : 'Unpaid'}
                </Badge>
              </TableCell>
              <TableCell>{status.upiRef || 'N/A'}</TableCell>
              <TableCell>
                {status.paymentTimestamp ? formatDate(status.paymentTimestamp) : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
