import { useState } from 'react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { getValidFlatNumbers, isValidFlatNumber, formatFlatNumber } from '../utils/flatNumbers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<string>('');
  const [flatNumber, setFlatNumber] = useState('');
  const saveProfileMutation = useSaveCallerUserProfile();

  const validFlatNumbers = getValidFlatNumbers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!userType) {
      toast.error('Please select your role');
      return;
    }

    if (userType === 'FlatOwner') {
      if (!flatNumber) {
        toast.error('Please select your flat number');
        return;
      }
      
      if (!isValidFlatNumber(flatNumber)) {
        toast.error('Invalid flat number. Please select a valid flat from the list.');
        return;
      }
    }

    const profile: UserProfile = {
      userId: `user-${Date.now()}`,
      name: name.trim(),
      userType,
      flatNumber: userType === 'FlatOwner' ? BigInt(flatNumber) : undefined,
    };

    try {
      await saveProfileMutation.mutateAsync(profile);
      toast.success('Profile created successfully!');
      onComplete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create profile');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Vision Galaxy Society</DialogTitle>
          <DialogDescription>
            Please set up your profile to continue
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userType">Role</Label>
            <Select value={userType} onValueChange={setUserType} required>
              <SelectTrigger id="userType">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FlatOwner">Flat Owner</SelectItem>
                <SelectItem value="Secretary">Secretary</SelectItem>
                <SelectItem value="Guard">Guard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {userType === 'FlatOwner' && (
            <div className="space-y-2">
              <Label htmlFor="flatNumber">Flat Number</Label>
              <Select value={flatNumber} onValueChange={setFlatNumber} required>
                <SelectTrigger id="flatNumber">
                  <SelectValue placeholder="Select your flat number" />
                </SelectTrigger>
                <SelectContent>
                  {validFlatNumbers.map(num => (
                    <SelectItem key={num} value={num}>
                      {formatFlatNumber(num)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={saveProfileMutation.isPending}
          >
            {saveProfileMutation.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
