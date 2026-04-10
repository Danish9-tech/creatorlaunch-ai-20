import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, CreditCard, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  plan: string;
  credits: number;
  created_at: string;
}

interface Stats {
  total_users: number;
  active_subscriptions: number;
  business_users: number;
  pro_users: number;
  free_users: number;
}

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    active_subscriptions: 0,
    business_users: 0,
    pro_users: 0,
    free_users: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Unauthorized', description: 'You must be logged in', variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Check admin status via user_roles
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (!roleData) {
        // Also check admin_users table as fallback
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!adminData) {
          toast({ title: 'Access Denied', description: 'Admin access required', variant: 'destructive' });
          setLoading(false);
          return;
        }
      }

      setIsAdmin(true);
      await fetchDashboardData();
    } catch (error) {
      console.error('Admin check error:', error);
      toast({ title: 'Error', description: 'Failed to verify admin access', variant: 'destructive' });
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch user profiles with correct column names
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, plan, credits, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const profiles = profilesData || [];
      setUsers(profiles as UserProfile[]);

      // Calculate stats
      const business = profiles.filter(u => u.plan === 'business').length;
      const pro = profiles.filter(u => u.plan === 'pro').length;
      const free = profiles.filter(u => !u.plan || u.plan === 'free').length;

      setStats({
        total_users: profiles.length,
        active_subscriptions: business + pro,
        business_users: business,
        pro_users: pro,
        free_users: free,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({ title: 'Error', description: 'Failed to load dashboard data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId: string, newPlan: string) => {
    try {
      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ plan: newPlan, credits: newPlan === 'business' ? 999999 : newPlan === 'pro' ? 500 : 10 })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Update user_subscriptions table
      await supabase
        .from('user_subscriptions')
        .update({
          plan_slug: newPlan,
          credits_remaining: newPlan === 'business' ? -1 : newPlan === 'pro' ? 500 : 10,
          status: newPlan === 'free' ? 'inactive' : 'active',
        })
        .eq('user_id', userId);

      toast({ title: 'Success', description: `User plan updated to ${newPlan}` });
      fetchDashboardData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update user plan', variant: 'destructive' });
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    if (plan === 'business') return 'bg-purple-100 text-purple-800';
    if (plan === 'pro') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Shield className="h-12 w-12 text-red-400" />
        <p className="text-lg font-medium text-gray-700">Admin Access Required</p>
        <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total_users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Paid Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.active_subscriptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Business</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-purple-600">{stats.business_users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Pro</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.pro_users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">Free</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-500">{stats.free_users}</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({stats.total_users})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Email</th>
                  <th className="text-left py-2 pr-4">Name</th>
                  <th className="text-left py-2 pr-4">Plan</th>
                  <th className="text-left py-2 pr-4">Credits</th>
                  <th className="text-left py-2 pr-4">Joined</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/30">
                    <td className="py-2 pr-4 font-mono text-xs">{user.email}</td>
                    <td className="py-2 pr-4">{user.full_name || '-'}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan || 'free')}`}>
                        {user.plan || 'free'}
                      </span>
                    </td>
                    <td className="py-2 pr-4">{user.credits === -1 ? '∞' : user.credits ?? 0}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-2">
                      <select
                        value={user.plan || 'free'}
                        onChange={(e) => updateUserPlan(user.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1 bg-background"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="business">Business</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
