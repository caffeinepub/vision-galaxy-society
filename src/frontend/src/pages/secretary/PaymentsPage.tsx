import { useState } from 'react';
import { useGetAllMaintenanceRecords } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Loader2 } from 'lucide-react';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { openPrintView } from '../../utils/print';
import { formatDate } from '../../utils/dates';

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

  const { data: records = [], isLoading, error } = useGetAllMaintenanceRecords(selectedMonth, BigInt(selectedYear));

  const handleExportCSV = () => {
    const csvData = records.map(record => ({
      'Flat Number': record.flatNumber.toString(),
      'Month': record.month,
      'Year': record.year.toString(),
      'Status': record.isPaid ? 'Paid' : 'Unpaid',
      'UPI Reference': record.upiRef || 'N/A',
      'Payment Date': record.paymentTimestamp ? formatDate(record.paymentTimestamp) : 'N/A',
    }));

    const csv = generateCSV(csvData, ['Flat Number', 'Month', 'Year', 'Status', 'UPI Reference', 'Payment Date']);
    downloadCSV(csv, `payments-${selectedMonth}-${selectedYear}.csv`);
  };

  const handlePrint = () => {
    openPrintView(`/reports/payments/print?month=${selectedMonth}&year=${selectedYear}`);
  };

  const paidCount = records.filter(r => r.isPaid).length;
  const unpaidCount = records.filter(r => !r.isPaid).length;

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
          <Button onClick={handleExportCSV} variant="outline" disabled={isLoading || records.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" disabled={isLoading || records.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">Error loading payment records: {String(error)}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Flats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            {selectedMonth} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No payment records found for {selectedMonth} {selectedYear}</p>
            </div>
          ) : (
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
                  {records.map((record, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">Flat {record.flatNumber.toString()}</TableCell>
                      <TableCell>
                        <Badge variant={record.isPaid ? 'default' : 'destructive'}>
                          {record.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.upiRef || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.paymentTimestamp ? formatDate(record.paymentTimestamp) : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
