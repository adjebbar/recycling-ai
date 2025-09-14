"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  points: number;
  totalBottlesRecycled: number;
  activeRecyclers: number;
  addPoints: (amount: number, barcode?: string) => Promise<void>;
  addBonusPoints: (amount: number) => Promise<void>;
  spendPoints: (amount: number) => Promise<void>;
  resetCommunityStats: () => Promise<void>;
  fetchCommunityStats: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [points, setPoints] = useState(0);
  const [anonymousPoints, setAnonymousPoints] = useState(0);
  const [totalBottlesRecycled, setTotalBottlesRecycled] = useState(0);
  const [activeRecyclers, setActiveRecyclers] = useState(0);

  const fetchCommunityStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_stats')
      .select('total_bottles_recycled, active_recyclers')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching community stats:', error.message);
      // Fail silently instead of showing an error to the user
    } else if (data) {
      setTotalBottlesRecycled(data.total_bottles_recycled);
      setActiveRecyclers(data.active_recyclers);
    }
  }, []);

  const fetchUserPoints = useCallback(async (currentUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('points')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else if (data) {
      setPoints(data.points);
    }
  }, []);

  useEffect(() => {
    const getSessionAndStats = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);

      if (currentUser) {
        await fetchUserPoints(currentUser);
      } else {
        const localPoints = Number(localStorage.getItem('anonymousPoints') || '0');
        setAnonymousPoints(localPoints);
      }
      await fetchCommunityStats();
      setLoading(false);
    };

    getSessionAndStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      const oldUser = user;
      
      if (newUser && !oldUser) { // User logged in
        const localPoints = Number(localStorage.getItem('anonymousPoints') || '0');
        if (localPoints > 0) {
          showSuccess(`Merging ${localPoints} saved points to your account!`);
          const { data: profile, error } = await supabase.from('profiles').select('points').eq('id', newUser.id).single();
          if (profile) {
            const newTotalPoints = profile.points + localPoints;
            await supabase.from('profiles').update({ points: newTotalPoints }).eq('id', newUser.id);
            localStorage.removeItem('anonymousPoints');
            setAnonymousPoints(0);
            setPoints(newTotalPoints);
          }
        } else {
          await fetchUserPoints(newUser);
        }
      } else if (!newUser && oldUser) { // User logged out
        setPoints(0);
      }
      
      setSession(session);
      setUser(newUser);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCommunityStats, fetchUserPoints, user]);

  const addPoints = async (amount: number, barcode?: string) => {
    const originalTotalBottles = totalBottlesRecycled;
    setTotalBottlesRecycled(prevTotal => prevTotal + 1);
    const { error: statsError } = await supabase.rpc('increment_total_bottles');
    if (statsError) {
      setTotalBottlesRecycled(originalTotalBottles);
      console.error("Failed to update community stats:", statsError.message);
      // Fail silently
    }

    if (user) {
      const newPoints = points + amount;
      setPoints(newPoints);
      const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
      if (error) {
        setPoints(points);
        showError("Failed to update your points.");
        return;
      }
      await supabase.from('scan_history').insert({ user_id: user.id, points_earned: amount, product_barcode: barcode });
    } else {
      const newAnonymousPoints = anonymousPoints + amount;
      setAnonymousPoints(newAnonymousPoints);
      localStorage.setItem('anonymousPoints', String(newAnonymousPoints));
    }
  };

  const addBonusPoints = async (amount: number) => {
    if (!user) return;
    const newPoints = points + amount;
    setPoints(newPoints);
    const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
    if (error) {
      setPoints(points); // Revert on failure
      showError("Failed to claim bonus points.");
      throw error;
    }
  };

  const spendPoints = async (amount: number) => {
    if (!user || points < amount) return;
    const newPoints = points - amount;
    setPoints(newPoints);
    const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
    if (error) {
      setPoints(points);
      showError("Failed to redeem reward.");
    }
  };

  const resetCommunityStats = async () => {
    await supabase.from('community_stats').update({ total_bottles_recycled: 0, active_recyclers: 0 }).eq('id', 1);
    await fetchCommunityStats();
  };

  const value = {
    session,
    user,
    points: user ? points : anonymousPoints,
    totalBottlesRecycled,
    activeRecyclers,
    addPoints,
    addBonusPoints,
    spendPoints,
    resetCommunityStats,
    fetchCommunityStats,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};