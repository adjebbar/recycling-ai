"use client";

import { Link, useLocation } from 'react-router-dom';
import { Recycle, ScanLine, Trophy } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { ThemeToggle } from './theme-toggle';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const Navbar = () => {
  const { points } = useUser();
  const animatedPoints = useAnimatedCounter(points);
  const location = useLocation();

  const navLinks = [
    { href: '/scanner', label: 'Scan', icon: ScanLine },
    { href: '/rewards', label: 'Rewards', icon: Trophy },
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
          <Badge variant="secondary" className="text-base font-semibold">
            {animatedPoints} Points
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};