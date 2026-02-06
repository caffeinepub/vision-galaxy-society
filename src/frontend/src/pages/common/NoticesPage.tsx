import { useNavigate } from '@tanstack/react-router';
import { useGetAllNotices, useGetCallerUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Download, Printer } from 'lucide-react';
import { formatDate } from '../../utils/dates';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { openPrintView } from '../../utils/print';

export default function NoticesPage() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: notices = [] } = useGetAllNotices();

  const sortedNotices = [...notices].sort((a, b) => Number(b.id) - Number(a.id));
  const isSecretary = userProfile?.userType === 'Secretary';

  const handleExportCSV = () => {
    const csvData = sortedNotices.map(notice => ({
      'ID': notice.id.toString(),
      'Title': notice.title,
      'Message': notice.message,
      'Expiry Date': notice.expiryDate ? formatDate(notice.expiryDate) : 'No expiry',
    }));

    const csv = generateCSV(csvData, ['ID', 'Title', 'Message', 'Expiry Date']);
    downloadCSV(csv, `notices-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    openPrintView('/reports/notices/print');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notices</h1>
          <p className="text-muted-foreground mt-1">Society announcements and updates</p>
        </div>
        <div className="flex gap-2">
          {isSecretary && (
            <>
              <Button onClick={handleExportCSV} variant="outline" disabled={sortedNotices.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={handlePrint} variant="outline" disabled={sortedNotices.length === 0}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button onClick={() => navigate({ to: '/notices/create' })}>
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notices</CardTitle>
          <CardDescription>
            {sortedNotices.length} active notice{sortedNotices.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedNotices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No notices available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedNotices.map(notice => (
                <div
                  key={notice.id.toString()}
                  onClick={() => navigate({ to: `/notices/${notice.id}` })}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{notice.title}</h4>
                    {notice.expiryDate && (
                      <Badge variant="outline" className="text-xs">
                        Expires {formatDate(notice.expiryDate)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {notice.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
