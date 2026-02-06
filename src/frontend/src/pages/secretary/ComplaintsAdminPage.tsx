import { useGetAllComplaints } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Loader2 } from 'lucide-react';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { openPrintView } from '../../utils/print';

export default function ComplaintsAdminPage() {
  const { data: complaints = [], isLoading, error } = useGetAllComplaints();

  const handleExportCSV = () => {
    const csvData = complaints.map(complaint => ({
      'ID': complaint.id.toString(),
      'Flat Number': complaint.flatNumber.toString(),
      'Category': complaint.category,
      'Description': complaint.description,
      'Priority': complaint.priority || 'N/A',
      'Status': complaint.status,
      'Resolution Note': complaint.resolutionNote || 'N/A',
    }));

    const csv = generateCSV(csvData, ['ID', 'Flat Number', 'Category', 'Description', 'Priority', 'Status', 'Resolution Note']);
    downloadCSV(csv, `complaints-report-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    openPrintView('/reports/complaints/print');
  };

  const openCount = complaints.filter(c => c.status === 'Open').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Complaint Management</h1>
          <p className="text-muted-foreground mt-1">Review and resolve resident complaints</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline" disabled={isLoading || complaints.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handlePrint} variant="outline" disabled={isLoading || complaints.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">Error loading complaints: {String(error)}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaints.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{openCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{resolvedCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
          <CardDescription>
            Complaints from all flats
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No complaints found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      <TableCell className="max-w-xs truncate">{complaint.description}</TableCell>
                      <TableCell>
                        {complaint.priority ? (
                          <Badge variant={complaint.priority === 'High' ? 'destructive' : 'secondary'}>
                            {complaint.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
