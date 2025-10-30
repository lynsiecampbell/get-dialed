import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Megaphone, CheckCircle, Pause, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Stats {
  totalAds: number;
  activeAds: number;
  pausedAds: number;
  totalCampaigns: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAds: 0,
    activeAds: 0,
    pausedAds: 0,
    totalCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      const [adsResult, campaignsResult] = await Promise.all([
        supabase.from('ads').select('status', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('campaigns').select('id', { count: 'exact' }).eq('user_id', user.id),
      ]);

      const totalAds = adsResult.count || 0;
      const activeAds = adsResult.data?.filter((ad) => ad.status === 'Active').length || 0;
      const pausedAds = adsResult.data?.filter((ad) => ad.status === 'Paused').length || 0;
      const totalCampaigns = campaignsResult.count || 0;

      setStats({ totalAds, activeAds, pausedAds, totalCampaigns });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Ads',
      value: stats.totalAds,
      icon: Megaphone,
      color: 'text-blue-600',
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
      color: 'text-orange-600',
    },
    {
      title: 'Campaigns',
      value: stats.totalCampaigns,
      icon: FileText,
      color: 'text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your marketing campaigns</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
