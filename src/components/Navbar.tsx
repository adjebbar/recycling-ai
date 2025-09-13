"use client";

import { Link } from 'react-router-dom';
import { Package, ScanLine, Trophy } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

export const Navbar = () => {
  const { points } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold">RecycleApp</span>
          </Link>
        </div>
        <nav className="flex flex-1 items-center space-x-4">
          <Link to="/scanner">
            <Button variant="ghost">
              <ScanLine className="mr-2 h-4 w-4" />
              Scan
            </Button>
          </Link>
          <Link to="/rewards">
            <Button variant="ghost">
              <Trophy className="mr-2 h-4 w-4" />
              Rewards
            </Button>
          </Link>
        </nav>
        <div className="flex items-center justify-end space-x-4">
          <span className="font-semibold">{points} Points</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};