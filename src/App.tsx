import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home";
import NotFound from "./pages/NotFound";
import ScannerPage from "./pages/Scanner";
import RewardsPage from "./pages/Rewards";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";
import AdminPage from "./pages/Admin";
import LeaderboardPage from "./pages/Leaderboard";
import ProfilePage from "./pages/Profile";
import ChallengesPage from "./pages/Challenges";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/theme-provider";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { DailyBonus } from "./components/DailyBonus";
import { ConfettiProvider } from "./components/ConfettiProvider";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isBonusModalOpen, claimDailyBonus, closeBonusModal } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir(i18n.language);
  }, [i18n, i18n.language]);

  return (
    <>
      {user && (
        <DailyBonus
          isOpen={isBonusModalOpen}
          onClaim={claimDailyBonus}
          onClose={closeBonusModal}
          bonusAmount={20}
        />
      )}
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <Toaster />
          <Sonner position="bottom-center" />
          <BrowserRouter>
            <ConfettiProvider>
              <AuthProvider>
                <AppContent />
              </AuthProvider>
            </ConfettiProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;