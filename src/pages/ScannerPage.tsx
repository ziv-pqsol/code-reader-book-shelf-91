
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLibrary } from '@/context/LibraryContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, User, Book, AlertCircle } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const ScannerPage = () => {
  const navigate = useNavigate();
  const { searchStudents, searchBooks } = useLibrary();
  const [activeTab, setActiveTab] = useState<string>('students');
  const [scannerInitialized, setScannerInitialized] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [matchedStudents, setMatchedStudents] = useState<any[]>([]);
  const [matchedBooks, setMatchedBooks] = useState<any[]>([]);
  
  useEffect(() => {
    // Initialize scanner if not done yet
    if (!scannerInitialized) {
      const scannerConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      };
      
      const html5QrCodeScanner = new Html5QrcodeScanner(
        "qr-reader",
        scannerConfig,
        false
      );
      
      const onScanSuccess = (decodedText: string) => {
        setScanResult(decodedText);
        setScanError(null);
        
        // Search for students or books with this code
        const foundStudents = searchStudents(decodedText);
        const foundBooks = searchBooks(decodedText);
        
        setMatchedStudents(foundStudents);
        setMatchedBooks(foundBooks);
        
        // If we found exactly one match of the active type, navigate there directly
        if (activeTab === 'students' && foundStudents.length === 1) {
          navigate(`/students/${foundStudents[0].id}`);
        } else if (activeTab === 'books' && foundBooks.length === 1) {
          navigate(`/books/${foundBooks[0].id}`);
        }
      };
      
      const onScanFailure = (error: any) => {
        // Don't set error on each frame, only if we have a result and then get an error
        if (scanResult) {
          setScanError('Failed to scan QR code. Please try again.');
        }
      };
      
      html5QrCodeScanner.render(onScanSuccess, onScanFailure);
      setScannerInitialized(true);
      
      return () => {
        // Cleanup
        html5QrCodeScanner.clear().catch(console.error);
      };
    }
  }, [scannerInitialized, scanResult, activeTab, searchStudents, searchBooks, navigate]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan student or book QR codes</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Books
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="students" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Student QR Scanner
              </CardTitle>
              <CardDescription>
                Scan a student's QR code to find their information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="qr-reader" className="mx-auto max-w-md"></div>
              
              {scanError && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {scanError}
                </div>
              )}
              
              {scanResult && matchedStudents.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Matched Students:</h3>
                  <div className="grid gap-2">
                    {matchedStudents.map(student => (
                      <Card key={student.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.grade} • {student.code}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/students/${student.id}`)}
                          >
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {scanResult && matchedStudents.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  No students found with code: {scanResult}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="books" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Book QR Scanner
              </CardTitle>
              <CardDescription>
                Scan a book's QR code to find its information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="qr-reader" className="mx-auto max-w-md"></div>
              
              {scanError && (
                <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {scanError}
                </div>
              )}
              
              {scanResult && matchedBooks.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h3 className="font-medium">Matched Books:</h3>
                  <div className="grid gap-2">
                    {matchedBooks.map(book => (
                      <Card key={book.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{book.title}</p>
                            <p className="text-sm text-muted-foreground">By {book.author} • {book.code}</p>
                          </div>
                          <Button 
                            onClick={() => navigate(`/books/${book.id}`)}
                          >
                            View
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {scanResult && matchedBooks.length === 0 && (
                <div className="mt-4 p-4 bg-amber-50 text-amber-700 rounded-md flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  No books found with code: {scanResult}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScannerPage;
