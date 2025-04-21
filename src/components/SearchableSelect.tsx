
import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface Item {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  items: Item[];
  placeholder: string;
  onSelect: (id: string) => void;
  triggerText: string;
  onAddNew?: () => void;
  searchText?: string;
}

const SearchableSelect = ({ 
  items = [], 
  placeholder, 
  onSelect, 
  triggerText,
  onAddNew,
  searchText = ""
}: SearchableSelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(searchText || "");

  // Ensure items is always a valid array to prevent "undefined is not iterable" error
  const safeItems = Array.isArray(items) ? items : [];
  
  // When searchText prop changes, update internal search state
  useEffect(() => {
    if (searchText !== undefined) {
      setSearch(searchText);
    }
  }, [searchText]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <Search className="mr-2 h-4 w-4" />
          {triggerText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="bottom" align="start">
        <Command>
          <CommandInput 
            placeholder={placeholder} 
            value={search}
            onValueChange={(value) => setSearch(value)}
          />
          <CommandEmpty className="p-2">
            <div className="text-sm text-muted-foreground py-2 text-center">
              No se encontraron resultados
            </div>
            {onAddNew && (
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  onAddNew();
                  setOpen(false);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir Nuevo
              </Button>
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {safeItems.length > 0 ? (
              safeItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                >
                  {item.label}
                </CommandItem>
              ))
            ) : (
              <CommandItem disabled>No hay elementos disponibles</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
