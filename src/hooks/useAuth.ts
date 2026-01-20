import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName || "",
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este email já está registado. Tente fazer login.");
        } else {
          toast.error(error.message);
        }
        return { error, data: null };
      }

      toast.success("Conta criada! Verifique o seu email para confirmar.");
      return { error: null, data };
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      return { error, data: null };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ou palavra-passe incorretos.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Por favor confirme o seu email antes de fazer login.");
        } else {
          toast.error(error.message);
        }
        return { error, data: null };
      }

      toast.success("Login efetuado com sucesso!");
      return { error: null, data };
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      return { error, data: null };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        return { error };
      }
      toast.success("Sessão terminada.");
      return { error: null };
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      return { error };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
        return { error, data: null };
      }

      return { error: null, data };
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
      return { error, data: null };
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };
}
