import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateVisitorRequest, useGetFlatMobileNumbers } from '../../hooks/useQueries';
import { buildWhatsappDeepLink } from '../../utils/whatsapp';
import { isValidFlatNumber } from '../../utils/flatNumbers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import FlatNumberPicker from '../../components/FlatNumberPicker';

export default function VisitorRequestCreatePage() {
  const navigate = useNavigate();
  const createVisitorRequestMutation = useCreateVisitorRequest();

  const [visitorName, setVisitorName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [flatNumber, setFlatNumber] = useState<string>('');
  const [selectedMobile, setSelectedMobile] = useState('');

  // Only fetch mobile numbers when flatNumber is valid
  const shouldFetch = flatNumber && isValidFlatNumber(flatNumber);
  const { data: mobileNumbers = [] } = useGetFlatMobileNumbers(
    shouldFetch ? BigInt(flatNumber) : BigInt(0)
  );

  // Reset selected mobile when flat number changes
  useEffect(() => {
    setSelectedMobile('');
  }, [flatNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!visitorName || !purpose || !flatNumber || !selectedMobile) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidFlatNumber(flatNumber)) {
      toast.error('Please enter a valid flat number');
      return;
    }

    try {
      const requestId = await createVisitorRequestMutation.mutateAsync({
        visitorName,
        purpose,
        flatNumber: BigInt(flatNumber),
        mobileNumber: selectedMobile,
      });

      const message = `Visitor Entry Request\n\nVisitor: ${visitorName}\nPurpose: ${purpose}\nFlat: ${flatNumber}\nRequest ID: ${requestId}\n\nPlease reply with ACCEPT or DECLINE`;
      const whatsappLink = buildWhatsappDeepLink(selectedMobile, message);

      toast.success('Request created! Opening WhatsApp...');
      
      setTimeout(() => {
        window.open(whatsappLink, '_blank');
        navigate({ to: '/visitor-requests' });
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create visitor request');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Visitor Request</h1>
        <p className="text-muted-foreground mt-1">Send approval request to flat owner</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          After creating the request, a WhatsApp message will be prepared for you to send to the flat owner.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Visitor Details</CardTitle>
          <CardDescription>Enter information about the visitor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitorName">Visitor Name</Label>
              <Input
                id="visitorName"
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder="Enter visitor's name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Visit</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Delivery, Guest, Service"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number</Label>
              <FlatNumberPicker
                id="flatNumber"
                value={flatNumber}
                onChange={setFlatNumber}
                placeholder="Type or select flat number"
              />
            </div>

            {shouldFetch && mobileNumbers.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Contact Number</Label>
                <Select value={selectedMobile} onValueChange={setSelectedMobile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contact number" />
                  </SelectTrigger>
                  <SelectContent>
                    {mobileNumbers.map((number, index) => (
                      <SelectItem key={index} value={number}>
                        {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {shouldFetch && mobileNumbers.length === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  No mobile numbers registered for Flat {flatNumber}. Please ask the resident to add their contact numbers.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createVisitorRequestMutation.isPending || !selectedMobile}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {createVisitorRequestMutation.isPending ? 'Creating...' : 'Create & Send via WhatsApp'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/visitor-requests' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
