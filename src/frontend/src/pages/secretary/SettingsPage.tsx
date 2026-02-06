import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle2, Settings, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useGetSecretarySettings, useUpdateSecretarySettings } from '../../hooks/useQueries';
import { 
  validateMaintenanceAmount, 
  validateUpiId, 
  validateGuardMobileNumber, 
  validateAllSettings,
  normalizeSettings
} from '../../utils/settingsValidation';
import SettingsSkeleton from './components/SettingsSkeleton';

export default function SettingsPage() {
  // Logo state
  const [savedCustomLogo, setSavedCustomLogo] = useState<string | null>(
    localStorage.getItem('customLogo') || null
  );
  const [draftLogoPreview, setDraftLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings state
  const { data: settings, isLoading: loadingSettings, isFetched } = useGetSecretarySettings();
  const updateSettingsMutation = useUpdateSecretarySettings();

  const [maintenanceAmount, setMaintenanceAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [guardMobileNumber, setGuardMobileNumber] = useState('');

  // Baseline for dirty detection (normalized values)
  const [baseline, setBaseline] = useState<{
    maintenanceAmount: string;
    upiId: string;
    guardMobileNumber: string;
  } | null>(null);

  // Field-level validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize/update form values when settings load or change
  useEffect(() => {
    if (settings && isFetched) {
      const newValues = {
        maintenanceAmount: settings.maintenanceAmount.toString(),
        upiId: settings.upiId,
        guardMobileNumber: settings.guardMobileNumber,
      };
      
      // Normalize the new values for baseline
      const normalizedNewValues = normalizeSettings(newValues);
      
      // Only update if we don't have a baseline yet, or if there are no unsaved edits
      if (!baseline) {
        // First load: set both form and baseline
        setMaintenanceAmount(newValues.maintenanceAmount);
        setUpiId(newValues.upiId);
        setGuardMobileNumber(newValues.guardMobileNumber);
        setBaseline(normalizedNewValues);
      } else {
        // Check if current form values have unsaved edits
        const currentNormalized = normalizeSettings({
          maintenanceAmount,
          upiId,
          guardMobileNumber,
        });
        
        const hasUnsavedEdits = 
          currentNormalized.maintenanceAmount !== baseline.maintenanceAmount ||
          currentNormalized.upiId !== baseline.upiId ||
          currentNormalized.guardMobileNumber !== baseline.guardMobileNumber;
        
        // Only update if there are no unsaved edits
        if (!hasUnsavedEdits) {
          setMaintenanceAmount(newValues.maintenanceAmount);
          setUpiId(newValues.upiId);
          setGuardMobileNumber(newValues.guardMobileNumber);
          setBaseline(normalizedNewValues);
        }
      }
    }
  }, [settings, isFetched]);

  // Check if form is dirty (changed from baseline) using normalized comparison
  const isDirty = (() => {
    if (!baseline) return false;
    
    const currentNormalized = normalizeSettings({
      maintenanceAmount,
      upiId,
      guardMobileNumber,
    });
    
    return (
      currentNormalized.maintenanceAmount !== baseline.maintenanceAmount ||
      currentNormalized.upiId !== baseline.upiId ||
      currentNormalized.guardMobileNumber !== baseline.guardMobileNumber
    );
  })();

  // Validate on change
  const handleMaintenanceAmountChange = (value: string) => {
    setMaintenanceAmount(value);
    const result = validateMaintenanceAmount(value);
    setErrors(prev => {
      const next = { ...prev };
      if (result.isValid) {
        delete next.maintenanceAmount;
      } else {
        next.maintenanceAmount = result.error!;
      }
      return next;
    });
  };

  const handleUpiIdChange = (value: string) => {
    setUpiId(value);
    const result = validateUpiId(value);
    setErrors(prev => {
      const next = { ...prev };
      if (result.isValid) {
        delete next.upiId;
      } else {
        next.upiId = result.error!;
      }
      return next;
    });
  };

  const handleGuardMobileNumberChange = (value: string) => {
    setGuardMobileNumber(value);
    const result = validateGuardMobileNumber(value);
    setErrors(prev => {
      const next = { ...prev };
      if (result.isValid) {
        delete next.guardMobileNumber;
      } else {
        next.guardMobileNumber = result.error!;
      }
      return next;
    });
  };

  // Logo handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDraftLogoPreview(result);
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveLogo = () => {
    if (!draftLogoPreview) {
      toast.error('No logo to save');
      return;
    }

    try {
      localStorage.setItem('customLogo', draftLogoPreview);
      setSavedCustomLogo(draftLogoPreview);
      setDraftLogoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Logo saved! Refresh the page to see changes in the header.');
    } catch (error) {
      toast.error('Failed to save logo. File might be too large.');
    }
  };

  const handleResetLogo = () => {
    localStorage.removeItem('customLogo');
    setSavedCustomLogo(null);
    setDraftLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Logo reset to default. Refresh the page to see changes in the header.');
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    // Validate all fields
    const validation = validateAllSettings(maintenanceAmount, upiId, guardMobileNumber);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    const amount = parseInt(maintenanceAmount, 10);
    const trimmedUpiId = upiId.trim();
    const trimmedGuardMobile = guardMobileNumber.trim();

    try {
      await updateSettingsMutation.mutateAsync({
        maintenanceAmount: BigInt(amount),
        upiId: trimmedUpiId,
        guardMobileNumber: trimmedGuardMobile,
      });
      
      // Update baseline and form to normalized saved values
      const newBaseline = {
        maintenanceAmount: amount.toString(),
        upiId: trimmedUpiId,
        guardMobileNumber: trimmedGuardMobile,
      };
      setBaseline(newBaseline);
      setMaintenanceAmount(newBaseline.maintenanceAmount);
      setUpiId(newBaseline.upiId);
      setGuardMobileNumber(newBaseline.guardMobileNumber);
      
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    }
  };

  // Determine effective logo for preview
  const effectiveLogo = draftLogoPreview || savedCustomLogo || '/assets/generated/vision-galaxy-logo.dim_512x512.png';
  const hasCustomLogo = !!savedCustomLogo;
  const hasDraftLogo = !!draftLogoPreview;

  // Show skeleton while loading
  if (loadingSettings || !isFetched) {
    return <SettingsSkeleton />;
  }

  const isSaveDisabled = !isDirty || updateSettingsMutation.isPending || Object.keys(errors).length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage society branding, maintenance configuration, and contact details
        </p>
      </div>

      {/* Logo Section */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <ImageIcon className="h-5 w-5" />
            Society Logo
          </CardTitle>
          <CardDescription>
            Upload a custom logo for your society. Recommended size: 512×512px, max 2MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The logo is stored locally in your browser. For persistent storage across devices, 
              backend file storage support is required.
            </AlertDescription>
          </Alert>

          {/* Preview Area */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="flex items-center justify-center bg-muted/30 rounded-lg p-12 border-2 border-dashed border-border">
              <img
                src={effectiveLogo}
                alt="Society Logo Preview"
                className="h-32 w-32 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/assets/generated/vision-galaxy-logo.dim_512x512.png';
                }}
              />
            </div>
            {hasDraftLogo && (
              <p className="text-xs text-muted-foreground text-center">
                New logo selected. Click "Save Logo" to apply.
              </p>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose New Logo
                </>
              )}
            </Button>
            <Button
              onClick={handleSaveLogo}
              disabled={!hasDraftLogo || uploading}
              className="w-full"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Logo
            </Button>
            <Button
              variant="outline"
              onClick={handleResetLogo}
              disabled={!hasCustomLogo || uploading}
              className="w-full sm:col-span-2"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Section */}
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5" />
            Society Configuration
          </CardTitle>
          <CardDescription>
            Configure monthly maintenance amount, UPI ID, and guard contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Maintenance Amount */}
          <div className="space-y-2">
            <Label htmlFor="maintenanceAmount" className="text-sm font-medium">
              Monthly Maintenance Amount (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="maintenanceAmount"
              type="number"
              min="1"
              step="1"
              value={maintenanceAmount}
              onChange={(e) => handleMaintenanceAmountChange(e.target.value)}
              placeholder="e.g., 1500"
              className={errors.maintenanceAmount ? 'border-destructive' : ''}
            />
            {errors.maintenanceAmount ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.maintenanceAmount}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                This amount will be used for UPI payment links and displayed to flat owners
              </p>
            )}
          </div>

          {/* UPI ID */}
          <div className="space-y-2">
            <Label htmlFor="upiId" className="text-sm font-medium">
              Society UPI ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="upiId"
              type="text"
              value={upiId}
              onChange={(e) => handleUpiIdChange(e.target.value)}
              placeholder="e.g., society@upi"
              className={errors.upiId ? 'border-destructive' : ''}
            />
            {errors.upiId ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.upiId}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                UPI ID where flat owners will send maintenance payments
              </p>
            )}
          </div>

          {/* Guard Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="guardMobileNumber" className="text-sm font-medium">
              Guard Mobile Number (WhatsApp) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guardMobileNumber"
              type="tel"
              value={guardMobileNumber}
              onChange={(e) => handleGuardMobileNumberChange(e.target.value)}
              placeholder="e.g., +919876543210"
              className={errors.guardMobileNumber ? 'border-destructive' : ''}
            />
            {errors.guardMobileNumber ? (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.guardMobileNumber}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Mobile number for guard communication and visitor request notifications
              </p>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            disabled={isSaveDisabled}
            className="w-full"
            size="lg"
          >
            {updateSettingsMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving Configuration...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>
          
          {!isDirty && !updateSettingsMutation.isPending && (
            <p className="text-xs text-center text-muted-foreground">
              No changes to save
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
