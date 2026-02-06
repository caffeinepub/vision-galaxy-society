import { useEffect } from 'react';
import { useGetExpenditures } from '../../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { triggerPrint } from '../../utils/print';

export default function ExpendituresReportPrintPage() {
  const params = new URLSearchParams(window.location.search);
  const month = params.get('month') || '';
  const year = params.get('year') || '';

  const { data: expenditure, isLoading, error } = useGetExpenditures(month, BigInt(year));

  useEffect(() => {
    if (!isLoading && expenditure) {
      setTimeout(() => triggerPrint(), 500);
    }
  }, [isLoading, expenditure]);

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
        <p className="text-destructive">Error loading expenditures: {String(error)}</p>
      </div>
    );
  }

  if (!expenditure) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">No expenditure record found for {month} {year}</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto print-content">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Expenditure Report</h1>
        <p className="text-lg text-muted-foreground">{month} {year}</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenditure.items.map(([desc, amount], idx) => (
            <TableRow key={idx}>
              <TableCell>{desc}</TableCell>
              <TableCell className="text-right">₹{(Number(amount) / 100).toFixed(2)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold border-t-2">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">₹{(Number(expenditure.totalAmount) / 100).toFixed(2)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>

      {expenditure.notes && (
        <div className="mt-6 p-4 border rounded-lg">
          <p className="font-medium mb-2">Notes:</p>
          <p className="text-muted-foreground">{expenditure.notes}</p>
        </div>
      )}
    </div>
  );
}
