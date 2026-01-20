import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Palette, Layout, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Palette,
    title: "Rich Color Palette",
    description: "Nature-inspired greens from Caribbean teal to deep forest, with full semantic color support.",
  },
  {
    icon: Layout,
    title: "Modern Typography",
    description: "Plus Jakarta Sans brings a geometric, professional feel inspired by Axiforma.",
  },
  {
    icon: Zap,
    title: "Ready Components",
    description: "Pre-styled buttons, cards, badges, and alerts using your design tokens.",
  },
  {
    icon: Sparkles,
    title: "Dark Mode Ready",
    description: "Complete dark theme with inverted colors for comfortable viewing.",
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--caribbean-green)/0.3),transparent_50%)]" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
          <Badge className="mb-6 bg-caribbean-green/20 text-caribbean-green border-caribbean-green/30 hover:bg-caribbean-green/30">
            Design System v1.0
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-anti-flash-white mb-6 max-w-3xl leading-tight">
            A nature-inspired design system built for{" "}
            <span className="text-caribbean-green">modern apps</span>
          </h1>
          
          <p className="text-lg md:text-xl text-pistachio max-w-2xl mb-10">
            Comprehensive tokens, components, and guidelines based on Axiforma typography 
            and a rich palette of organic greens.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold">
              <Link to="/styleguide">
                Explore Styleguide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-pistachio/30 text-anti-flash-white hover:bg-pistachio/10">
              <Link to="/styleguide/colors">
                View Colors
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete design foundation with colors, typography, and components working in harmony.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Color Preview */}
      <section className="bg-card border-t border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold mb-2">Primary Palette</h2>
          <p className="text-muted-foreground mb-8">From deep forest to vibrant Caribbean green.</p>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            <div className="aspect-square rounded-lg bg-rich-black flex items-end p-3">
              <span className="text-xs text-anti-flash-white font-medium">Rich Black</span>
            </div>
            <div className="aspect-square rounded-lg bg-dark-green flex items-end p-3">
              <span className="text-xs text-anti-flash-white font-medium">Dark Green</span>
            </div>
            <div className="aspect-square rounded-lg bg-bangladesh-green flex items-end p-3">
              <span className="text-xs text-anti-flash-white font-medium">Bangladesh</span>
            </div>
            <div className="aspect-square rounded-lg bg-mountain-meadow flex items-end p-3">
              <span className="text-xs text-rich-black font-medium">Mountain</span>
            </div>
            <div className="aspect-square rounded-lg bg-caribbean-green flex items-end p-3">
              <span className="text-xs text-rich-black font-medium">Caribbean</span>
            </div>
            <div className="aspect-square rounded-lg bg-anti-flash-white border border-border flex items-end p-3">
              <span className="text-xs text-rich-black font-medium">Anti-Flash</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to explore?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Dive into the full styleguide to see all design tokens, typography scales, and component variants.
        </p>
        <Button asChild size="lg" className="bg-primary hover:bg-secondary">
          <Link to="/styleguide">
            Open Styleguide
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Nature-Inspired Design System • Built with React & Tailwind
          </p>
          <div className="flex gap-4">
            <Link to="/styleguide" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Styleguide
            </Link>
            <Link to="/styleguide/colors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Colors
            </Link>
            <Link to="/styleguide/buttons" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Components
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
