import { useState } from 'react';
import { useGetCallerUserProfile, useGetMaintenanceRecord, useRecordPayment, useGetUpiId } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear, getAllMonths, getYearRange } from '../../utils/dates';
import { buildUpiDeepLink } from '../../utils/upi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function MaintenancePage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [upiRef, setUpiRef] = useState('');
  const [paymentDate, setPaymentDate] = useState('');

  const { data: maintenanceRecord } = useGetMaintenanceRecord(flatNumber, selectedMonth, selectedYear);
  const { data: upiId } = useGetUpiId();
  const recordPaymentMutation = useRecordPayment();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!upiRef || !paymentDate) {
      toast.error('Please enter both UPI reference and payment date');
      return;
    }

    try {
      const timestamp = BigInt(new Date(paymentDate).getTime() * 1000000);
      await recordPaymentMutation.mutateAsync({
        flatNumber,
        month: selectedMonth,
        year: selectedYear,
        upiRef,
        timestamp,
      });

      toast.success('Payment recorded successfully!');
      setUpiRef('');
      setPaymentDate('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    }
  };

  const upiLink = buildUpiDeepLink(upiId || '', 1500, `Maintenance ${selectedMonth} ${selectedYear}`);

  const getStatusBadge = () => {
    if (!maintenanceRecord) {
      return <Badge variant="outline">No Record</Badge>;
    }
    if (maintenanceRecord.isPaid) {
      return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
    }
    return <Badge variant="destructive"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Maintenance Payment</h1>
        <p className="text-muted-foreground mt-1">Manage your monthly maintenance contributions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>Choose month and year to view or pay maintenance</CardDescription>
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

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Payment Status</p>
              <p className="text-xs text-muted-foreground">
                {selectedMonth} {selectedYear.toString()}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>

      {!maintenanceRecord?.isPaid && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pay via UPI</CardTitle>
              <CardDescription>Click below to open your UPI app and make payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Amount: ₹1,500 • UPI ID: {upiId || 'Not configured'}
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                size="lg"
                disabled={!upiId}
                onClick={() => window.location.href = upiLink}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Pay ₹1,500 via UPI
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Payment</CardTitle>
              <CardDescription>After payment, enter your transaction details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="upiRef">UPI Transaction Reference / UTR</Label>
                  <Input
                    id="upiRef"
                    value={upiRef}
                    onChange={(e) => setUpiRef(e.target.value)}
                    placeholder="Enter transaction ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date & Time</Label>
                  <Input
                    id="paymentDate"
                    type="datetime-local"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={recordPaymentMutation.isPending}
                >
                  {recordPaymentMutation.isPending ? 'Recording...' : 'Submit Payment Record'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      {maintenanceRecord?.isPaid && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="text-sm font-medium">Paid</span>
            </div>
            {maintenanceRecord.upiRef && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Transaction Ref</span>
                <span className="text-sm font-mono">{maintenanceRecord.upiRef}</span>
              </div>
            )}
            {maintenanceRecord.paymentTimestamp && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Date</span>
                <span className="text-sm">{new Date(Number(maintenanceRecord.paymentTimestamp / BigInt(1000000))).toLocaleString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
