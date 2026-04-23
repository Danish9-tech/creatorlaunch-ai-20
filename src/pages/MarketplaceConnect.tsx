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
import { Store, Link2, CheckCircle2, ExternalLink, ShoppingBag, Globe, Palette, Loader2, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MarketplaceConfig {
  id: string;
  name: string;
  icon: any;
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
    description: "Reach buyers on the creative marketplace",
    color: "from-orange-500 to-amber-500",
    fields: [
      { key: "api_key", label: "API Key", placeholder: "Enter your Etsy API key" },
      { key: "shop_id", label: "Shop ID", placeholder: "Your Etsy shop name" },
    ],
  },
];
const ALL_MARKETPLACES: MarketplaceConfig[] = [
  {
    id: "gumroad",
    name: "Gumroad",
    icon: ShoppingBag,
    description: "Sell digital products directly to your audience",
    color: "from-pink-500 to-rose-500",
    fields: [
      { key: "api_key", label: "Access Token", placeholder: "Your Gumroad access token" },
      { key: "store_url", label: "Store URL (optional)", placeholder: "https://yourstore.gumroad.com" },
    ],
  },
  {
    id: "etsy",
    name: "Etsy",
    icon: Palette,
    description: "Reach buyers on the creative marketplace",
    color: "from-orange-500 to-amber-500",
    fields: [
      { key: "api_key", label: "OAuth Token", placeholder: "Your Etsy OAuth token" },
      { key: "shop_id", label: "Shop ID", placeholder: "Your Etsy shop ID" },
    ],
  },
  {
    id: "shopify",
    name: "Shopify",
    icon: ShoppingCart,
    description: "Publish drafts to your Shopify store",
    color: "from-emerald-500 to-green-600",
    fields: [
      { key: "api_key", label: "Admin API Access Token", placeholder: "shpat_xxx" },
      { key: "store_url", label: "Store URL", placeholder: "your-store.myshopify.com" },
    ],
  },
];

const MarketplaceConnect = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});
  const [connections, setConnections] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('marketplace_connections').select('*').eq('user_id', user.id);
        setConnections(data || []);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel('marketplace-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_connections', filter: `user_id=eq.${userId}` }, 
      (payload) => {
        if (payload.eventType === 'INSERT') setConnections(prev => [...prev, payload.new]);
        if (payload.eventType === 'UPDATE') setConnections(prev => prev.map(c => c.id === (payload.new as any).id ? payload.new : c));
        if (payload.eventType === 'DELETE') setConnections(prev => prev.filter(c => c.id !== payload.old.id));
      }).subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId]);

  const handleConnect = async (marketplaceId: string) => {
    const data = formData[marketplaceId];
    if (!userId) {
      toast({ title: "Please sign in first", variant: "destructive" });
      return;
    }
    const mp = ALL_MARKETPLACES.find((m) => m.id === marketplaceId);
    const requiredKeys = mp?.fields.filter((f) => !f.label.includes("optional")).map((f) => f.key) ?? [];
    const missing = requiredKeys.filter((k) => !data?.[k]?.trim());
    if (missing.length) {
      toast({ title: "Missing fields", description: `Please fill: ${missing.join(", ")}`, variant: "destructive" });
      return;
    }
    setIsProcessing(marketplaceId);
    const { data: row, error } = await supabase
      .from('marketplace_connections')
      .upsert(
        {
          user_id: userId,
          marketplace_id: marketplaceId,
          settings: data,
          is_active: true,
        },
        { onConflict: 'user_id,marketplace_id' }
      )
      .select()
      .single();
    if (error) {
      toast({ title: "Connect failed", description: error.message, variant: "destructive" });
    } else {
      setConnections((prev) => {
        const filtered = prev.filter((c) => c.marketplace_id !== marketplaceId);
        return row ? [...filtered, row] : filtered;
      });
      setFormData((prev) => ({ ...prev, [marketplaceId]: {} }));
      setOpenDialog(null);
      toast({ title: `${mp?.name ?? marketplaceId} connected` });
    }
    setIsProcessing(null);
  };

  const handleDisconnect = async (marketplaceId: string) => {
    if (!userId) return;
    setIsProcessing(marketplaceId);
    const { error } = await supabase
      .from('marketplace_connections')
      .delete()
      .eq('user_id', userId)
      .eq('marketplace_id', marketplaceId);
    if (error) {
      toast({ title: "Disconnect failed", description: error.message, variant: "destructive" });
    } else {
      setConnections(prev => prev.filter(c => c.marketplace_id !== marketplaceId));
      toast({ title: "Disconnected" });
    }
    setIsProcessing(null);
  };

  const isConnected = (id: string) => connections.some(c => c.marketplace_id === id);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-display font-bold">Marketplace Connect</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {ALL_MARKETPLACES.map((mp) => (
            <Card key={mp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mp.color} flex items-center justify-center text-white`}>
                    <mp.icon className="w-5 h-5" />
                  </div>
                  {isConnected(mp.id) && <Badge className="bg-green-500">Connected</Badge>}
                </div>
                <CardTitle className="mt-4">{mp.name}</CardTitle>
                <CardDescription>{mp.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected(mp.id) ? (
                  <Dialog open={openDialog === mp.id} onOpenChange={(o) => setOpenDialog(o ? mp.id : null)}>
                    <DialogTrigger asChild><Button className="w-full">Connect</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Connect {mp.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        {mp.fields.map(f => (
                          <div key={f.key} className="space-y-1">
                            <Label>{f.label}</Label>
                            <Input
                              type={f.key === "api_key" ? "password" : "text"}
                              placeholder={f.placeholder}
                              value={formData[mp.id]?.[f.key] ?? ""}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  [mp.id]: { ...prev[mp.id], [f.key]: e.target.value },
                                }))
                              }
                            />
                          </div>
                        ))}
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(mp.id)}
                          disabled={isProcessing === mp.id}
                        >
                          {isProcessing === mp.id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connecting...</>
                          ) : (
                            "Connect Now"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDisconnect(mp.id)}
                    disabled={isProcessing === mp.id}
                  >
                    {isProcessing === mp.id ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Disconnecting...</>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MarketplaceConnect;
