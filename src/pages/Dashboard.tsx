import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Image, Pause } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  totalMessages: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    activeAds: 0,
    pausedAds: 0,
    totalMessages: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      const [adsResult, campaignsResult] = await Promise.all([
        supabase.from('ads').select('status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('campaigns').select('messaging').eq('user_id', user.id),
      ]);

      const totalAds = adsResult.count || 0;
      const activeAds = adsResult.data?.filter((ad) => ad.status === 'Active').length || 0;
      const pausedAds = adsResult.data?.filter((ad) => ad.status === 'Paused').length || 0;
      
      // Count total messages from campaigns.messaging
      let totalMessages = 0;
      campaignsResult.data?.forEach(campaign => {
        const messaging = campaign.messaging as any;
        const adMessaging = messaging?.adMessaging || {};
        totalMessages += (adMessaging.headlines || []).length + (adMessaging.primaryTexts || []).length;
      });

      setStats({ totalAds, activeAds, pausedAds, totalMessages });
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: 'Total Ads',
      value: stats.totalAds,
      icon: FileText,
      color: 'text-primary',
    },
    {
      title: 'Active Ads',
      value: stats.activeAds,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Paused Ads',
      value: stats.pausedAds,
      icon: Pause,
      color: 'text-yellow-600',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: Image,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your ad campaigns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
