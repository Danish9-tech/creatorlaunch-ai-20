import { Link } from "react-router-dom";
import { Wand2, Sparkles, Zap, BarChart3, Globe, Shield, FileText, ArrowRight, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const features = [
  { icon: Sparkles, title: "AI Product Creator", desc: "Generate complete digital products with AI-powered descriptions, features, and pricing." },
  { icon: FileText, title: "Listing Generator", desc: "Create optimized listings for Etsy, Gumroad, Shopify, and 7+ marketplaces instantly." },
  { icon: BarChart3, title: "Competitor Analyzer", desc: "Analyze top sellers and find gaps in the market to position your products." },
  { icon: Zap, title: "40+ Micro-Tools", desc: "Niche finder, keyword research, SEO optimizer, pricing tools, and much more." },
  { icon: Globe, title: "Multi-Platform Export", desc: "Export listings formatted for every platform with one click." },
  { icon: Shield, title: "Launch Checklist", desc: "Never miss a step with our guided product launch workflow." },
];

const steps = [
  { num: "01", title: "Create Your Product", desc: "Use AI to generate product ideas, descriptions, and features in minutes." },
  { num: "02", title: "Optimize Listings", desc: "Generate SEO-optimized titles, tags, and descriptions for any marketplace." },
  { num: "03", title: "Launch & Sell", desc: "Export, publish, and track performance across all your platforms." },
];

const plans = [
  { name: "Free", price: "$0", period: "/forever", features: ["10 AI credits", "Basic tools access", "1 product listing", "Community support"], cta: "Get Started", popular: false },
  { name: "Pro", price: "$19", period: "/month", features: ["500 AI credits/month", "All 40+ tools", "Unlimited listings", "Standard support", "Bring your own API key", "Export to all formats"], cta: "Start Pro Trial", popular: true },
  { name: "Business", price: "$49", period: "/month", features: ["Unlimited AI credits", "Everything in Pro", "Marketplace integrations", "Priority support", "API access", "Advanced analytics"], cta: "Contact Sales", popular: false },
];

const testimonials = [
  { name: "Sarah K.", role: "Etsy Seller", quote: "CreatorWand AI helped me 5x my Etsy sales in just 2 months. The listing generator alone saved me 10+ hours per week!", avatar: "SK" },
  { name: "Marcus T.", role: "Course Creator", quote: "The product creator wizard is incredible. I went from idea to published course in under a week. Game changer!", avatar: "MT" },
  { name: "Priya D.", role: "Template Designer", quote: "I use the competitor analyzer daily. Knowing exactly what's trending gives me an unfair advantage on Creative Market.", avatar: "PD" },
];

const Index = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">CreatorWand<span className="text-gradient"> AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/signin")} className="font-medium">Sign In</Button>
            <Button size="sm" className="gradient-primary text-primary-foreground btn-animate font-display font-semibold" onClick={() => navigate("/signup")}>
              Get Started <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mb-8 glow-primary">
            <Wand2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
            Creator<span className="text-gradient">Wand</span> AI
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, optimize, market, and launch digital products across 7+ marketplaces — powered by AI.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="flex gap-4 justify-center flex-wrap">
            <Button className="gradient-primary text-primary-foreground btn-animate font-display font-semibold text-lg px-8 py-6" onClick={() => navigate("/signup")}>
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" className="btn-animate font-display font-semibold text-lg px-8 py-6" onClick={() => navigate("/signin")}>
              Sign In
            </Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free plan available
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything You Need to <span className="text-gradient">Launch</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">40+ AI-powered tools designed for digital product creators. From idea to sale, we've got you covered.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="card-animate h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">How It <span className="text-gradient">Works</span></h2>
            <p className="text-muted-foreground">Three simple steps to go from idea to revenue.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                <div className="text-5xl font-display font-bold text-gradient mb-4">{s.num}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Simple, Transparent <span className="text-gradient">Pricing</span></h2>
            <p className="text-muted-foreground">Start free. Upgrade when you're ready to scale.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`card-animate h-full relative ${plan.popular ? "border-primary border-2 shadow-lg" : "border-border/50"}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-display font-semibold">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <h3 className="font-display font-bold text-xl mb-1">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-display font-bold">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-highlight shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button className={`w-full btn-animate font-display font-semibold ${plan.popular ? "gradient-primary text-primary-foreground" : ""}`} variant={plan.popular ? "default" : "outline"} onClick={() => navigate("/signup")}>
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Loved by <span className="text-gradient">Creators</span></h2>
            <p className="text-muted-foreground">See what digital product sellers are saying.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="card-animate h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-secondary text-secondary" />)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed italic">"{t.quote}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-sm">{t.avatar}</div>
                      <div>
                        <p className="font-display font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to <span className="text-gradient">Launch</span>?</h2>
          <p className="text-muted-foreground mb-8">Join thousands of creators building and selling digital products with AI.</p>
          <Button className="gradient-primary text-primary-foreground btn-animate font-display font-semibold text-lg px-10 py-6" onClick={() => navigate("/signup")}>
            Start Creating for Free <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                  <Wand2 className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">CreatorWand AI</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered platform for digital product creators.</p>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-sm">Tools</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate("/signup")}>Product Creator</li>
                <li className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate("/signup")}>Listing Generator</li>
                <li className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate("/signup")}>SEO Tools</li>
              </ul>
            </div>
            <div>
              <h4 className="font-display font-semibold mb-3 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="cursor-pointer hover:text-foreground transition-colors"><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li className="cursor-pointer hover:text-foreground transition-colors"><Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li className="cursor-pointer hover:text-foreground transition-colors"><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-6 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatorWand AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
