import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  action: string;
  description: string | null;
  created_at: string;
}

export function useCredits() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setTransactions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageThisMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return transactions
      .filter(t => new Date(t.created_at) >= startOfMonth && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getUsageByCategory = () => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(t => t.amount < 0)
      .forEach(t => {
        const category = t.action || 'Outros';
        categories[category] = (categories[category] || 0) + Math.abs(t.amount);
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    fetchTransactions();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTransactions();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    getUsageThisMonth,
    getUsageByCategory,
    refetch: fetchTransactions,
  };
}
