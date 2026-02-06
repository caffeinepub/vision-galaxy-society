import { useEffect } from 'react';
import { useGetAllNotices } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { formatDate } from '../../utils/dates';
import { triggerPrint } from '../../utils/print';

export default function NoticesReportPrintPage() {
  const { data: notices = [], isLoading, error } = useGetAllNotices();

  const sortedNotices = [...notices].sort((a, b) => Number(b.id) - Number(a.id));

  useEffect(() => {
    if (!isLoading && sortedNotices.length > 0) {
      setTimeout(() => triggerPrint(), 500);
    }
  }, [isLoading, sortedNotices.length]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-destructive">Error loading notices: {String(error)}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto print-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notices Report</h1>
        <p className="text-lg text-muted-foreground">Active Notices ({sortedNotices.length})</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Expiry Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedNotices.map((notice) => (
            <TableRow key={notice.id.toString()}>
              <TableCell className="font-medium">#{notice.id.toString()}</TableCell>
              <TableCell className="font-medium">{notice.title}</TableCell>
              <TableCell className="max-w-md">{notice.message}</TableCell>
              <TableCell>
                {notice.expiryDate ? formatDate(notice.expiryDate) : 'No expiry'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
