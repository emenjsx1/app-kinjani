import { useState } from "react";
import { Plus, Search, MoreHorizontal, Globe, ExternalLink } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

interface Website {
  id: string;
  name: string;
  type: "landing" | "institutional";
  status: "active" | "draft" | "inactive";
  url: string;
  createdAt: string;
}

const mockWebsites: Website[] = [
  {
    id: "1",
    name: "Product Landing Page",
    type: "landing",
    status: "active",
    url: "https://product.kinja.ai",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Company Website",
    type: "institutional",
    status: "active",
    url: "https://company.kinja.ai",
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    name: "New Campaign",
    type: "landing",
    status: "draft",
    url: "",
    createdAt: "2024-02-01",
  },
];

export default function WebsitesPage() {
  const [websites] = useState<Website[]>(mockWebsites);
  const [search, setSearch] = useState("");

  const filteredWebsites = websites.filter((site) =>
    site.name.toLowerCase().includes(search.toLowerCase())
  );

  const getTypeBadge = (type: Website["type"]) => {
    return (
      <Badge variant="outline" className={type === "landing" ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"}>
        {type === "landing" ? "Landing Page" : "Institutional"}
      </Badge>
    );
  };

  return (
    <AppLayout pageTitle="Websites" credits={1250}>
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search websites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Website
          </Button>
        </div>

        {/* Websites Grid */}
        {filteredWebsites.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState
                icon={Globe}
                title="No websites found"
                description="Generate your first AI-powered website"
                action={{
                  label: "Create Website",
                  onClick: () => console.log("Create website"),
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredWebsites.map((site) => (
              <Card key={site.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{site.name}</CardTitle>
                        <CardDescription className="text-xs">
                          Created {site.createdAt}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem>View Live</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    {getTypeBadge(site.type)}
                    <StatusBadge status={site.status} />
                  </div>
                  {site.url && (
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {site.url.replace("https://", "")}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
