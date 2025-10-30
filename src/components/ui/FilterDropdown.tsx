import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FilterOption {
  id: string;
  label: string;
  group?: string;
}

interface FilterGroup {
  label: string;
  options: string[];
}

interface FilterDropdownProps {
  label: string;
  options: string[] | FilterOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiSelect?: boolean;
  searchable?: boolean;
  groups?: FilterGroup[];
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiSelect = true,
  searchable = false,
  groups,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normalize options to array of strings
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? opt : opt.label
  );

  // Get current selection as array
  const selectedArray = Array.isArray(value) ? value : value ? [value] : [];
  const hasActiveFilters = selectedArray.length > 0;

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? normalizedOptions.filter(opt => 
        opt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  // Group options if groups are provided
  const groupedOptions = groups
    ? groups.map(group => ({
        ...group,
        options: group.options.filter(opt => filteredOptions.includes(opt))
      })).filter(group => group.options.length > 0)
    : null;

  const handleToggleOption = (option: string) => {
    if (multiSelect) {
      const newSelected = selectedArray.includes(option)
        ? selectedArray.filter((item) => item !== option)
        : [...selectedArray, option];
      onChange(newSelected);
    } else {
      onChange(option);
      setOpen(false);
    }
  };

  const handleRemoveFilter = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiSelect) {
      onChange(selectedArray.filter(item => item !== option));
    } else {
      onChange('');
    }
  };

  const handleClearAll = () => {
    onChange(multiSelect ? [] : '');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-10 justify-between font-normal gap-2 transition-all",
            hasActiveFilters && "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          )}
        >
          <span className="flex items-center gap-2">
            {label}
            {hasActiveFilters && (
              <span className="text-xs font-semibold">({selectedArray.length})</span>
            )}
          </span>
          <ChevronDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[260px] p-0 rounded-lg shadow-lg" 
        align="start"
        sideOffset={4}
      >
        {searchable && (
          <div className="p-2 border-b">
            <Input
              placeholder={`Search ${label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
        )}
        
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {groupedOptions ? (
            groupedOptions.map((group, idx) => (
              <div key={group.label}>
                {idx > 0 && <div className="h-px bg-border my-2" />}
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {group.label}
                </div>
                {group.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleToggleOption(option)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left",
                      selectedArray.includes(option) && "bg-emerald-50 text-emerald-700"
                    )}
                  >
                    {multiSelect ? (
                      <input
                        type="checkbox"
                        checked={selectedArray.includes(option)}
                        onChange={() => {}}
                        className="pointer-events-none h-4 w-4"
                      />
                    ) : (
                      <div className={cn(
                        "h-4 w-4 rounded-full border-2",
                        selectedArray.includes(option) 
                          ? "border-emerald-600 bg-emerald-600" 
                          : "border-gray-300"
                      )}>
                        {selectedArray.includes(option) && (
                          <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                        )}
                      </div>
                    )}
                    <span className="flex-1">{option}</span>
                  </button>
                ))}
              </div>
            ))
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleToggleOption(option)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent transition-colors text-left",
                  selectedArray.includes(option) && "bg-emerald-50 text-emerald-700"
                )}
              >
                {multiSelect ? (
                  <input
                    type="checkbox"
                    checked={selectedArray.includes(option)}
                    onChange={() => {}}
                    className="pointer-events-none h-4 w-4"
                  />
                ) : (
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2",
                    selectedArray.includes(option) 
                      ? "border-emerald-600 bg-emerald-600" 
                      : "border-gray-300"
                  )}>
                    {selectedArray.includes(option) && (
                      <div className="h-full w-full rounded-full bg-white scale-[0.4]" />
                    )}
                  </div>
                )}
                <span className="flex-1">{option}</span>
              </button>
            ))
          )}
          
          {filteredOptions.length === 0 && (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No results found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
