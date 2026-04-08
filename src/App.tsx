import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { ThemeProvider } from "./components/theme-provider";
import AdminLogin from "./pages/AdminLogin";
import AdminVisitors from "./pages/AdminVisitors";
import Analytics from "./pages/Analytics";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import VisitorForm from "./pages/VisitorForm";

// DICT Provincial Office imports
import DictAdminLayout from "./components/DictAdminLayout";
import DictAdminLogin from "./pages/dict/AdminLogin";
import DictAdminVisitors from "./pages/dict/AdminVisitors";
import DictAnalytics from "./pages/dict/Analytics";
import DictDashboard from "./pages/dict/Dashboard";
import DictIndex from "./pages/dict/Index";
import DictReports from "./pages/dict/Reports";
import DictVisitorForm from "./pages/dict/VisitorForm";

// Favicons
import dtcFavicon from "@/assets/DTClogo.png";
import dictFavicon from "@/assets/DICT-MainLogo.png";

const queryClient = new QueryClient();

const HeadManager = () => {
  const location = useLocation();

  useEffect(() => {
    const isDict = location.pathname.startsWith('/dict');
    
    // Update Title
    document.title = isDict ? 'DICT Foot Traffic' : 'Foot Traffic';
    
    // Update Favicon (Tab Logo)
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = isDict ? dictFavicon : dtcFavicon;
  }, [location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <HeadManager />
        <Routes>
          {/* ===== DTC Routes (untouched) ===== */}
          <Route path="/" element={<Index />} />
          <Route path="/visitor-form" element={<VisitorForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <AdminLayout />
            </ThemeProvider>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="visitors" element={<AdminVisitors />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* ===== DICT Provincial Office Bukidnon Routes ===== */}
          <Route path="/dict" element={<DictIndex />} />
          <Route path="/dict/visitor-form" element={<DictVisitorForm />} />
          <Route path="/dict/admin/login" element={<DictAdminLogin />} />
          <Route path="/dict/admin" element={
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme-dict">
              <DictAdminLayout />
            </ThemeProvider>
          }>
            <Route path="dashboard" element={<DictDashboard />} />
            <Route path="visitors" element={<DictAdminVisitors />} />
            <Route path="analytics" element={<DictAnalytics />} />
            <Route path="reports" element={<DictReports />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
