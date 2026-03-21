import { useState, useEffect } from "react";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setName("");
      setEmail("");
      setMessage("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-muted-foreground mb-10">Have a question? We'd love to hear from you.</p>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Email</h3>
              <a href="mailto:support@creatorwand.ai" className="text-muted-foreground hover:text-primary">
                support@creatorwand.ai
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Response Time</h3>
              <p className="text-muted-foreground">We typically respond within 24-48 hours.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Location</h3>
              <p className="text-muted-foreground">Remote-first team. Available worldwide.</p>
            </div>
          </div>
        </div>
        <div>
          {submitted ? (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <span className="text-green-600 text-2xl">✓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  placeholder="How can we help?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
