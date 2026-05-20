/**
 * Phase H — Environment & secrets management.
 * Real env profiles persisted client-side; secret *values* live in Supabase
 * secrets and are never stored here (we only track names + presence).
 */

import type { EnvironmentProfile } from "./types";

const STORAGE_KEY = "kinjani.envs.v1";

function load(): EnvironmentProfile[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (Array.isArray(raw) && raw.length) return raw;
  } catch {
    /* ignore */
  }
  return [
    { id: "env_preview", name: "Preview", kind: "preview", vars: {}, secrets: [], active: true },
    { id: "env_staging", name: "Staging", kind: "staging", vars: {}, secrets: [], active: false },
    { id: "env_production", name: "Production", kind: "production", vars: {}, secrets: [], active: false },
  ];
}

function save(list: EnvironmentProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export const EnvironmentManager = {
  list: () => load(),
  upsert(env: EnvironmentProfile) {
    const list = load();
    const i = list.findIndex((e) => e.id === env.id);
    if (i >= 0) list[i] = env;
    else list.push(env);
    save(list);
    return env;
  },
  activate(id: string) {
    const list = load().map((e) => ({ ...e, active: e.id === id }));
    save(list);
    return list;
  },
  setVar(envId: string, key: string, value: string) {
    const list = load();
    const env = list.find((e) => e.id === envId);
    if (!env) return;
    env.vars[key] = value;
    save(list);
  },
  registerSecretName(envId: string, name: string) {
    const list = load();
    const env = list.find((e) => e.id === envId);
    if (!env) return;
    if (!env.secrets.includes(name)) env.secrets.push(name);
    save(list);
  },
};
