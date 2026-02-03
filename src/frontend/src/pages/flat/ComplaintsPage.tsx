import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile, useGetComplaintsByFlat, useLodgeComplaint } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: complaints = [] } = useGetComplaintsByFlat(flatNumber);
  const lodgeComplaintMutation = useLodgeComplaint();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('Medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await lodgeComplaintMutation.mutateAsync({
        flatNumber,
        category,
        description,
        priority,
      });

      toast.success('Complaint lodged successfully!');
      setCategory('');
      setDescription('');
      setPriority('Medium');
    } catch (error: any) {
      toast.error(error.message || 'Failed to lodge complaint');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Complaints</h1>
        <p className="text-muted-foreground mt-1">Lodge and track your complaints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lodge New Complaint</CardTitle>
          <CardDescription>Submit a complaint to the society management</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Parking">Parking</SelectItem>
                  <SelectItem value="Noise">Noise</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your complaint in detail"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={lodgeComplaintMutation.isPending}
            >
              {lodgeComplaintMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Complaints</CardTitle>
          <CardDescription>
            {complaints.length} complaint{complaints.length !== 1 ? 's' : ''} on record
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complaints.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No complaints yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map(complaint => (
                <div
                  key={complaint.id.toString()}
                  onClick={() => navigate({ to: `/complaints/${complaint.id}` })}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{complaint.category}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {complaint.description}
                      </p>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                  {complaint.priority && (
                    <Badge variant="outline" className="text-xs">
                      {complaint.priority} Priority
                    </Badge>
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
