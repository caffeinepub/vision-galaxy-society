import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllVisitorRequests } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default function VisitorRequestDetailPage() {
  const { requestId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: visitorRequests = [] } = useGetAllVisitorRequests();
  
  const request = visitorRequests.find(r => r.id.toString() === requestId);

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Visitor request not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Pending': 'default',
      'Accepted': 'outline',
      'Declined': 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/visitor-requests' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Requests
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{request.visitorName}</CardTitle>
              <CardDescription>Request #{request.id.toString()}</CardDescription>
            </div>
            {getStatusBadge(request.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Purpose</h4>
            <p className="text-sm text-muted-foreground">{request.purpose}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Flat Number</h4>
            <Badge variant="outline">Flat {request.flatNumber.toString()}</Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Contact Number</h4>
            <p className="text-sm font-mono">{request.mobileNumber}</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status</h4>
            <p className="text-sm">{request.status}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
