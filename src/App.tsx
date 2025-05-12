
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { LibraryProvider } from "./context/LibraryContext";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import StudentsPage from "./pages/StudentsPage";
import BooksPage from "./pages/BooksPage";
import StudentDetailPage from "./pages/StudentDetailPage";
import BookDetailPage from "./pages/BookDetailPage";
import SearchPage from "./pages/SearchPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import NotFound from "./pages/NotFound";
import HistoryPage from "./pages/HistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <LibraryProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            <Route path="/students" element={<Layout><StudentsPage /></Layout>} />
            <Route path="/students/:id" element={<Layout><StudentDetailPage /></Layout>} />
            <Route path="/books" element={<Layout><BooksPage /></Layout>} />
            <Route path="/books/:id" element={<Layout><BookDetailPage /></Layout>} />
            <Route path="/search" element={<Layout><SearchPage /></Layout>} />
            <Route path="/scanner" element={<Navigate to="/search" replace />} />
            <Route path="/search-results" element={<Layout><SearchResultsPage /></Layout>} />
            <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LibraryProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
