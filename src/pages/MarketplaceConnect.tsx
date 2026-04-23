import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Store, Link2, CheckCircle2, ExternalLink, ShoppingBag, Globe, Palette, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MarketplaceConfig {
  id: string;
  name: string;
  icon: typeof Store;
  description: string;
  color: string;
  fields: { key: string; label: string; placeholder: string }[];
}

const marketplaces: MarketplaceConfig[] = [
  {
    id: "gumroad",
    name: "Gumroad",
    icon: ShoppingBag,
    description: "Sell digital products directly to your audience",
    color: "from-pink-500 to-rose-500",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter your Gumroad API key" },
      { key: "store_url", label: "Store URL", placeholder: "https://yourstore.gumroad.com" },
    ],
  },
  {
    id: "etsy",
    name: "Etsy",
    icon: Palette,
    description: "Reach millions of buyers on the world's creative marketplace",
    color: "from-orange-500 to-amber-500",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter your Etsy API key" },
      { key: "shop_id", label: "Shop ID", placeholder: "Your Etsy shop name" },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: Globe,
    description: "Build your own branded storefront with full control",
    color: "from-green-500 to-emerald-500",
    fields: [
      { key: "api_key", label: "Admin API Token", placeholder: "shpat_..." },
      { key: "store_url", label: "Store URL", placeholder: "yourstore.myshopify.com" },
    ],
  },
];

const MarketplaceConnect = () => {
  const user = useUser();
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Subscribe to marketplace_connections changes
  useEffect(() => {
    if (!user?.id) return;

    const marketplaceChannel = supabase
      .channel('marketplace-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'marketplace_connections',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Marketplace connection change:', payload);
          if (payload.eventType === 'INSERT') {
            setConnections((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setConnections((prev) =>
              prev.map((conn) => (conn.id === payload.new.id ? payload.new : conn))
            );
          } else if (payload.eventType === 'DELETE') {
            setConnections((prev) =>
              prev.filter((conn) => conn.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    setChannel(marketplaceChannel);

    return () => {
      marketplaceChannel.unsubscribe();
    };
  }, [user?.id]);

  // Initial load of connections
  useEffect(() => {
    const loadConnections = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('marketplace_connections')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading connections:', error);
        return;
      }
      setConnections(data || []);
    };
    loadConnections();
  }, [user?.id]);

  const handleConnect = async (marketplaceId: string) => {
    const data = formData[marketplaceId];
    if (!data || Object.values(data).some(v => !v?.trim())) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    setIsProcessing(marketplaceId);
    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .upsert({
          user_id: user?.id,
          marketplace_id: marketplaceId,
          settings: data,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: `${marketplaces.find(m => m.id === marketplaceId)?.name} Connected!`,
        description: "Your marketplace account has been linked successfully.",
      });
    } catch (err: any) {
      toast({ title: "Connection failed", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDisconnect = async (marketplaceId: string) => {
    setIsProcessing(marketplaceId);
    try {
      const { error } = await supabase
        .from('marketplace_connections')
        .delete()
        .eq('user_id', user?.id)
        .eq('marketplace_id', marketplaceId);

      if (error) throw error;

      setFormData(prev => ({ ...prev, [marketplaceId]: {} }));
      toast({ title: "Disconnected", description: "Marketplace has been unlinked." });
    } catch (err: any) {
      toast({ title: "Disconnect failed", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(null);
    }
  };

  const updateField = (marketplaceId: string, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [marketplaceId]: { ...(prev[marketplaceId] || {}), [key]: value },
    }));
  };

  const isConnected = (marketplaceId: string) => connections.some(c => c.marketplace_id === marketplaceId);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-display font-bold">Marketplace Connect</h1>
          <p className="text-muted-foreground mt-1">
            Link your marketplace accounts to publish products directly from CreatorWand AI.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketplaces.map((mp, i) => {
            const connected = isConnected(mp.id);
            const processing = isProcessing === mp.id;

            return (
              <motion.div
                key={mp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mp.color} flex items-center justify-center`}>
                        <mp.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      {connected && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-4">{mp.name}</CardTitle>
                    <CardDescription>{mp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    {connected ? (
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => handleDisconnect(mp.id)}
                          disabled={processing}
                        >
                          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disconnect"}
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                          <ExternalLink className="w-3 h-3 mr-1" /> View Dashboard
                        </Button>
                      </div>
                    ) : (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full gradient-primary text-primary-foreground">
                            <Link2 className="w-4 h-4 mr-2" /> Connect
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Connect {mp.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            {mp.fields.map(field => (
                              <div key={field.key} className="space-y-2">
                                <Label>{field.label}</Label>
                                <Input
                                  type="password"
                                  placeholder={field.placeholder}
                                  value={formData[mp.id]?.[field.key] || ""}
                                  onChange={e => updateField(mp.id, field.key, e.target.value)}
                                />
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground">
                              Your credentials are encrypted and stored securely.
                            </p>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              className="gradient-primary text-primary-foreground"
                              onClick={() => handleConnect(mp.id)}
                              disabled={processing}
                            >
                              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : `Connect ${mp.name}`}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <Store className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-display font-semibold mb-1">More Marketplaces Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Creative Market, Payhip, Sellfy, and WooCommerce integrations are on our roadmap.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MarketplaceConnect;
