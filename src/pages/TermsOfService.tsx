import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const TermsOfService = () => {
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
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using CreatorWand AI, you accept and agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service. The materials and services provided are protected by applicable copyright and trademark law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            You may use CreatorWand AI only for lawful purposes and in accordance with these Terms. You agree not to use the service to violate any applicable local, state, national, or international law, transmit any harmful code or malware, attempt to gain unauthorized access to our systems, impersonate any person or entity, or interfere with other users' access to the service. You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Payment Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            Certain features of CreatorWand AI require a paid subscription. Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except as required by law. We reserve the right to change our pricing with 30 days' notice to existing subscribers. If you fail to pay subscription fees, we may suspend or terminate your access to paid features.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            The CreatorWand AI platform, including its design, code, features, and content, is owned by us and protected by intellectual property laws. Content you create using our AI tools belongs to you, and you retain all rights to it. However, you grant us a limited license to store and process your content to provide the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the service will immediately cease. You may also terminate your account at any time through your account settings. All provisions of these Terms that should reasonably survive termination will survive.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            CreatorWand AI is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether direct or indirect, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify or replace these Terms at any time at our sole discretion. We will provide notice of material changes by updating the "Last updated" date at the top of this page and, for significant changes, by sending an email to registered users. Your continued use of the service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about these Terms, please contact us at{" "}
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

export default TermsOfService;
