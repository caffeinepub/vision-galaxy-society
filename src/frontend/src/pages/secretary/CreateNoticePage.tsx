import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useCreateNotice } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function CreateNoticePage() {
  const navigate = useNavigate();
  const createNoticeMutation = useCreateNotice();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const expiryTimestamp = hasExpiry && expiryDate 
        ? BigInt(new Date(expiryDate).getTime() * 1000000)
        : null;

      await createNoticeMutation.mutateAsync({
        title,
        message,
        expiryDate: expiryTimestamp,
      });

      toast.success('Notice created successfully!');
      navigate({ to: '/notices' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create notice');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Notice</h1>
        <p className="text-muted-foreground mt-1">Send an announcement to all residents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notice Details</CardTitle>
          <CardDescription>Fill in the information for the new notice</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter notice title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter notice message"
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasExpiry"
                checked={hasExpiry}
                onCheckedChange={(checked) => setHasExpiry(checked as boolean)}
              />
              <Label htmlFor="hasExpiry" className="cursor-pointer">
                Set expiry date
              </Label>
            </div>

            {hasExpiry && (
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createNoticeMutation.isPending}
              >
                {createNoticeMutation.isPending ? 'Creating...' : 'Create Notice'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/notices' })}
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
