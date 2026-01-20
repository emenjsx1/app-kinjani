import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StyleguidePage from "./pages/styleguide/StyleguidePage";
import DashboardPage from "./pages/DashboardPage";
import AgentsPage from "./pages/AgentsPage";
import AgentDetailsPage from "./pages/AgentDetailsPage";
import WebsitesPage from "./pages/WebsitesPage";
import WebsiteEditorPage from "./pages/WebsiteEditorPage";
import DemoPage from "./pages/DemoPage";
import CreditsPage from "./pages/CreditsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import ClientConnectPage from "./pages/ClientConnectPage";
import PublicWebsitePage from "./pages/PublicWebsitePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/agents/:id" element={<AgentDetailsPage />} />
          <Route path="/websites" element={<WebsitesPage />} />
          <Route path="/websites/:id/edit" element={<WebsiteEditorPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/styleguide" element={<StyleguidePage />} />
          {/* Public routes */}
          <Route path="/connect/:token" element={<ClientConnectPage />} />
          <Route path="/site/:siteId" element={<PublicWebsitePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
