import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getValidFlatNumbers, isValidFlatNumber, getNextFlatNumber, getPreviousFlatNumber } from '../utils/flatNumbers';

interface FlatNumberPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export default function FlatNumberPicker({ value, onChange, placeholder = 'Select flat number', id, disabled = false }: FlatNumberPickerProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const validFlats = getValidFlatNumbers();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue === '' || isValidFlatNumber(newValue)) {
      onChange(newValue);
    }
  };

  const handleSelectFlat = (flat: string) => {
    setInputValue(flat);
    onChange(flat);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = getPreviousFlatNumber(inputValue || '101');
      setInputValue(prev);
      onChange(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = getNextFlatNumber(inputValue || '101');
      setInputValue(next);
      onChange(next);
    }
  };

  const handleIncrement = () => {
    const next = getNextFlatNumber(inputValue || '101');
    setInputValue(next);
    onChange(next);
  };

  const handleDecrement = () => {
    const prev = getPreviousFlatNumber(inputValue || '101');
    setInputValue(prev);
    onChange(prev);
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              id={id}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pr-10"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setOpen(!open)}
              disabled={disabled}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ScrollArea className="h-[300px]">
            <div className="p-1">
              {validFlats.map((flat) => (
                <Button
                  key={flat}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleSelectFlat(flat)}
                >
                  Flat {flat}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      <div className="flex flex-col gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-[18px] w-8 p-0"
          onClick={handleIncrement}
          disabled={disabled}
        >
          <ChevronUp className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-[18px] w-8 p-0"
          onClick={handleDecrement}
          disabled={disabled}
        >
          <ChevronDown className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
