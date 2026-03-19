const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">By accessing and using CreatorWand AI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
            <p className="text-muted-foreground">You may use CreatorWand AI only for lawful purposes and in accordance with these Terms. You agree not to use our service in any way that violates any applicable local, national, or international law or regulation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Account Responsibilities</h2>
            <p className="text-muted-foreground">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
            <p className="text-muted-foreground">The service and its original content, features, and functionality are and will remain the exclusive property of CreatorWand AI. Content you create using our platform remains yours.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">CreatorWand AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
            <p className="text-muted-foreground">We may terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
            <p className="text-muted-foreground">We reserve the right to modify these terms at any time. We will provide notice of significant changes by updating the date at the top of this page.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
            <p className="text-muted-foreground">If you have any questions about these Terms, please visit our <a href="/contact" className="text-primary hover:underline">contact page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
