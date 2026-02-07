import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { getValidFlatNumbers, isValidFlatNumber, getNextFlatNumber, getPreviousFlatNumber, formatFlatNumber } from '../utils/flatNumbers';
import { cn } from '@/lib/utils';

interface FlatNumberPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export default function FlatNumberPicker({
  value,
  onChange,
  placeholder = 'Enter or select flat number',
  id,
  disabled = false,
  className,
}: FlatNumberPickerProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const validFlats = getValidFlatNumbers();

  const handleIncrement = () => {
    const nextFlat = getNextFlatNumber(value);
    onChange(nextFlat);
  };

  const handleDecrement = () => {
    const prevFlat = getPreviousFlatNumber(value);
    onChange(prevFlat);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const handleSelectFlat = (flat: string) => {
    onChange(flat);
    setOpen(false);
    inputRef.current?.focus();
  };

  const isValid = value ? isValidFlatNumber(value) : true;

  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-10',
            !isValid && value && 'border-destructive focus-visible:ring-destructive'
          )}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            >
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="end">
            <ScrollArea className="h-[300px]">
              <div className="p-1">
                {validFlats.map((flat) => (
                  <button
                    key={flat}
                    type="button"
                    onClick={() => handleSelectFlat(flat)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                      value === flat && 'bg-accent font-medium'
                    )}
                  >
                    {formatFlatNumber(flat)}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled}
          className="h-[18px] w-8 p-0"
          title="Next flat (Arrow Up)"
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled}
          className="h-[18px] w-8 p-0"
          title="Previous flat (Arrow Down)"
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
