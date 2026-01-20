import { useTheme } from "next-themes";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

interface ThemeLogoProps {
  className?: string;
  alt?: string;
}

export function ThemeLogo({ className = "h-10 w-auto", alt = "KINJA AI" }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  
  // For sidebar (dark background), always use white logo
  // For regular use, use theme-aware logo
  const logo = resolvedTheme === "dark" ? logoDark : logoLight;

  return (
    <img 
      src={logo} 
      alt={alt} 
      className={className}
    />
  );
}

// For dark backgrounds (sidebar), always use the white logo
export function SidebarLogo({ className = "h-10 w-auto", alt = "KINJA AI" }: ThemeLogoProps) {
  return (
    <img 
      src={logoDark} 
      alt={alt} 
      className={className}
    />
  );
}
