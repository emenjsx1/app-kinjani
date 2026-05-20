import { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppTopbar } from "./AppTopbar";

interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  credits?: number;
}

export function AppLayout({ children, pageTitle, credits }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background bg-aurora">
        <AppSidebar />
        <SidebarInset className="flex-1 bg-transparent">
          <AppTopbar pageTitle={pageTitle} credits={credits} />
          <main className="flex-1 p-4 lg:p-6 animate-fade-in">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
