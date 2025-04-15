
import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLibrary } from "@/context/LibraryContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, Genre } from "@/types";

interface EditBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: Book | undefined;
}

const genres: Genre[] = ["literatura", "ficción", "ciencia", "historia", "arte"];

const formSchema = z.object({
  title: z.string().min(1, {
    message: "El título es obligatorio.",
  }),
  author: z.string().min(1, {
    message: "El autor es obligatorio.",
  }),
  code: z.string().min(1, {
    message: "El código del libro es obligatorio.",
  }),
  genre: z.enum(["literatura", "ficción", "ciencia", "historia", "arte"] as const),
  coverUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const EditBookDialog: React.FC<EditBookDialogProps> = ({
  open,
  onOpenChange,
  book,
}) => {
  const { updateBook } = useLibrary();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      author: "",
      code: "",
      genre: "literatura",
      coverUrl: "",
    },
  });

  // Reset form with book data when the book changes or dialog opens
  useEffect(() => {
    if (book && open) {
      form.reset({
        title: book.title,
        author: book.author,
        code: book.code,
        genre: book.genre,
        coverUrl: book.coverUrl || "",
      });
    }
  }, [book, open, form]);

  function onSubmit(values: FormValues) {
    if (!book) return;
    
    updateBook(book.id, {
      ...values,
      // Only include the coverUrl if it's not empty
      coverUrl: values.coverUrl || null,
    });
    
    onOpenChange(false);
  }

  // If no book is provided, don't render the dialog
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Libro</DialogTitle>
          <DialogDescription>
            Actualiza la información del libro.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del libro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del autor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: B12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Género</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un género" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la portada (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="URL de la imagen de portada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookDialog;
