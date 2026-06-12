import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  action: string;
  description: string | null;
  created_at: string;
}

export function useCreditTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = useCallback(async (pageNum = 0) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(pageNum * limit, (pageNum + 1) * limit - 1);

      if (error) throw error;
      if (data) {
        if (pageNum === 0) {
          setTransactions(data as CreditTransaction[]);
        } else {
          setTransactions(prev => [...prev, ...data as CreditTransaction[]]);
        }
        setHasMore(data.length === limit);
      }
    } catch (err) {
      console.error("Error fetching credit transactions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTransactions(nextPage);
  };

  useEffect(() => {
    fetchTransactions(0);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchTransactions(0);
    });
    return () => subscription.unsubscribe();
  }, [fetchTransactions]);

  return { transactions, isLoading, hasMore, loadMore, refetch: () => fetchTransactions(0) };
}
