"use client";

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Recycle, ScanLine, Trophy, LogOut, Shield, BarChart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from './theme-toggle';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { supabase } from '@/lib/supabaseClient';
import { showSuccess } from '@/utils/toast';

export const Navbar = () => {
  const { user, points } = useAuth();
  const animatedPoints = useAnimatedCounter(points);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showSuccess("You have been logged out.");
    navigate('/');
  };

  const navLinks = [
    { href: '/scanner', label: 'Scan', icon: ScanLine },
    { href: '/rewards', label: 'Rewards', icon: Trophy },
    { href: '/leaderboard', label: 'Leaderboard', icon: BarChart },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-6 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Recycle className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">RecycleApp</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-2 sm:space-x-4">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {user ? (
            <>
              <Badge variant="secondary" className="text-base font-semibold">
                {animatedPoints} Points
              </Badge>
              {user.email === 'adjebbar83@gmail.com' && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <div className="space-x-2">
              <Button asChild variant="ghost">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};