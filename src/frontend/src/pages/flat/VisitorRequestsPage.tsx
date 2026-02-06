import { useGetCallerUserProfile, useGetVisitorRequestsByFlat, useUpdateVisitorRequestStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FlatVisitorRequestsPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: requests = [], isLoading } = useGetVisitorRequestsByFlat(flatNumber);
  const updateStatusMutation = useUpdateVisitorRequestStatus();

  const handleAccept = async (requestId: bigint) => {
    try {
      await updateStatusMutation.mutateAsync({
        requestId,
        status: 'Approved',
      });
      toast.success('Visitor request approved!');
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
                    <span className="text-muted-foreground">Contact Number:</span>
                    <span className="font-medium">{request.mobileNumber}</span>
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(request.id)}
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
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
