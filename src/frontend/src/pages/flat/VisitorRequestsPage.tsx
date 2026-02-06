import { useState } from 'react';
import { useGetCallerUserProfile, useGetVisitorRequestsByFlat, useUpdateVisitorRequestStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { isValidFlatNumber } from '../../utils/flatNumbers';

export default function FlatVisitorRequestsPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: requests = [], isLoading } = useGetVisitorRequestsByFlat(flatNumber);
  const updateStatusMutation = useUpdateVisitorRequestStatus();

  const [flatNumberInputs, setFlatNumberInputs] = useState<Record<string, string>>({});

  const handleFlatNumberChange = (requestId: string, value: string) => {
    setFlatNumberInputs(prev => ({
      ...prev,
      [requestId]: value
    }));
  };

  const handleAccept = async (requestId: bigint, requestFlatNumber: bigint) => {
    const requestIdStr = requestId.toString();
    const inputFlatNumber = flatNumberInputs[requestIdStr];

    if (!inputFlatNumber || inputFlatNumber.trim() === '') {
      toast.error('Please enter the flat number');
      return;
    }

    if (!isValidFlatNumber(inputFlatNumber)) {
      toast.error('Invalid flat number. Must be within valid range (e.g., 101-523)');
      return;
    }

    if (BigInt(inputFlatNumber) !== requestFlatNumber) {
      toast.error('Flat number must match the request');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        requestId,
        status: 'Approved',
      });
      toast.success('Visitor request approved!');
      // Clear the input after successful approval
      setFlatNumberInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[requestIdStr];
        return newInputs;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve request');
    }
  };

  const handleDecline = async (requestId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({
        requestId,
        status: 'Declined',
      });
      toast.success('Visitor request declined');
      // Clear the input after declining
      const requestIdStr = requestId.toString();
      setFlatNumberInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[requestIdStr];
        return newInputs;
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'Declined':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading visitor requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visitor Requests</h1>
        <p className="text-muted-foreground mt-1">Approve or decline visitor entry requests</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No visitor requests for your flat
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{request.visitorName}</CardTitle>
                    <CardDescription>{request.purpose}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat Number:</span>
                    <span className="font-medium">{request.flatNumber.toString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact Number:</span>
                    <span className="font-medium">{request.mobileNumber}</span>
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`flat-${request.id}`}>Confirm Flat Number</Label>
                      <Input
                        id={`flat-${request.id}`}
                        type="text"
                        placeholder="Enter flat number (e.g., 101)"
                        value={flatNumberInputs[request.id.toString()] || ''}
                        onChange={(e) => handleFlatNumberChange(request.id.toString(), e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAccept(request.id, request.flatNumber)}
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleDecline(request.id)}
                        disabled={updateStatusMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
