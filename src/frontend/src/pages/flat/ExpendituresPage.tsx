import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function ExpendituresPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monthly Expenditures</h1>
        <p className="text-muted-foreground mt-1">View society expenses by month</p>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This feature requires backend support for expenditure tracking. 
          The backend currently does not have expenditure functionality.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Feature Not Available</CardTitle>
          <CardDescription>
            Expenditure viewing is currently unavailable
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>The backend needs to implement expenditure management methods.</p>
          <p className="mt-2 text-xs">Contact your society secretary for expenditure information.</p>
        </CardContent>
      </Card>
    </div>
  );
}
