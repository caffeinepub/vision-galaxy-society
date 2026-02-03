import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetComplaintsByFlat, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

export default function ComplaintDetailPage() {
  const { complaintId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: complaints = [] } = useGetComplaintsByFlat(flatNumber);
  const complaint = complaints.find(c => c.id.toString() === complaintId);

  if (!complaint) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Complaint not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Open': 'destructive',
      'In Progress': 'default',
      'Resolved': 'outline',
      'Rejected': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/complaints' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Complaints
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{complaint.category}</CardTitle>
              <CardDescription>Complaint #{complaint.id.toString()}</CardDescription>
            </div>
            {getStatusBadge(complaint.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">{complaint.description}</p>
          </div>

          {complaint.priority && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Priority</h4>
              <Badge variant="outline">{complaint.priority}</Badge>
            </div>
          )}

          <Separator />

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Status</h4>
            <p className="text-sm">{complaint.status}</p>
          </div>

          {complaint.resolutionNote && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Resolution Note</h4>
                <p className="text-sm text-muted-foreground">{complaint.resolutionNote}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
