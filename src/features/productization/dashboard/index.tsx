import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Globe,
  Activity,
  Download,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Project Dashboard primitives. Stateless, controlled grid + cards designed
 * to be wired to any data source (Supabase, in-memory, exports list).
 */

export interface DashboardProject {
  id: string;
  name: string;
  thumbnailUrl?: string;
  status: "draft" | "active" | "archived";
  runtime?: "idle" | "ready" | "updating" | "error";
  exportState?: "none" | "ready" | "stale";
  updatedAt: string;
  template?: string;
  url?: string;
}

const STATUS_LABEL: Record<DashboardProject["status"], string> = {
  draft: "Rascunho",
  active: "Ativo",
  archived: "Arquivado",
};

const RUNTIME_LABEL: Record<NonNullable<DashboardProject["runtime"]>, string> = {
  idle: "Em espera",
  ready: "A correr",
  updating: "A atualizar",
  error: "Falhou",
};

const RUNTIME_TONE: Record<NonNullable<DashboardProject["runtime"]>, string> = {
  idle: "bg-muted text-muted-foreground",
  ready: "bg-success/15 text-success",
  updating: "bg-info/15 text-info",
  error: "bg-destructive/15 text-destructive",
};

export interface ProjectFiltersValue {
  query: string;
  status: "all" | DashboardProject["status"];
}

interface ProjectFiltersProps {
  value: ProjectFiltersValue;
  onChange: (v: ProjectFiltersValue) => void;
  right?: ReactNode;
}

export function ProjectFilters({ value, onChange, right }: ProjectFiltersProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="Pesquisar projetos…"
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              {value.status === "all" ? "Todos" : STATUS_LABEL[value.status]}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(["all", "draft", "active", "archived"] as const).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onChange({ ...value, status: s })}>
                {s === "all" ? "Todos" : STATUS_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {right}
    </div>
  );
}

interface ProjectCardProps {
  project: DashboardProject;
  onOpen?: (id: string) => void;
  onExport?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function ProjectCard({ project, onOpen, onExport, onArchive }: ProjectCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card transition-all",
        "hover:border-primary/40 hover:shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)]",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen?.(project.id)}
        className="block w-full text-left"
      >
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-muted via-muted/50 to-muted/20">
          {project.thumbnailUrl ? (
            <img
              src={project.thumbnailUrl}
              alt={project.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Globe className="h-8 w-8" />
            </div>
          )}
          <div className="absolute left-2 top-2 flex gap-1">
            <Badge variant="outline" className="bg-background/80 backdrop-blur">
              {STATUS_LABEL[project.status]}
            </Badge>
            {project.runtime && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  RUNTIME_TONE[project.runtime],
                )}
              >
                <Activity className="mr-1 inline h-3 w-3" />
                {RUNTIME_LABEL[project.runtime]}
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="flex items-start justify-between gap-2 p-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{project.name}</h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {project.updatedAt}
            {project.template && <span className="ml-2 truncate">· {project.template}</span>}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpen?.(project.id)}>Abrir</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport?.(project.id)}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onArchive?.(project.id)}>Arquivar</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface ProjectGridProps {
  projects: DashboardProject[];
  onOpen?: (id: string) => void;
  onExport?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export function ProjectGrid({ projects, ...handlers }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} {...handlers} />
      ))}
    </div>
  );
}

export function useProjectFilters(initial?: Partial<ProjectFiltersValue>) {
  const [value, setValue] = useState<ProjectFiltersValue>({
    query: "",
    status: "all",
    ...initial,
  });
  const apply = useMemo(
    () => (list: DashboardProject[]) => {
      const q = value.query.toLowerCase();
      return list.filter(
        (p) =>
          (value.status === "all" || p.status === value.status) &&
          (q === "" || p.name.toLowerCase().includes(q)),
      );
    },
    [value],
  );
  return { value, setValue, apply };
}
