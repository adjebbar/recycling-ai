"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { isBefore, startOfToday } from 'date-fns';
import { useConfetti } from '@/components/ConfettiProvider';
import { achievementsList } from '@/lib/achievements';

const DAILY_BONUS_AMOUNT = 20;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  points: number;
  totalScans: number;
  totalBottlesRecycled: number;
  activeRecyclers: number;
  isBonusModalOpen: boolean;
  addPoints: (amount: number, barcode?: string) => Promise<void>;
  addBonusPoints: (amount: number) => Promise<void>;
  spendPoints: (amount: number) => Promise<void>;
  resetCommunityStats: () => Promise<void>;
  fetchCommunityStats: () => Promise<void>;
  claimDailyBonus: () => Promise<void>;
  closeBonusModal: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);

  const [points, setPoints] = useState(0);
  const [totalScans, setTotalScans] = useState(0);
  const [anonymousPoints, setAnonymousPoints] = useState(0);
  const [totalBottlesRecycled, setTotalBottlesRecycled] = useState(0);
  const [activeRecyclers, setActiveRecyclers] = useState(0);
  const { fire: fireConfetti } = useConfetti();

  const fetchCommunityStats = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_stats')
      .select('total_bottles_recycled, active_recyclers')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching community stats:', error.message);
    } else if (data) {
      setTotalBottlesRecycled(data.total_bottles_recycled);
      setActiveRecyclers(data.active_recyclers);
    }
  }, []);

  const fetchUserProfile = useCallback(async (currentUser: User) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('points, last_login')
      .eq('id', currentUser.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    const { count, error: countError } = await supabase
      .from('scan_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', currentUser.id);
    
    if (countError) {
      console.error('Error fetching scan count:', countError);
      return { ...profile, totalScans: 0 };
    }

    return { ...profile, totalScans: count ?? 0 };
  }, []);

  useEffect(() => {
    const getSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);

      if (currentUser) {
        const profileAndStats = await fetchUserProfile(currentUser);
        if (profileAndStats) {
          setPoints(profileAndStats.points);
          setTotalScans(profileAndStats.totalScans);
          const lastLogin = profileAndStats.last_login ? new Date(profileAndStats.last_login) : null;
          if (!lastLogin || isBefore(lastLogin, startOfToday())) {
            setIsBonusModalOpen(true);
          }
        }
      } else {
        const localPoints = Number(localStorage.getItem('anonymousPoints') || '0');
        setAnonymousPoints(localPoints);
      }
      await fetchCommunityStats();
      setLoading(false);
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      const oldUser = user;
      
      if (newUser && !oldUser) {
        const localPoints = Number(localStorage.getItem('anonymousPoints') || '0');
        const profileAndStats = await fetchUserProfile(newUser);
        let currentPoints = profileAndStats?.points || 0;

        if (localPoints > 0) {
          showSuccess(`Merging ${localPoints} saved points to your account!`);
          currentPoints += localPoints;
          await supabase.from('profiles').update({ points: currentPoints }).eq('id', newUser.id);
          localStorage.removeItem('anonymousPoints');
          setAnonymousPoints(0);
        }
        setPoints(currentPoints);
        setTotalScans(profileAndStats?.totalScans || 0);
        
        const lastLogin = profileAndStats?.last_login ? new Date(profileAndStats.last_login) : null;
        if (!lastLogin || isBefore(lastLogin, startOfToday())) {
          setIsBonusModalOpen(true);
        }
      } else if (!newUser && oldUser) {
        setPoints(0);
        setTotalScans(0);
      }
      
      setSession(session);
      setUser(newUser);
    });

    return () => subscription.unsubscribe();
  }, [fetchCommunityStats, fetchUserProfile, user]);

  const addPoints = async (amount: number, barcode?: string) => {
    const originalTotalBottles = totalBottlesRecycled;
    setTotalBottlesRecycled(prevTotal => prevTotal + 1);
    const { error: statsError } = await supabase.rpc('increment_total_bottles');
    if (statsError) {
      setTotalBottlesRecycled(originalTotalBottles);
      console.error("Failed to update community stats:", statsError.message);
    }

    if (user) {
      const oldStats = { points, totalScans };
      const newPoints = points + amount;
      const newTotalScans = totalScans + 1;

      setPoints(newPoints);
      setTotalScans(newTotalScans);

      const { error } = await supabase.from('profiles').update({ points: newPoints }).eq('id', user.id);
      if (error) {
        setPoints(points);
        setTotalScans(totalScans);
        showError("Failed to update your points.");
        return;
      }
      await supabase.from('scan_history').insert({ user_id: user.id, points_earned: amount, product_barcode: barcode });

      const newStats = { points: newPoints, totalScans: newTotalScans };
      achievementsList.forEach(achievement => {
        if (!achievement.condition(oldStats) && achievement.condition(newStats)) {
          fireConfetti();
          showSuccess("🎉 Achievement Unlocked! 🎉");
        }
      });
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
      setPoints(points);
      showError("Failed to claim bonus points.");
      throw error;
    }
  };

  const claimDailyBonus = async () => {
    if (!user) return;
    try {
      await addBonusPoints(DAILY_BONUS_AMOUNT);
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', user.id);
      showSuccess(`You've claimed your daily bonus of ${DAILY_BONUS_AMOUNT} points!`);
      setIsBonusModalOpen(false);
    } catch (error) {
      showError("Could not claim daily bonus. Please try again.");
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
    totalScans: user ? totalScans : 0,
    totalBottlesRecycled,
    activeRecyclers,
    isBonusModalOpen,
    addPoints,
    addBonusPoints,
    spendPoints,
    resetCommunityStats,
    fetchCommunityStats,
    claimDailyBonus,
    closeBonusModal: () => setIsBonusModalOpen(false),
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