export function isPlatformHost(host: string): boolean {
  // Check localhost and local IPs
  if (/localhost|127\.0\.0\.1|^192\.168\./i.test(host)) return true;
  
  // Check lovable project hosts and vercel domains
  if (/lovable(project)?\.app$/i.test(host)) return true;
  if (/\.vercel\.app$/i.test(host)) return true;

  // Check custom platform domain configured in environment
  const platformDomain = (import.meta.env.VITE_APP_DOMAIN as string) || "";
  if (platformDomain) {
    const cleanHost = host.split(':')[0].toLowerCase();
    const cleanPlatform = platformDomain.replace(/^https?:\/\//, '').split(':')[0].toLowerCase();
    if (cleanHost === cleanPlatform || cleanHost.endsWith('.' + cleanPlatform)) {
      return true;
    }
  }

  return false;
}
