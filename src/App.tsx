import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScannerPage from "./pages/Scanner";
import RewardsPage from "./pages/Rewards";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/scanner" element={<ScannerPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;