import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StyleguidePage from "./pages/styleguide/StyleguidePage";
import DashboardPage from "./pages/DashboardPage";
import AgentsPage from "./pages/AgentsPage";
import AgentDetailsPage from "./pages/AgentDetailsPage";
import WebsitesPage from "./pages/WebsitesPage";
import GenesisPreviewPage from "./pages/GenesisPreviewPage";
import WebsiteEditorPage from "./pages/WebsiteEditorPage";
import DemoPage from "./pages/DemoPage";
import CreditsPage from "./pages/CreditsPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import ClientConnectPage from "./pages/ClientConnectPage";
import PublicWebsitePage from "./pages/PublicWebsitePage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import ReportsPage from "./pages/ReportsPage";
import AuthPage from "./pages/AuthPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Phase6ShowcasePage from "./pages/Phase6ShowcasePage";
import CloudPage from "./pages/CloudPage";
import DomainsPage from "./pages/DomainsPage";
import WhatsAppSettingsPage from "./pages/WhatsAppSettingsPage";
import EmailSettingsPage from "./pages/EmailSettingsPage";
import EmbedPage from "./pages/EmbedPage";
import AdminPage from "./pages/AdminPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="/styleguide" element={<StyleguidePage />} />
            <Route path="/phase6" element={<Phase6ShowcasePage />} />
            <Route path="/connect/:token" element={<ClientConnectPage />} />
            <Route path="/site/:siteId" element={<PublicWebsitePage />} />
            <Route path="/s/:slug" element={<PublicWebsitePage />} />
            <Route path="/genesis-preview" element={<GenesisPreviewPage />} />
            <Route path="/embed/:agentId" element={<EmbedPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
            <Route path="/agents/:id" element={<ProtectedRoute><AgentDetailsPage /></ProtectedRoute>} />
            <Route path="/websites" element={<ProtectedRoute><WebsitesPage /></ProtectedRoute>} />
            <Route path="/editor/:id" element={<ProtectedRoute><WebsiteEditorPage /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/credits" element={<ProtectedRoute><CreditsPage /></ProtectedRoute>} />
            <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
            <Route path="/integrations/whatsapp" element={<ProtectedRoute><WhatsAppSettingsPage /></ProtectedRoute>} />
            <Route path="/integrations/email" element={<ProtectedRoute><EmailSettingsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/cloud" element={<ProtectedRoute><CloudPage /></ProtectedRoute>} />
            <Route path="/domains" element={<ProtectedRoute><DomainsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
