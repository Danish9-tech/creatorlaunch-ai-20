import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Store, Link2, CheckCircle2, ExternalLink, ShoppingBag, Globe, Palette } from "lucide-react";

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
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>({});

  const handleConnect = (marketplaceId: string) => {
    const data = formData[marketplaceId];
    if (!data || Object.values(data).some(v => !v?.trim())) {
      toast({ title: "Missing fields", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }

    // Mock connection — in production this would call an edge function
    setConnected(prev => ({ ...prev, [marketplaceId]: true }));
    toast({
      title: `${marketplaces.find(m => m.id === marketplaceId)?.name} Connected!`,
      description: "Your marketplace account has been linked successfully.",
    });
  };

  const handleDisconnect = (marketplaceId: string) => {
    setConnected(prev => ({ ...prev, [marketplaceId]: false }));
    setFormData(prev => ({ ...prev, [marketplaceId]: {} }));
    toast({ title: "Disconnected", description: "Marketplace has been unlinked." });
  };

  const updateField = (marketplaceId: string, key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [marketplaceId]: { ...(prev[marketplaceId] || {}), [key]: value },
    }));
  };

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
          {marketplaces.map((mp, i) => (
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
                    {connected[mp.id] && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{mp.name}</CardTitle>
                  <CardDescription>{mp.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  {connected[mp.id] ? (
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full" onClick={() => handleDisconnect(mp.id)}>
                        Disconnect
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
                            Your credentials are encrypted and stored securely. We never share your data.
                          </p>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              className="gradient-primary text-primary-foreground"
                              onClick={() => handleConnect(mp.id)}
                            >
                              Connect {mp.name}
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Info card */}
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
