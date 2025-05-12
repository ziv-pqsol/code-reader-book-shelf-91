
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapSupabaseBorrowingRecord, BorrowingRecord } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Book, Calendar, Clock, Search } from "lucide-react";

const HistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<'all' | 'returned' | 'borrowed'>('all');
  
  const { data: borrowingHistory = [], isLoading } = useQuery({
    queryKey: ['borrowingHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('borrowing_history')
        .select('*')
        .order('borrowed_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching borrowing history:', error);
        throw error;
      }
      
      return (data || []).map(mapSupabaseBorrowingRecord);
    }
  });
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy", { locale: es });
    } catch (e) {
      return "Fecha inválida";
    }
  };
  
  const filteredHistory = borrowingHistory.filter(record => {
    const matchesSearch = 
      record.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.studentCode.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (filter === 'returned') {
      return matchesSearch && !!record.returnedDate;
    } else if (filter === 'borrowed') {
      return matchesSearch && !record.returnedDate;
    }
    
    return matchesSearch;
  });
  
  const getStats = () => {
    const total = borrowingHistory.length;
    const returned = borrowingHistory.filter(r => !!r.returnedDate).length;
    const borrowed = total - returned;
    
    return { total, returned, borrowed };
  };
  
  const stats = getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial de préstamos</h1>
        <p className="text-muted-foreground">
          Registro histórico completo de todos los préstamos de libros.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de préstamos</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Todos los préstamos registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Libros devueltos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returned}</div>
            <p className="text-xs text-muted-foreground">
              Préstamos completados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Préstamos activos</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.borrowed}</div>
            <p className="text-xs text-muted-foreground">
              Libros actualmente prestados
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Tabs defaultValue="all" className="w-full md:w-auto" onValueChange={(value) => setFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="borrowed">Prestados</TabsTrigger>
            <TabsTrigger value="returned">Devueltos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Libro</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Fecha de préstamo</TableHead>
                <TableHead>Fecha de devolución</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Cargando historial...</TableCell>
                </TableRow>
              ) : filteredHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">No se encontraron registros</TableCell>
                </TableRow>
              ) : (
                filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.bookTitle}</TableCell>
                    <TableCell>{record.studentName}</TableCell>
                    <TableCell>{record.studentCode}</TableCell>
                    <TableCell>{formatDate(record.borrowedDate)}</TableCell>
                    <TableCell>{formatDate(record.returnedDate)}</TableCell>
                    <TableCell>
                      {record.returnedDate ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Devuelto</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Prestado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HistoryPage;
