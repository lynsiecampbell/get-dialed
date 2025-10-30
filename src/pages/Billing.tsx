import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Pro Plan</CardTitle>
            <CardDescription className="text-xl pt-2">
              <span className="text-4xl font-bold text-foreground">$29</span>
              <span className="text-muted-foreground">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {[
                'Unlimited ads and creatives',
                'Advanced UTM tracking',
                'Campaign analytics',
                'Priority support',
                'Export data',
                'Team collaboration',
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full" size="lg" disabled>
              Coming Soon
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Stripe integration will be configured to enable subscriptions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
