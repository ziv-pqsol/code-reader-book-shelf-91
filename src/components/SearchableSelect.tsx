
import React, { useState, useEffect, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface Item {
  id: string;
  label: string;
}

interface SearchableSelectProps {
  items: Item[] | undefined;
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

  // Ensure items is always a valid array
  const safeItems = useMemo(() => (
    Array.isArray(items) ? items : []
  ), [items]);
  
  // Update search state when searchText prop changes
  useEffect(() => {
    if (searchText !== undefined) {
      setSearch(searchText);
    }
  }, [searchText]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return safeItems;
    }
    
    const searchLower = search.toLowerCase();
    return safeItems.filter(item => 
      item.label.toLowerCase().includes(searchLower)
    );
  }, [safeItems, search]);

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
            onValueChange={setSearch}
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
            {filteredItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
              >
                {item.label}
              </CommandItem>
            ))}
            {filteredItems.length === 0 && safeItems.length > 0 && (
              <CommandItem disabled>Intenta otra búsqueda</CommandItem>
            )}
            {safeItems.length === 0 && (
              <CommandItem disabled>No hay elementos disponibles</CommandItem>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default SearchableSelect;
