import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllNotices } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { formatDate } from '../../utils/dates';

export default function NoticeDetailPage() {
  const { noticeId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { data: notices = [] } = useGetAllNotices();
  
  const notice = notices.find(n => n.id.toString() === noticeId);

  if (!notice) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Notice not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/notices' })}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Notices
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{notice.title}</CardTitle>
              <CardDescription>Notice #{notice.id.toString()}</CardDescription>
            </div>
            {notice.expiryDate && (
              <Badge variant="outline">
                Expires {formatDate(notice.expiryDate)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground whitespace-pre-wrap">{notice.message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
