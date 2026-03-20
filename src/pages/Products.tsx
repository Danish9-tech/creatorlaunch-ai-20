import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Package, Plus, Edit, Trash2, DollarSign, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { EmptyState } from "@/components/EmptyState";
import { supabase } from "@/integrations/supabase/client";

const categories = ["Templates", "Ebooks", "Courses", "Presets", "Fonts", "Plugins", "Printables", "Other"];
const platforms = ["Etsy", "Gumroad", "Shopify", "Amazon KDP", "Creative Market", "Payhip", "Teachable"];

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  platforms: string[];
  createdAt: string;
}

const emptyForm = () => ({
  title: "",
  description: "",
  price: "",
  category: "",
  platforms: [] as string[],
});

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        loadProducts(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const loadProducts = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error loading products", description: error.message, variant: "destructive" });
    } else {
      setProducts(
        (data || []).map((p) => ({
          id: p.id,
          title: p.title || "",
          description: p.description || "",
          price: p.price?.toString() || "",
          category: p.product_type || "",
          platforms: p.tags || [],
          createdAt: p.created_at,
        }))
      );
    }
    setLoading(false);
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ title: p.title, description: p.description, price: p.price, category: p.category, platforms: p.platforms });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!userId) return;

    if (editingId) {
      const { error } = await supabase
        .from("products")
        .update({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price) || 0,
          product_type: form.category,
          tags: form.platforms,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        toast({ title: "Error updating product", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Product updated!" });
    } else {
      const { error } = await supabase.from("products").insert({
        user_id: userId,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price) || 0,
        product_type: form.category,
        tags: form.platforms,
        status: "draft",
      });

      if (error) {
        toast({ title: "Error creating product", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Product created!" });
    }

    setDialogOpen(false);
    loadProducts(userId);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting product", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Product deleted" });
    if (userId) loadProducts(userId);
  };

  const togglePlatform = (plat: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(plat)
        ? prev.platforms.filter((p) => p !== plat)
        : [...prev.platforms, plat],
    }));
  };

  return (
    <DashboardLayout loading={loading}>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold">My Products</h1>
            <p className="text-muted-foreground text-sm">
              {products.length} product{products.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground btn-animate" onClick={openNew}>
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "New Product"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Product name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your product"
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price ($)</Label>
                    <Input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      placeholder="9.99"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((p) => (
                      <Badge
                        key={p}
                        variant={form.platforms.includes(p) ? "default" : "outline"}
                        className={`cursor-pointer transition-colors ${form.platforms.includes(p) ? "gradient-primary text-primary-foreground" : ""}`}
                        onClick={() => togglePlatform(p)}
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button className="gradient-primary text-primary-foreground" onClick={handleSave}>
                  {editingId ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Create your first digital product to get started."
            actionLabel="Create Product"
            onAction={openNew}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="card-animate h-full">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-semibold text-base line-clamp-1">{p.title}</h3>
                      <div className="flex gap-1 shrink-0 ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    {p.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                    )}
                    <div className="mt-auto space-y-2">
                      {p.price && (
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <DollarSign className="h-3.5 w-3.5 text-highlight" />{p.price}
                        </div>
                      )}
                      {p.category && (
                        <Badge variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />{p.category}
                        </Badge>
                      )}
                      {p.platforms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.platforms.map((pl) => (
                            <Badge key={pl} variant="outline" className="text-[10px]">{pl}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Products;
