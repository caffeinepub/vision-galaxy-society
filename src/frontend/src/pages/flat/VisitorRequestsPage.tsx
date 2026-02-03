import { useGetCallerUserProfile, useGetVisitorRequestsForFlat, useUpdateVisitorRequestStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DoorOpen, Check, X, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function VisitorRequestsPage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: visitorRequests = [] } = useGetVisitorRequestsForFlat(flatNumber);
  const updateVisitorRequestStatusMutation = useUpdateVisitorRequestStatus();

  const pendingRequests = visitorRequests.filter(r => r.status === 'Pending');
  const sortedRequests = [...visitorRequests].sort((a, b) => Number(b.id) - Number(a.id));

  const handleAccept = async (requestId: bigint) => {
    try {
      await updateVisitorRequestStatusMutation.mutateAsync({
        requestId,
        status: 'Accepted',
      });
      toast.success('Visitor request accepted');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept request');
    }
  };

  const handleDecline = async (requestId: bigint) => {
    try {
      await updateVisitorRequestStatusMutation.mutateAsync({
        requestId,
        status: 'Declined',
      });
      toast.success('Visitor request declined');
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline request');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Pending': 'default',
      'Accepted': 'outline',
      'Declined': 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Visitor Requests</h1>
        <p className="text-muted-foreground mt-1">Approve or decline visitor entries</p>
      </div>

      {pendingRequests.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have {pendingRequests.length} pending visitor request{pendingRequests.length !== 1 ? 's' : ''} awaiting your response.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>
            {sortedRequests.length} visitor request{sortedRequests.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DoorOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No visitor requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRequests.map(request => (
                <div
                  key={request.id.toString()}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.visitorName}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{request.purpose}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Contact: {request.mobileNumber}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  {request.status === 'Pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(request.id)}
                        disabled={updateVisitorRequestStatusMutation.isPending}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecline(request.id)}
                        disabled={updateVisitorRequestStatusMutation.isPending}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
