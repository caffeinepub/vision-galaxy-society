import { useNavigate } from '@tanstack/react-router';
import { useGetAllVisitorRequests, useGetWhatsappNumber } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DoorOpen, Plus, Info } from 'lucide-react';

export default function VisitorRequestsPage() {
  const navigate = useNavigate();
  const { data: visitorRequests = [] } = useGetAllVisitorRequests();
  const { data: whatsappNumber } = useGetWhatsappNumber();

  const sortedRequests = [...visitorRequests].sort((a, b) => Number(b.id) - Number(a.id));

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Pending': 'default',
      'Accepted': 'outline',
      'Declined': 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Visitor Requests</h1>
          <p className="text-muted-foreground mt-1">Manage visitor entry approvals</p>
        </div>
        <Button onClick={() => navigate({ to: '/visitor-requests/create' })}>
          <Plus className="h-4 w-4 mr-2" />
          Create Request
        </Button>
      </div>

      {whatsappNumber && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            WhatsApp requests will be sent from: {whatsappNumber}
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
            <div className="space-y-3">
              {sortedRequests.map(request => (
                <div
                  key={request.id.toString()}
                  onClick={() => navigate({ to: `/visitor-requests/${request.id}` })}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{request.visitorName}</h4>
                      <p className="text-sm text-muted-foreground">{request.purpose}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          Flat {request.flatNumber.toString()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {request.mobileNumber}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
