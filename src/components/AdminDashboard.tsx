import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CreditCard, TrendingUp } from 'lucide-react';

interface User {
  id: string;
  email: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
}

interface Stats {
  total_users: number;
  active_subscriptions: number;
  total_revenue: number;
  monthly_active_users: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    active_subscriptions: 0,
    total_revenue: 0,
    monthly_active_users: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Unauthorized',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        return;
      }

      // Check if user is admin (you can add admin role check here)
      await fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify admin access',
        variant: 'destructive',
      });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, subscription_tier, subscription_status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // Calculate stats
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status, created_at');

      if (allUsers) {
        const activeSubscriptions = allUsers.filter(
          (u) => u.subscription_status === 'active'
        ).length;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const monthlyActive = allUsers.filter(
          (u) => new Date(u.created_at) > thirtyDaysAgo
        ).length;

        // Calculate revenue (example: $10/month for pro, $20 for premium)
        const revenue = allUsers.reduce((acc, user) => {
          if (user.subscription_tier === 'pro') return acc + 10;
          if (user.subscription_tier === 'premium') return acc + 20;
          return acc;
        }, 0);

        setStats({
          total_users: allUsers.length,
          active_subscriptions: activeSubscriptions,
          total_revenue: revenue,
          monthly_active_users: monthlyActive,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserTier = async (userId: string, newTier: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_tier: newTier })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'User tier updated successfully',
      });
      fetchDashboardData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user tier',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.total_users}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold">{stats.active_subscriptions}</p>
            </div>
            <CreditCard className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${stats.total_revenue}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Active</p>
              <p className="text-2xl font-bold">{stats.monthly_active_users}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Tier</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Joined</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-muted/50">
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      {user.subscription_tier || 'free'}
                    </span>
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        user.subscription_status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.subscription_status || 'inactive'}
                    </span>
                  </td>
                  <td className="p-2">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <select
                      value={user.subscription_tier || 'free'}
                      onChange={(e) => updateUserTier(user.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
