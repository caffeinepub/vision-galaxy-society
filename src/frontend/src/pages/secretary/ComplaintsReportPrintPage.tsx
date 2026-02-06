import { useEffect } from 'react';
import { useGetAllComplaints } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { triggerPrint } from '../../utils/print';

export default function ComplaintsReportPrintPage() {
  const { data: complaints = [], isLoading, error } = useGetAllComplaints();

  useEffect(() => {
    if (!isLoading && complaints.length > 0) {
      setTimeout(() => triggerPrint(), 500);
    }
  }, [isLoading, complaints]);

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
        <p className="text-destructive">Error loading complaints: {String(error)}</p>
      </div>
    );
  }

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="p-8 max-w-5xl mx-auto print-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Complaints Report</h1>
        <p className="text-lg text-muted-foreground">All Flats</p>
        <div className="mt-4 flex gap-6 text-sm">
          <div>Total: <strong>{complaints.length}</strong></div>
          <div>Open: <strong className="text-orange-600">{openCount}</strong></div>
          <div>Resolved: <strong className="text-green-600">{resolvedCount}</strong></div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Flat</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id.toString()}>
              <TableCell className="font-medium">#{complaint.id.toString()}</TableCell>
              <TableCell>Flat {complaint.flatNumber.toString()}</TableCell>
              <TableCell>{complaint.category}</TableCell>
              <TableCell className="max-w-xs">{complaint.description}</TableCell>
              <TableCell>
                {complaint.priority ? (
                  <Badge variant={complaint.priority === 'High' ? 'destructive' : 'secondary'}>
                    {complaint.priority}
                  </Badge>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={complaint.status === 'Open' ? 'default' : 'outline'}>
                  {complaint.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
