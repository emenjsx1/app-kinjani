export interface NavItem {
  name: string;
  href: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigation: NavSection[] = [
  {
    title: "Foundation",
    items: [
      { name: "Design Tokens", href: "/styleguide" },
      { name: "Typography", href: "/styleguide/typography" },
      { name: "Colors", href: "/styleguide/colors" },
    ],
  },
  {
    title: "Components",
    items: [
      { name: "Buttons", href: "/styleguide/buttons" },
      { name: "Cards", href: "/styleguide/cards" },
      { name: "Badges", href: "/styleguide/badges" },
      { name: "Alerts", href: "/styleguide/alerts" },
    ],
  },
];
