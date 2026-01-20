import { Coins, CreditCard, TrendingDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsageBar, UsageTable } from "@/components/ui/usage-bar";

const usageHistory = [
  { id: "1", date: "Jan 20, 2024", action: "Agent Chat - Sales Bot", credits: -15 },
  { id: "2", date: "Jan 20, 2024", action: "Website Generation", credits: -50 },
  { id: "3", date: "Jan 19, 2024", action: "Credit Purchase", credits: 500 },
  { id: "4", date: "Jan 19, 2024", action: "Agent Chat - FAQ Bot", credits: -8 },
  { id: "5", date: "Jan 18, 2024", action: "New Agent Creation", credits: -25 },
  { id: "6", date: "Jan 18, 2024", action: "Agent Chat - Support", credits: -12 },
];

export default function CreditsPage() {
  return (
    <AppLayout pageTitle="Credits" credits={1250}>
      <div className="space-y-6">
        {/* Credits Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Current Balance"
            value="1,250"
            icon={Coins}
            variant="primary"
            description="credits available"
          />
          <StatCard
            title="Used This Month"
            value="750"
            icon={TrendingDown}
            description="of 2,000 monthly"
          />
          <StatCard
            title="Next Billing"
            value="Feb 1"
            icon={CreditCard}
            description="Monthly renewal"
          />
        </div>

        {/* Usage Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>
              Your credit consumption for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <UsageBar
              used={750}
              total={2000}
              label="Credits Used"
            />
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">450</p>
                <p className="text-sm text-muted-foreground">Agent Chats</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">200</p>
                <p className="text-sm text-muted-foreground">Website Gen</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">100</p>
                <p className="text-sm text-muted-foreground">API Calls</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buy Credits */}
        <Card>
          <CardHeader>
            <CardTitle>Buy More Credits</CardTitle>
            <CardDescription>
              Choose a credit package that fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-2 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">500</p>
                  <p className="text-muted-foreground mb-4">credits</p>
                  <p className="text-xl font-semibold text-primary">$9.99</p>
                  <Button className="w-full mt-4" variant="outline">
                    Purchase
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary relative hover:shadow-lg cursor-pointer transition-all">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  Popular
                </div>
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">1,500</p>
                  <p className="text-muted-foreground mb-4">credits</p>
                  <p className="text-xl font-semibold text-primary">$24.99</p>
                  <Button className="w-full mt-4">
                    Purchase
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-2 hover:border-primary/50 cursor-pointer transition-colors">
                <CardContent className="pt-6 text-center">
                  <p className="text-3xl font-bold">5,000</p>
                  <p className="text-muted-foreground mb-4">credits</p>
                  <p className="text-xl font-semibold text-primary">$69.99</p>
                  <Button className="w-full mt-4" variant="outline">
                    Purchase
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card>
          <CardHeader>
            <CardTitle>Usage History</CardTitle>
            <CardDescription>
              Recent credit transactions and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageTable data={usageHistory} />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
