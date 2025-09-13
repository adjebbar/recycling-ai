"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  points: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(0);

  const addPoints = (amount: number) => {
    setPoints((prevPoints) => prevPoints + amount);
  };

  const spendPoints = (amount: number) => {
    setPoints((prevPoints) => {
      if (prevPoints >= amount) {
        return prevPoints - amount;
      }
      return prevPoints;
    });
  };

  return (
    <UserContext.Provider value={{ points, addPoints, spendPoints }}>
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