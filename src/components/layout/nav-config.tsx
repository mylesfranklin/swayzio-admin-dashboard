import {
  LayoutDashboard,
  Activity,
  Settings,
  BarChart3,
  Mail,
  Landmark,
  Database,
  Palette,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import {
  SiHubspot,
  SiStripe,
  SiGithub,
  SiInstagram,
  SiFacebook,
  SiTiktok,
  SiYoutube,
} from "react-icons/si";
import type { IconType } from "react-icons";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon | IconType;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "General",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Ask the OS", href: "/agent", icon: Sparkles },
      { title: "Stripe", href: "/analytics/stripe", icon: SiStripe },
      { title: "HubSpot", href: "/analytics/hubspot", icon: SiHubspot },
      { title: "Database", href: "/database", icon: Database },
      { title: "Mercury", href: "/mercury", icon: Landmark },
      { title: "SEO", href: "/seo", icon: BarChart3 },
      { title: "GitHub", href: "/analytics/github", icon: SiGithub },
      { title: "Design System", href: "/design-system", icon: Palette },
    ],
  },
  {
    title: "Socials",
    items: [
      { title: "Super Followers", href: "/socials/super-followers", icon: UsersRound },
      { title: "Instagram", href: "/socials/instagram", icon: SiInstagram },
      { title: "Facebook", href: "/socials/facebook", icon: SiFacebook },
      { title: "TikTok", href: "/socials/tiktok", icon: SiTiktok },
      { title: "YouTube", href: "/socials/youtube", icon: SiYoutube },
      { title: "Kit Newsletter", href: "/analytics/kit", icon: Mail },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Sync Status", href: "/sync-status", icon: Activity },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const mobileNavItems: NavItem[] = [
  { title: "Home", href: "/", icon: LayoutDashboard },
  { title: "Stripe", href: "/analytics/stripe", icon: SiStripe },
  { title: "Mercury", href: "/mercury", icon: Landmark },
  { title: "Socials", href: "/socials/instagram", icon: SiInstagram },
  { title: "Settings", href: "/settings", icon: Settings },
];
