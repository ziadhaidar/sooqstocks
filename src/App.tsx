import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/search" element={<StockSearch />} />
          <Route path="/stock/:symbol" element={<StockProfile />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/dips" element={<DipFinder />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/dcf" element={<DCFCalculator />} />
          <Route path="/earnings" element={<EarningsCalendar />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
