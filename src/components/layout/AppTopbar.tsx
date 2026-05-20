import { Bell, Search, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CreditsBadge } from "@/components/ui/credits-badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface AppTopbarProps {
  pageTitle?: string;
  credits?: number;
}

interface Notification {
  id: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function AppTopbar({ pageTitle = "Dashboard", credits = 0 }: AppTopbarProps) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id,title,message,link,is_read,created_at")
      .order("created_at", { ascending: false })
      .limit(15);
    setNotifications((data ?? []) as Notification[]);
  };

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel("notifications-topbar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => loadNotifications()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    if (!profile) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", profile.user_id)
      .eq("is_read", false);
    loadNotifications();
  };

  const openNotification = async (n: Notification) => {
    if (!n.is_read) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
    }
    if (n.link) navigate(n.link);
    loadNotifications();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const routes: Record<string, string> = {
      agente: "/agents",
      agentes: "/agents",
      site: "/websites",
      sites: "/websites",
      website: "/websites",
      cliente: "/clients",
      clientes: "/clients",
      crédito: "/credits",
      creditos: "/credits",
      créditos: "/credits",
      integracao: "/integrations",
      integração: "/integrations",
      integrações: "/integrations",
      definicoes: "/settings",
      definições: "/settings",
      relatorio: "/reports",
      relatórios: "/reports",
    };
    const target = routes[q] || `/agents?q=${encodeURIComponent(q)}`;
    navigate(target);
    setSearch("");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Sessão terminada");
      navigate("/");
    }
  };

  const displayName = profile?.full_name || profile?.email?.split("@")[0] || "Utilizador";
  const displayEmail = profile?.email || "—";
  const initials = (displayName || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 glass px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="lg:hidden" />
        <h1 className="text-xl font-semibold tracking-tight text-gradient-primary">{pageTitle}</h1>
        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="live-dot" /> ao vivo
        </span>
      </div>

      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="hidden md:flex relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar... (ex: agentes, sites)"
            className="w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </form>

        <CreditsBadge credits={credits} />
        <ThemeToggle />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-semibold">Notificações</p>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={markAllRead}>
                  <Check className="h-3 w-3" /> Marcar todas
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Sem notificações
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={`w-full text-left px-4 py-3 border-b last:border-0 hover:bg-muted/50 transition ${
                      !n.is_read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && (
                        <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: pt })}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Definições</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/credits")}>Créditos</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Terminar sessão
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
