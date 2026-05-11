'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState, useEffect, useCallback } from 'react';
import { GAMIFICATION_CONFIG } from '@/lib/gamification';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const useGamification = () => {
  const { getAccessToken, authenticated } = usePrivy();
  const [profile, setProfile] = useState<{ xp: number; level: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!authenticated) return;
    setLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken]);

  const awardXP = async (action: 'onboarding' | 'workout-complete') => {
    if (!authenticated) return;
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_URL}/actions/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProfile(data);

      const configKey = action.toUpperCase().replace('-', '_') as keyof typeof GAMIFICATION_CONFIG.REWARDS;
      const message = GAMIFICATION_CONFIG.REWARDS[configKey]?.MESSAGE;

      return { ...data, message };
    } catch (error) {
      console.error(`Error awarding XP for ${action}:`, error);
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchProfile();
    }
  }, [authenticated, fetchProfile]);

  return { profile, loading, awardXP, refresh: fetchProfile };
};
