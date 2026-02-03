import { useState } from 'react';
import { useGetAllMaintenanceRecords } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear, getAllMonths, getYearRange } from '../../utils/dates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Clock } from 'lucide-react';

export default function PaymentsPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const { data: maintenanceRecords = [] } = useGetAllMaintenanceRecords(selectedMonth, selectedYear);

  const allFlats = Array.from({ length: 115 }, (_, i) => BigInt(i + 1));
  const recordsMap = new Map(maintenanceRecords.map(r => [r.flatNumber.toString(), r]));

  const flatsWithStatus = allFlats.map(flatNumber => ({
    flatNumber,
    record: recordsMap.get(flatNumber.toString()),
    isPaid: recordsMap.get(flatNumber.toString())?.isPaid || false,
  }));

  const filteredFlats = flatsWithStatus.filter(flat => {
    if (statusFilter === 'paid') return flat.isPaid;
    if (statusFilter === 'pending') return !flat.isPaid;
    return true;
  });

  const paidCount = flatsWithStatus.filter(f => f.isPaid).length;
  const pendingCount = flatsWithStatus.length - paidCount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Review and track maintenance payments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Flats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flatsWithStatus.length}</div>
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select period and status to filter payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllMonths().map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(BigInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearRange().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            Showing {filteredFlats.length} of {flatsWithStatus.length} flats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flat Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transaction Ref</TableHead>
                  <TableHead>Payment Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlats.map(flat => (
                  <TableRow key={flat.flatNumber.toString()}>
                    <TableCell className="font-medium">Flat {flat.flatNumber.toString()}</TableCell>
                    <TableCell>
                      {flat.isPaid ? (
                        <Badge className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {flat.record?.upiRef ? (
                        <span className="font-mono text-sm">{flat.record.upiRef}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {flat.record?.paymentTimestamp ? (
                        <span className="text-sm">
                          {new Date(Number(flat.record.paymentTimestamp / BigInt(1000000))).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
