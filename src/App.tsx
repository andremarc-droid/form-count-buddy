import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
