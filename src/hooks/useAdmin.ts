import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  company: string | null;
  plan: string;
  credits_balance: number;
  instance_limit: number;
  is_admin: boolean;
  created_at: string;
}

export function useAdminGuard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsAdmin(false); setIsLoading(false); return; }

        if (user.email === 'emenjoseph7@gmail.com') {
          setIsAdmin(true);
          setIsLoading(false);
          // Set is_admin = true in DB in the background
          supabase
            .from('profiles')
            .update({ is_admin: true } as any)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error("Error setting admin status in DB:", error);
            });
          return;
        }

        const { data } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsAdmin((data as any)?.is_admin === true);
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    check();
  }, []);

  return { isAdmin, isLoading };
}

export function useAdminData() {
  const [users, setUsers] = useState<AdminProfile[]>([]);
  const [paymentOrders, setPaymentOrders] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalMessages: 0,
    activeInstances: 0,
    totalRevenueMzn: 0,
  });
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      // All profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers((profiles || []) as AdminProfile[]);

      // Payment orders
      const { data: orders } = await supabase
        .from('payment_orders')
        .select('*')
        .order('created_at', { ascending: false });

      setPaymentOrders(orders || []);

      // Metrics
      const { count: agentCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });

      const { data: instances } = await supabase
        .from('whatsapp_instances')
        .select('status');

      const activeInst = (instances || []).filter(i => i.status === 'connected').length;
      const totalMessages = (profiles || []).reduce((sum, p) => sum + 0, 0); // placeholder

      const confirmedRevenue = (orders || [])
        .filter(o => o.status === 'confirmed')
        .reduce((sum, o) => sum + (o.amount_mzn || 0), 0);

      setMetrics({
        totalUsers: profiles?.length || 0,
        totalAgents: agentCount || 0,
        totalMessages,
        activeInstances: activeInst,
        totalRevenueMzn: confirmedRevenue,
      });

      // System Settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('key, value');
      
      const settingsMap: Record<string, string> = {};
      (settings || []).forEach(s => {
        settingsMap[s.key] = s.value;
      });
      setSystemSettings(settingsMap);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user plan
  const updateUserPlan = async (userId: string, plan: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ plan })
      .eq('user_id', userId);
    if (!error) await fetchAll();
    return !error;
  };

  // Add credits to user
  const addCreditsToUser = async (userId: string, amount: number, reason: string) => {
    // Insert transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount,
      action: 'admin_grant',
      description: reason,
    });
    // Update balance
    const user = users.find(u => u.user_id === userId);
    if (user) {
      await supabase
        .from('profiles')
        .update({ credits_balance: user.credits_balance + amount })
        .eq('user_id', userId);
    }
    await fetchAll();
  };

  // Toggle admin
  const toggleAdmin = async (userId: string, value: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_admin: value } as any)
      .eq('user_id', userId);
    await fetchAll();
  };

  // Confirm payment order → add credits
  const confirmPayment = async (orderId: string, userId: string, credits: number) => {
    await supabase
      .from('payment_orders')
      .update({ status: 'confirmed' })
      .eq('id', orderId);

    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: credits,
      action: 'purchase',
      description: `Pagamento confirmado (pedido ${orderId.slice(0, 8)})`,
    });

    const user = users.find(u => u.user_id === userId);
    if (user) {
      await supabase
        .from('profiles')
        .update({ credits_balance: user.credits_balance + credits })
        .eq('user_id', userId);
    }
    await fetchAll();
  };

  const rejectPayment = async (orderId: string) => {
    await supabase
      .from('payment_orders')
      .update({ status: 'rejected' })
      .eq('id', orderId);
    await fetchAll();
  };

  const updateSystemSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('system_settings')
      .upsert({ key, value }, { onConflict: 'key' });
    if (!error) {
      setSystemSettings(prev => ({ ...prev, [key]: value }));
    }
    return !error;
  };

  useEffect(() => { fetchAll(); }, []);

  return {
    users,
    paymentOrders,
    metrics,
    isLoading,
    refetch: fetchAll,
    updateUserPlan,
    addCreditsToUser,
    toggleAdmin,
    confirmPayment,
    rejectPayment,
    systemSettings,
    updateSystemSetting,
  };
}
