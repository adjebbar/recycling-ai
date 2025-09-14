"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { showError } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  points: number;
  totalBottlesRecycled: number;
  activeRecyclers: number;
  addPoints: (amount: number) => Promise<void>;
  spendPoints: (amount: number) => Promise<void>;
  resetCommunityStats: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [points, setPoints] = useState(0);
  const [totalBottlesRecycled, setTotalBottlesRecycled] = useState(0);
  const [activeRecyclers, setActiveRecyclers] = useState(0);

  const fetchCommunityStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_stats')
      .select('total_bottles_recycled, active_recyclers')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching community stats:', error);
      showError("Could not load community stats.");
    } else if (data) {
      setTotalBottlesRecycled(data.total_bottles_recycled);
      setActiveRecyclers(data.active_recyclers);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          setPoints(data.points);
        }
      };
      fetchProfile();
    } else {
      setPoints(0);
    }
  }, [user]);

  useEffect(() => {
    const getSessionAndStats = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      await fetchCommunityStats();
      setLoading(false);
    };

    getSessionAndStats();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCommunityStats]);

  const addPoints = async (amount: number) => {
    if (!user) return;

    const newPoints = points + amount;
    setPoints(newPoints);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (profileError) {
      setPoints(points);
      showError("Failed to update your points.");
      console.error(profileError);
      return;
    }

    const newTotalBottles = totalBottlesRecycled + 1;
    setTotalBottlesRecycled(newTotalBottles);

    const { error: statsError } = await supabase
      .from('community_stats')
      .update({ total_bottles_recycled: newTotalBottles })
      .eq('id', 1);
    
    if (statsError) {
      setTotalBottlesRecycled(totalBottlesRecycled);
      showError("Failed to update community stats.");
      console.error(statsError);
    }
  };

  const spendPoints = async (amount: number) => {
    if (!user || points < amount) return;

    const newPoints = points - amount;
    setPoints(newPoints);

    const { error } = await supabase
      .from('profiles')
      .update({ points: newPoints })
      .eq('id', user.id);

    if (error) {
      setPoints(points);
      showError("Failed to redeem reward.");
      console.error(error);
    }
  };

  const resetCommunityStats = async () => {
    const newTotalBottles = 0;
    const newActiveRecyclers = 0;

    setTotalBottlesRecycled(newTotalBottles);
    setActiveRecyclers(newActiveRecyclers);

    const { error } = await supabase
      .from('community_stats')
      .update({ total_bottles_recycled: newTotalBottles, active_recyclers: newActiveRecyclers })
      .eq('id', 1);

    if (error) {
      showError("Failed to reset community stats.");
      console.error(error);
      fetchCommunityStats();
    }
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