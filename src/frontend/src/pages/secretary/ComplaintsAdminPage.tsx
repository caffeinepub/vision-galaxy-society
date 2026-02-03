import { useState } from 'react';
import { useGetAllComplaints, useUpdateComplaintStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function ComplaintsAdminPage() {
  const { data: complaints = [] } = useGetAllComplaints();
  const updateComplaintStatusMutation = useUpdateComplaintStatus();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [flatFilter, setFlatFilter] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  const filteredComplaints = complaints.filter(complaint => {
    if (statusFilter !== 'all' && complaint.status !== statusFilter) return false;
    if (flatFilter !== 'all' && complaint.flatNumber.toString() !== flatFilter) return false;
    return true;
  });

  const handleUpdateStatus = async () => {
    if (!selectedComplaint || !newStatus) {
      toast.error('Please select a status');
      return;
    }

    try {
      await updateComplaintStatusMutation.mutateAsync({
        complaintId: selectedComplaint.id,
        newStatus,
        resolutionNote: resolutionNote || null,
      });

      toast.success('Complaint status updated successfully!');
      setSelectedComplaint(null);
      setNewStatus('');
      setResolutionNote('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update complaint status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'Open': 'destructive',
      'In Progress': 'default',
      'Resolved': 'outline',
      'Rejected': 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const uniqueFlats = Array.from(new Set(complaints.map(c => c.flatNumber.toString()))).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complaint Management</h1>
        <p className="text-muted-foreground mt-1">Review and resolve resident complaints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Flat Number</Label>
              <Select value={flatFilter} onValueChange={setFlatFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Flats</SelectItem>
                  {uniqueFlats.map(flat => (
                    <SelectItem key={flat} value={flat}>Flat {flat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complaints</CardTitle>
          <CardDescription>
            Showing {filteredComplaints.length} of {complaints.length} complaints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No complaints found
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map(complaint => (
                <Dialog key={complaint.id.toString()}>
                  <DialogTrigger asChild>
                    <div
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setNewStatus(complaint.status);
                        setResolutionNote(complaint.resolutionNote || '');
                      }}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{complaint.category}</h4>
                            <Badge variant="outline" className="text-xs">
                              Flat {complaint.flatNumber.toString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{complaint.category}</DialogTitle>
                      <DialogDescription>
                        Complaint from Flat {complaint.flatNumber.toString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <p className="text-sm text-muted-foreground">{complaint.description}</p>
                      </div>

                      {complaint.priority && (
                        <div className="space-y-2">
                          <Label>Priority</Label>
                          <Badge variant="outline">{complaint.priority}</Badge>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Update Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Resolution Note</Label>
                        <Textarea
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="Add a note about the resolution"
                          rows={3}
                        />
                      </div>

                      <Button 
                        onClick={handleUpdateStatus}
                        disabled={updateComplaintStatusMutation.isPending}
                        className="w-full"
                      >
                        {updateComplaintStatusMutation.isPending ? 'Updating...' : 'Update Complaint'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
