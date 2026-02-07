import { useState } from 'react';
import { useGetMaintenanceStatusForAllFlats } from '../../hooks/useQueries';
import { useActorContext } from '../../hooks/useActorContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Loader2 } from 'lucide-react';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { openPrintView } from '../../utils/print';
import { formatDate } from '../../utils/dates';
import { getValidFlatNumbers } from '../../utils/flatNumbers';
import { QueryStateCard } from '../../components/QueryStateCard';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function PaymentsPage() {
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { actor, actorFetching } = useActorContext();
  const { data: backendStatuses = [], isLoading, error, refetch } = useGetMaintenanceStatusForAllFlats(selectedMonth, BigInt(selectedYear));

  // Generate complete flat list from frontend rules
  const allFlatNumbers = getValidFlatNumbers();
  
  // Merge backend data with complete flat list
  const flatStatuses = allFlatNumbers.map(flatNum => {
    const backendStatus = backendStatuses.find(s => s.flatNumber.toString() === flatNum);
    return {
      flatNumber: BigInt(flatNum),
      isPaid: backendStatus?.isPaid || false,
      upiRef: backendStatus?.upiRef || null,
      paymentTimestamp: backendStatus?.paymentTimestamp || null,
    };
  });

  const handleExportCSV = () => {
    const csvData = flatStatuses.map(status => ({
      'Flat Number': status.flatNumber.toString(),
      'Month': selectedMonth,
      'Year': selectedYear.toString(),
      'Status': status.isPaid ? 'Paid' : 'Unpaid',
      'UPI Reference': status.upiRef || 'N/A',
      'Payment Date': status.paymentTimestamp ? formatDate(status.paymentTimestamp) : 'N/A',
    }));

    const csv = generateCSV(csvData, ['Flat Number', 'Month', 'Year', 'Status', 'UPI Reference', 'Payment Date']);
    downloadCSV(csv, `payments-${selectedMonth}-${selectedYear}.csv`);
  };

  const handlePrint = () => {
    openPrintView(`/reports/payments/print?month=${selectedMonth}&year=${selectedYear}`);
  };

  const paidCount = flatStatuses.filter(s => s.isPaid).length;
  const unpaidCount = flatStatuses.filter(s => !s.isPaid).length;
  const totalFlats = flatStatuses.length;

  // Show connecting state while actor is initializing
  if (!actor || actorFetching) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground mt-1">Review and track maintenance payments</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Connecting to backend...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Review and track maintenance payments</p>
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

        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={isLoading || flatStatuses.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" disabled={isLoading || flatStatuses.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Flats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFlats}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
          </CardContent>
        </Card>
      </div>

      <QueryStateCard
        isLoading={isLoading}
        isError={!!error}
        error={error}
        isEmpty={false}
        onRetry={() => refetch()}
        title="Payment Records"
        description={`${selectedMonth} ${selectedYear}`}
      >
        <Card>
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>
              {selectedMonth} {selectedYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
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
                      <TableCell className="text-muted-foreground">
                        {status.upiRef || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {status.paymentTimestamp ? formatDate(status.paymentTimestamp) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </QueryStateCard>
    </div>
  );
}
