"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  points: number;
  totalBottlesRecycled: number;
  activeRecyclers: number;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => void;
  resetCommunityStats: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // NOTE: The following stats are currently local.
  // For a production app, these should be stored and managed in your Supabase database.
  const [points, setPoints] = useState(0);
  const [totalBottlesRecycled, setTotalBottlesRecycled] = useState(125432);
  const [activeRecyclers, setActiveRecyclers] = useState(876);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addPoints = (amount: number) => {
    if (!user) return; // Only add points for logged-in users
    setPoints((prevPoints) => prevPoints + amount);
    setTotalBottlesRecycled((prevTotal) => prevTotal + 1);
    if (!hasScanned) {
      setActiveRecyclers((prevRecyclers) => prevRecyclers + 1);
      setHasScanned(true);
    }
  };

  const spendPoints = (amount: number) => {
    if (!user) return;
    setPoints((prevPoints) => Math.max(0, prevPoints - amount));
  };

  const resetCommunityStats = () => {
    setTotalBottlesRecycled(0);
    setActiveRecyclers(0);
    setPoints(0);
    setHasScanned(false);
  };

  const value = {
    session,
    user,
    points,
    totalBottlesRecycled,
    activeRecyclers,
    addPoints,
    spendPoints,
    resetCommunityStats,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};