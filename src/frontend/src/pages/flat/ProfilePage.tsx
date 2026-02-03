import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useGetFlatMobileNumbers, useUpdateFlatMobileNumbers } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: userProfile } = useGetCallerUserProfile();
  const flatNumber = userProfile?.flatNumber || BigInt(0);
  
  const { data: mobileNumbers = [] } = useGetFlatMobileNumbers(flatNumber);
  const updateMobileNumbersMutation = useUpdateFlatMobileNumbers();

  const [numbers, setNumbers] = useState<string[]>([]);

  useEffect(() => {
    if (mobileNumbers.length > 0) {
      setNumbers(mobileNumbers);
    } else {
      setNumbers(['']);
    }
  }, [mobileNumbers]);

  const handleAddNumber = () => {
    if (numbers.length >= 4) {
      toast.error('Maximum 4 mobile numbers allowed');
      return;
    }
    setNumbers([...numbers, '']);
  };

  const handleRemoveNumber = (index: number) => {
    setNumbers(numbers.filter((_, i) => i !== index));
  };

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const handleSave = async () => {
    const validNumbers = numbers.filter(n => n.trim() !== '');
    
    if (validNumbers.length === 0) {
      toast.error('Please add at least one mobile number');
      return;
    }

    if (validNumbers.length > 4) {
      toast.error('Maximum 4 mobile numbers allowed');
      return;
    }

    try {
      await updateMobileNumbersMutation.mutateAsync({
        flatNumber,
        numbers: validNumbers,
      });
      toast.success('Mobile numbers updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update mobile numbers');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your contact information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mobile Numbers</CardTitle>
          <CardDescription>
            Add up to 4 mobile numbers for receiving visitor approval requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {numbers.map((number, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Mobile Number {index + 1}</Label>
                  <Input
                    value={number}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    placeholder="+919876543210"
                  />
                </div>
                {numbers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveNumber(index)}
                    className="mt-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {numbers.length < 4 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddNumber} 
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Mobile Number
            </Button>
          )}

          <Button 
            onClick={handleSave}
            disabled={updateMobileNumbersMutation.isPending}
            className="w-full"
            size="lg"
          >
            {updateMobileNumbersMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
