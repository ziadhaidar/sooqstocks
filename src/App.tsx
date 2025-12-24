import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import StockSearch from "./pages/StockSearch";
import StockProfile from "./pages/StockProfile";
import WatchlistPage from "./pages/WatchlistPage";
import DipFinder from "./pages/DipFinder";
import PortfolioPage from "./pages/PortfolioPage";
import DCFCalculator from "./pages/DCFCalculator";
import EarningsCalendar from "./pages/EarningsCalendar";
import NewsPage from "./pages/NewsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper for admin-only features
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

// Protected route wrapper for authenticated users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/search" 
        element={<ProtectedRoute><StockSearch /></ProtectedRoute>} 
      />
      <Route 
        path="/stock/:symbol" 
        element={<ProtectedRoute><StockProfile /></ProtectedRoute>} 
      />
      <Route 
        path="/watchlist" 
        element={<AdminRoute><WatchlistPage /></AdminRoute>} 
      />
      <Route 
        path="/dips" 
        element={<ProtectedRoute><DipFinder /></ProtectedRoute>} 
      />
      <Route 
        path="/portfolio" 
        element={<AdminRoute><PortfolioPage /></AdminRoute>} 
      />
      <Route 
        path="/dcf" 
        element={<ProtectedRoute><DCFCalculator /></ProtectedRoute>} 
      />
      <Route 
        path="/earnings" 
        element={<ProtectedRoute><EarningsCalendar /></ProtectedRoute>} 
      />
      <Route 
        path="/news" 
        element={<ProtectedRoute><NewsPage /></ProtectedRoute>} 
      />
      <Route 
        path="/settings" 
        element={<AdminRoute><SettingsPage /></AdminRoute>} 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
