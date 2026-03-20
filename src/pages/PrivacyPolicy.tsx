import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const PrivacyPolicy = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const content = (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Data Collection</h2>
          <p className="text-muted-foreground leading-relaxed">
            CreatorWand AI collects information you provide directly when creating an account, including your name, email address, and payment information. We also collect data about how you use our platform, such as the tools you access, products you create, and settings you configure. This helps us improve our service and provide you with a better experience.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use your information to provide, maintain, and improve CreatorWand AI services. This includes processing your AI-generated content, managing your subscription, sending important service updates, responding to support requests, and analyzing usage patterns to enhance our features. We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication through Supabase, regular security audits, and access controls. While we strive to protect your information, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to access, update, or delete your personal data at any time through your account settings. You can export your data, opt out of marketing communications, and request complete account deletion. If you delete your account, we will permanently remove your personal information from our systems within 30 days, though some data may be retained for legal compliance.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Cookies and Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use essential cookies to maintain your session and remember your preferences. We also use analytics cookies to understand how users interact with our platform. You can control cookie preferences through your browser settings, though disabling certain cookies may limit functionality.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed">
            CreatorWand AI integrates with third-party services including Supabase for database and authentication, payment processors for subscriptions, and AI providers for content generation. These services have their own privacy policies and we encourage you to review them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or our data practices, please contact us at{" "}
            <a href="mailto:support@creatorwand.ai" className="text-primary hover:underline">
              support@creatorwand.ai
            </a>
            {" "}or visit our{" "}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>.
          </p>
        </section>
      </div>
    </div>
  );

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  if (isLoggedIn) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return <div className="min-h-screen bg-background">{content}</div>;
};

export default PrivacyPolicy;
