"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  points: number;
  totalBottlesRecycled: number;
  activeRecyclers: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => void;
  resetCommunityStats: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(0);
  // Initialize with starting values for demonstration
  const [totalBottlesRecycled, setTotalBottlesRecycled] = useState(125432);
  const [activeRecyclers, setActiveRecyclers] = useState(876);
  const [hasScanned, setHasScanned] = useState(false);

  const addPoints = (amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);
    // Each successful scan adds one bottle to the total
    setTotalBottlesRecycled((prevTotal) => prevTotal + 1);

    // If this is the user's first scan, they become a new active recycler
    if (!hasScanned) {
      setActiveRecyclers((prevRecyclers) => prevRecyclers + 1);
      setHasScanned(true);
    }
  };

  const spendPoints = (amount: number) => {
    setPoints((prevPoints) => {
      if (prevPoints >= amount) {
        return prevPoints - amount;
      }
      return prevPoints;
    });
  };

  const resetCommunityStats = () => {
    setTotalBottlesRecycled(0);
    setActiveRecyclers(0);
    // Also reset the current user's points for a full demo reset
    setPoints(0);
    setHasScanned(false);
  };

  return (
    <UserContext.Provider value={{ points, totalBottlesRecycled, activeRecyclers, addPoints, spendPoints, resetCommunityStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};