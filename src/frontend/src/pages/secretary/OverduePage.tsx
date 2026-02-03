import { useState } from 'react';
import { useGetOverdueFlats } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear, getAllMonths, getYearRange } from '../../utils/dates';
import { isOverduePeriod } from '../../utils/overdue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Info } from 'lucide-react';

export default function OverduePage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const { data: overdueFlats = [] } = useGetOverdueFlats(selectedMonth, selectedYear);

  const isCurrentPeriodOverdue = selectedMonth === getCurrentMonth() && selectedYear === getCurrentYear() && isOverduePeriod();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Overdue Payments</h1>
        <p className="text-muted-foreground mt-1">Track flats with pending maintenance payments</p>
      </div>

      {!isOverduePeriod() && selectedMonth === getCurrentMonth() && selectedYear === getCurrentYear() && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Overdue reminders become active from the 6th of each month. Current date is before the 6th.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>Choose month and year to view overdue flats</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Overdue Flats</CardTitle>
          <CardDescription>
            {overdueFlats.length} flat{overdueFlats.length !== 1 ? 's' : ''} with pending payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueFlats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No overdue payments for this period
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {overdueFlats.map(flatNumber => (
                <div 
                  key={flatNumber.toString()} 
                  className="flex items-center justify-between p-3 border rounded-lg bg-destructive/5"
                >
                  <span className="font-medium">Flat {flatNumber.toString()}</span>
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
