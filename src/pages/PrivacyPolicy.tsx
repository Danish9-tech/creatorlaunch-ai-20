import { DashboardLayout } from "@/components/DashboardLayout";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground">We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes your name, email address, and any content you create using our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Information Sharing</h2>
            <p className="text-muted-foreground">We do not share, sell, rent, or trade your personal information with third parties for their commercial purposes. We may share your information with service providers who assist us in operating our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
            <p className="text-muted-foreground">We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Cookies</h2>
            <p className="text-muted-foreground">We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
            <p className="text-muted-foreground">If you have any questions about this Privacy Policy, please contact us at <a href="/contact" className="text-primary hover:underline">our contact page</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
