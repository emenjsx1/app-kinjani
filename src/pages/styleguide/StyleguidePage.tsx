import { StyleguideLayout } from "@/components/styleguide/StyleguideLayout";
import { ColorSwatch } from "@/components/styleguide/ColorSwatch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

const primaryColors = [
  { name: "Rich Black", colorClass: "bg-rich-black", hex: "#00DF81", cssVar: "--rich-black", textLight: true },
  { name: "Dark Green", colorClass: "bg-dark-green", hex: "#032221", cssVar: "--dark-green", textLight: true },
  { name: "Bangladesh Green", colorClass: "bg-bangladesh-green", hex: "#03624C", cssVar: "--bangladesh-green", textLight: true },
  { name: "Mountain Meadow", colorClass: "bg-mountain-meadow", hex: "#2CC295", cssVar: "--mountain-meadow", textLight: false },
  { name: "Caribbean Green", colorClass: "bg-caribbean-green", hex: "#00DF81", cssVar: "--caribbean-green", textLight: false },
  { name: "Anti-Flash White", colorClass: "bg-anti-flash-white", hex: "#F1F7F6", cssVar: "--anti-flash-white", textLight: false },
];

const secondaryColors = [
  { name: "Pine", colorClass: "bg-pine", hex: "#06302B", cssVar: "--pine", textLight: true },
  { name: "Basil", colorClass: "bg-basil", hex: "#0B453A", cssVar: "--basil", textLight: true },
  { name: "Forest", colorClass: "bg-forest", hex: "#095544", cssVar: "--forest", textLight: true },
  { name: "Frog", colorClass: "bg-frog", hex: "#17876D", cssVar: "--frog", textLight: true },
  { name: "Mint", colorClass: "bg-mint", hex: "#2FA98C", cssVar: "--mint", textLight: false },
  { name: "Stone", colorClass: "bg-stone", hex: "#707D7D", cssVar: "--stone", textLight: true },
  { name: "Pistachio", colorClass: "bg-pistachio", hex: "#AACBC4", cssVar: "--pistachio", textLight: false },
];

const semanticColors = [
  { name: "Primary", colorClass: "bg-primary", cssVar: "--primary", textLight: false },
  { name: "Secondary", colorClass: "bg-secondary", cssVar: "--secondary", textLight: true },
  { name: "Accent", colorClass: "bg-accent", cssVar: "--accent", textLight: true },
  { name: "Muted", colorClass: "bg-muted", cssVar: "--muted", textLight: false },
  { name: "Success", colorClass: "bg-success", cssVar: "--success", textLight: false },
  { name: "Warning", colorClass: "bg-warning", cssVar: "--warning", textLight: false },
  { name: "Info", colorClass: "bg-info", cssVar: "--info", textLight: true },
  { name: "Destructive", colorClass: "bg-destructive", cssVar: "--destructive", textLight: true },
];

export default function StyleguidePage() {
  return (
    <StyleguideLayout>
      <div className="p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Design Tokens</h1>
          <p className="text-lg text-muted-foreground">
            A comprehensive overview of the design system's foundation—colors, typography, and components.
          </p>
        </div>

        {/* Primary Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Primary Colors</h2>
          <p className="text-muted-foreground mb-6">The core brand palette featuring nature-inspired greens.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {primaryColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </section>

        {/* Secondary Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Secondary Colors</h2>
          <p className="text-muted-foreground mb-6">Extended palette for accents and variations.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {secondaryColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </section>

        {/* Semantic Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Semantic Colors</h2>
          <p className="text-muted-foreground mb-6">Functional colors mapped to CSS variables for consistent theming.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {semanticColors.map((color) => (
              <ColorSwatch key={color.name} {...color} />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Typography</h2>
          <p className="text-muted-foreground mb-6">Plus Jakarta Sans — a modern geometric sans-serif inspired by Axiforma.</p>
          
          <div className="space-y-6 bg-card rounded-xl p-6 border border-border">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Regular (400)</p>
                <p className="text-4xl font-normal">Aa</p>
                <p className="text-sm mt-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />1234567890!?@#$%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Medium (500)</p>
                <p className="text-4xl font-medium">Aa</p>
                <p className="text-sm font-medium mt-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />1234567890!?@#$%</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Semi Bold (600)</p>
                <p className="text-4xl font-semibold">Aa</p>
                <p className="text-sm font-semibold mt-2">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />1234567890!?@#$%</p>
              </div>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 1</p>
                <h1 className="text-4xl font-bold">The quick brown fox jumps</h1>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 2</p>
                <h2 className="text-3xl font-semibold">The quick brown fox jumps</h2>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 3</p>
                <h3 className="text-2xl font-semibold">The quick brown fox jumps</h3>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body</p>
                <p className="text-base">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Small</p>
                <p className="text-sm text-muted-foreground">The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Border Radius */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Border Radius</h2>
          <p className="text-muted-foreground mb-6">Consistent corner rounding for a cohesive feel.</p>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-sm mb-2" />
              <p className="text-sm font-medium">Small</p>
              <p className="text-xs text-muted-foreground">rounded-sm</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-md mb-2" />
              <p className="text-sm font-medium">Medium</p>
              <p className="text-xs text-muted-foreground">rounded-md</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-lg mb-2" />
              <p className="text-sm font-medium">Large</p>
              <p className="text-xs text-muted-foreground">rounded-lg</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full mb-2" />
              <p className="text-sm font-medium">Full</p>
              <p className="text-xs text-muted-foreground">rounded-full</p>
            </div>
          </div>
        </section>

        {/* Components Preview */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-1">Component Preview</h2>
          <p className="text-muted-foreground mb-6">Core UI components using the design tokens.</p>

          <div className="space-y-8">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-medium mb-4">Buttons</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h3 className="text-lg font-medium mb-4">Badges</h3>
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-lg font-medium mb-4">Cards</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>Card description with muted text styling.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Card content goes here. This demonstrates the card component with proper spacing and borders.</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary text-primary-foreground border-0">
                  <CardHeader>
                    <CardTitle>Primary Card</CardTitle>
                    <CardDescription className="text-primary-foreground/70">Inverted color scheme.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>This card uses the primary color as background.</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h3 className="text-lg font-medium mb-4">Alerts</h3>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>This is an informational alert message.</AlertDescription>
                </Alert>
                <Alert className="border-success bg-success/10">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Operation completed successfully.</AlertDescription>
                </Alert>
                <Alert className="border-warning bg-warning/10">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>Please review before proceeding.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Something went wrong. Please try again.</AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </section>
      </div>
    </StyleguideLayout>
  );
}
