import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company: string | null;
  email: string | null;
  credits_balance: number;
  plan: string;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return null;
    }
  };

  const deductCredits = async (amount: number, action: string, description?: string) => {
    if (!profile) return false;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Insert transaction
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          action,
          description,
        });

      // Update balance
      const newBalance = Math.max(0, profile.credits_balance - amount);
      const { data } = await supabase
        .from('profiles')
        .update({ credits_balance: newBalance })
        .eq('id', profile.id)
        .select()
        .single();

      if (data) {
        setProfile(data);
      }

      return true;
    } catch (err) {
      console.error('Error deducting credits:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    deductCredits,
    refetch: fetchProfile,
  };
}
