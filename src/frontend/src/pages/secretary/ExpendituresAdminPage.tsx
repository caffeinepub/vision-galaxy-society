import { useState } from 'react';
import { useGetExpenditures, useRecordExpenditure } from '../../hooks/useQueries';
import { getCurrentMonth, getCurrentYear, getAllMonths, getYearRange } from '../../utils/dates';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ExpendituresAdminPage() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const { data: expenditure } = useGetExpenditures(selectedMonth, selectedYear);
  const recordExpenditureMutation = useRecordExpenditure();

  const [items, setItems] = useState<Array<{ description: string; amount: string }>>(
    expenditure?.items.map(([desc, amt]) => ({ description: desc, amount: amt.toString() })) || [{ description: '', amount: '' }]
  );
  const [notes, setNotes] = useState(expenditure?.notes || '');

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

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const amount = parseInt(item.amount) || 0;
      return sum + amount;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validItems = items.filter(item => item.description && item.amount);
    if (validItems.length === 0) {
      toast.error('Please add at least one expenditure item');
      return;
    }

    const itemsForBackend: [string, bigint][] = validItems.map(item => [
      item.description,
      BigInt(parseInt(item.amount) || 0)
    ]);

    const total = BigInt(calculateTotal());

    try {
      await recordExpenditureMutation.mutateAsync({
        month: selectedMonth,
        year: selectedYear,
        items: itemsForBackend,
        totalAmount: total,
        notes: notes || null,
      });

      toast.success('Expenditure recorded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to record expenditure');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Expenditures</h1>
        <p className="text-muted-foreground mt-1">Record monthly society expenses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Period</CardTitle>
          <CardDescription>Choose month and year for expenditure entry</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Month</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllMonths().map(month => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(BigInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getYearRange().map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenditure Items</CardTitle>
          <CardDescription>Add line items for monthly expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="e.g., Electricity bill"
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(index)}
                      className="mt-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>

            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this month's expenditures"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="font-medium">Total Amount</span>
              <span className="text-2xl font-bold">₹{calculateTotal().toLocaleString()}</span>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={recordExpenditureMutation.isPending}
            >
              {recordExpenditureMutation.isPending ? 'Saving...' : 'Save Expenditure'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
