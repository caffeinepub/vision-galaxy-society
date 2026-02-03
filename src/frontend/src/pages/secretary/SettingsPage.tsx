import { useState, useEffect } from 'react';
import { useGetUpiId, useSetUpiId, useGetWhatsappNumber, useSetWhatsappNumber } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: currentUpiId } = useGetUpiId();
  const { data: currentWhatsappNumber } = useGetWhatsappNumber();
  const setUpiIdMutation = useSetUpiId();
  const setWhatsappNumberMutation = useSetWhatsappNumber();

  const [upiId, setUpiId] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (currentUpiId) setUpiId(currentUpiId);
  }, [currentUpiId]);

  useEffect(() => {
    if (currentWhatsappNumber) setWhatsappNumber(currentWhatsappNumber);
  }, [currentWhatsappNumber]);

  const handleSaveUpiId = async () => {
    if (!upiId) {
      toast.error('Please enter a UPI ID');
      return;
    }

    try {
      await setUpiIdMutation.mutateAsync(upiId);
      toast.success('UPI ID updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update UPI ID');
    }
  };

  const handleSaveWhatsappNumber = async () => {
    if (!whatsappNumber) {
      toast.error('Please enter a WhatsApp number');
      return;
    }

    try {
      await setWhatsappNumberMutation.mutateAsync(whatsappNumber);
      toast.success('WhatsApp number updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update WhatsApp number');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure payment and communication settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>UPI Payment Settings</CardTitle>
          <CardDescription>
            Configure the UPI ID where maintenance payments will be received
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
            />
          </div>
          <Button 
            onClick={handleSaveUpiId}
            disabled={setUpiIdMutation.isPending}
          >
            {setUpiIdMutation.isPending ? 'Saving...' : 'Save UPI ID'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Settings</CardTitle>
          <CardDescription>
            Configure the WhatsApp number for visitor approval requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
            <Input
              id="whatsappNumber"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+919876543210"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +91 for India)
            </p>
          </div>
          <Button 
            onClick={handleSaveWhatsappNumber}
            disabled={setWhatsappNumberMutation.isPending}
          >
            {setWhatsappNumberMutation.isPending ? 'Saving...' : 'Save WhatsApp Number'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
