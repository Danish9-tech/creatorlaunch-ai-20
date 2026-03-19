import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, MapPin } from "lucide-react";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate with email service (Resend, SendGrid, etc.) when ready
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-10">Have a question or need help? We'd love to hear from you.</p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Mail className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-muted-foreground text-sm">support@creatorwandai.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MessageSquare className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Response Time</h3>
                <p className="text-muted-foreground text-sm">We typically respond within 24–48 hours on business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Location</h3>
                <p className="text-muted-foreground text-sm">Remote-first team. Available worldwide.</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center py-8">
                  <p className="text-lg font-semibold text-primary">Message received!</p>
                  <p className="text-muted-foreground text-sm mt-2">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help you?" className="min-h-[120px]" required />
                  </div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground">Send Message</Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
