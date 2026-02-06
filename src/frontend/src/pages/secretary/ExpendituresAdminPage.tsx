import { useState } from 'react';
import { useGetExpenditures, useRecordExpenditure } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Printer, Loader2, Plus, Trash2 } from 'lucide-react';
import { generateCSV, downloadCSV } from '../../utils/csv';
import { openPrintView } from '../../utils/print';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

type ExpenditureItem = { description: string; amount: string };

export default function ExpendituresAdminPage() {
  const currentMonth = MONTHS[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [items, setItems] = useState<ExpenditureItem[]>([{ description: '', amount: '' }]);
  const [notes, setNotes] = useState('');

  const { data: expenditure, isLoading, error } = useGetExpenditures(selectedMonth, BigInt(selectedYear));
  const recordMutation = useRecordExpenditure();

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    const validItems = items.filter(item => item.description && item.amount);
    
    if (validItems.length === 0) {
      toast.error('Please add at least one expenditure item');
      return;
    }

    const expenditureItems: Array<[string, bigint]> = validItems.map(item => [
      item.description,
      BigInt(Math.round(parseFloat(item.amount) * 100))
    ]);

    const total = expenditureItems.reduce((sum, [, amount]) => sum + amount, BigInt(0));

    try {
      await recordMutation.mutateAsync({
        month: selectedMonth,
        year: BigInt(selectedYear),
        items: expenditureItems,
        totalAmount: total,
        notes: notes || null,
      });
      toast.success('Expenditure recorded successfully');
    } catch (err) {
      toast.error('Failed to record expenditure: ' + String(err));
    }
  };

  const handleExportCSV = () => {
    if (!expenditure) return;

    const csvData = expenditure.items.map(([desc, amount]) => ({
      'Description': desc,
      'Amount': (Number(amount) / 100).toFixed(2),
    }));

    csvData.push({
      'Description': 'TOTAL',
      'Amount': (Number(expenditure.totalAmount) / 100).toFixed(2),
    });

    const csv = generateCSV(csvData, ['Description', 'Amount']);
    downloadCSV(csv, `expenditures-${selectedMonth}-${selectedYear}.csv`);
  };

  const handlePrint = () => {
    openPrintView(`/reports/expenditures/print?month=${selectedMonth}&year=${selectedYear}`);
  };

  // Load existing expenditure into form
  const loadExisting = () => {
    if (expenditure) {
      setItems(expenditure.items.map(([desc, amount]) => ({
        description: desc,
        amount: (Number(amount) / 100).toFixed(2),
      })));
      setNotes(expenditure.notes || '');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Expenditures</h1>
        <p className="text-muted-foreground mt-1">Record monthly society expenses</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Month</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-2 block">Year</label>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">Error loading expenditures: {String(error)}</p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ) : expenditure ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Existing Expenditure</CardTitle>
                <CardDescription>{selectedMonth} {selectedYear}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadExisting} variant="outline" size="sm">
                  Edit
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button onClick={handlePrint} variant="outline" size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
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
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">₹{(Number(expenditure.totalAmount) / 100).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {expenditure.notes && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium mb-1">Notes:</p>
                <p className="text-sm text-muted-foreground">{expenditure.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Record New Expenditure</CardTitle>
            <CardDescription>{selectedMonth} {selectedYear}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="w-32"
                  />
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={handleAddItem} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            <div>
              <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
              <Textarea
                placeholder="Additional notes about this expenditure..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSave} disabled={recordMutation.isPending}>
              {recordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Expenditure
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
