import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Store, Upload } from "lucide-react";

interface ListToMarketplaceProps {
  generatedContent: string;
  toolTitle: string;
}

export function ListToMarketplace({ generatedContent, toolTitle }: ListToMarketplaceProps) {
  const [title, setTitle] = useState(toolTitle);
  const [description, setDescription] = useState(generatedContent.slice(0, 500));
  const [price, setPrice] = useState("9.99");
  const [platform, setPlatform] = useState("gumroad");

  const handleList = () => {
    // Mock listing — would call edge function in production
    toast({
      title: "Listed Successfully! 🎉",
      description: `Your product "${title}" has been queued for listing on ${platform}.`,
    });
  };

  if (!generatedContent) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Store className="w-4 h-4" />
          List to Marketplace
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            List to Marketplace
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gumroad">Gumroad</SelectItem>
                <SelectItem value="etsy">Etsy</SelectItem>
                <SelectItem value="shopify">Shopify</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Product Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Price ($)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className="gradient-primary text-primary-foreground" onClick={handleList}>
              <Upload className="w-4 h-4 mr-2" />
              Publish Listing
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
