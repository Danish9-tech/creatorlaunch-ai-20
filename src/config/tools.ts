import {
  Compass, Key, SearchCheck, ShoppingBag, Gauge, Snowflake,
  Type, ListChecks, Heart, Building, Map,
  PenTool, Tag, FileSearch, Link2, HelpCircle, AlignLeft,
  Palette, ImageIcon, Layout, Share2,
  Video, Youtube, Film,
  Rocket, FileText, Heading, MousePointerClick, Timer,
  Calculator, FlaskConical, ArrowUpRight, ShoppingCart,
  Globe, DollarSign, MapPin,
  CalendarDays, Wrench,
  Star, Flame, UserCircle, Fingerprint, Store,
} from "lucide-react";

export interface ToolField {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
}

export interface ToolConfig {
  slug: string;
  title: string;
  description: string;
  icon: any;
  category: string;
  fields: ToolField[];
  mockOutput: string;
}

export const toolCategories = [
  { label: "Product Research", key: "research" },
  { label: "Product Creation", key: "creation" },
  { label: "Listing Optimization", key: "listing" },
  { label: "Visual Content", key: "visual" },
  { label: "Video Marketing", key: "video" },
  { label: "Marketing Strategy", key: "marketing" },
  { label: "Pricing & Sales", key: "pricing" },
  { label: "Growth", key: "growth" },
  { label: "Business Management", key: "business" },
  { label: "Bonus Analysis", key: "bonus" },
];

export const tools: ToolConfig[] = [
  // ── Product Research ──
  {
    slug: "niche-finder",
    title: "Niche Finder",
    description: "Discover profitable niches for digital products.",
    icon: Compass,
    category: "research",
    fields: [
      { name: "interest", label: "Your Interests / Skills", type: "text", placeholder: "e.g. graphic design, fitness, coding" },
      { name: "platform", label: "Target Platform", type: "select", options: ["Etsy", "Gumroad", "Shopify", "Amazon KDP", "Creative Market"] },
    ],
    mockOutput: `🎯 **Top Niches Found**\n\n1. **Minimalist Planner Templates** — Demand: High | Competition: Low | Price Range: $5–$15\n2. **Social Media Canva Templates** — Demand: Very High | Competition: Medium | Price Range: $8–$25\n3. **Fitness Tracker Spreadsheets** — Demand: Medium | Competition: Low | Price Range: $3–$10\n4. **Wedding Invitation Bundles** — Demand: High | Competition: Medium | Price Range: $12–$30\n\n📊 Overall Score: 8.5/10 opportunity detected.`,
  },
  {
    slug: "trending-keyword-finder",
    title: "Trending Keyword Finder",
    description: "Find trending keywords for your product niche.",
    icon: Key,
    category: "research",
    fields: [
      { name: "niche", label: "Product Niche", type: "text", placeholder: "e.g. digital planners" },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Google", "Amazon", "Pinterest", "TikTok"] },
    ],
    mockOutput: `🔑 **Trending Keywords**\n\n| Keyword | Search Volume | Trend | Competition |\n|---------|-------------|-------|-------------|\n| digital planner 2026 | 12,400/mo | 📈 Rising | Low |\n| aesthetic planner template | 8,900/mo | 📈 Rising | Medium |\n| ADHD planner printable | 6,200/mo | 🚀 Breakout | Low |\n| budget planner spreadsheet | 15,100/mo | ➡️ Stable | High |\n| minimalist daily planner | 4,800/mo | 📈 Rising | Low |`,
  },
  {
    slug: "low-competition-finder",
    title: "Low Competition Finder",
    description: "Find products with high demand but low competition.",
    icon: SearchCheck,
    category: "research",
    fields: [
      { name: "category", label: "Product Category", type: "text", placeholder: "e.g. printable art, ebooks" },
      { name: "priceRange", label: "Price Range", type: "select", options: ["$1–$10", "$10–$25", "$25–$50", "$50+"] },
    ],
    mockOutput: `🏆 **Low Competition Opportunities**\n\n1. **Notion Budget Templates** — Competition Score: 2/10 | Est. Revenue: $800/mo\n2. **Pet Care Checklists** — Competition Score: 1/10 | Est. Revenue: $400/mo\n3. **Freelancer Invoice Templates** — Competition Score: 3/10 | Est. Revenue: $1,200/mo\n\n💡 Recommendation: Start with Notion Budget Templates — highest ROI potential.`,
  },
  {
    slug: "best-selling-analyzer",
    title: "Best-Selling Analyzer",
    description: "Analyze top-selling digital products in any category.",
    icon: ShoppingBag,
    category: "research",
    fields: [
      { name: "category", label: "Category", type: "text", placeholder: "e.g. digital art, templates" },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Gumroad", "Creative Market", "Amazon KDP"] },
    ],
    mockOutput: `📊 **Best Sellers Analysis**\n\n1. **Canva Social Media Kit** — $19.99 | 5,200+ sales | ⭐ 4.9\n2. **Digital Recipe Book Template** — $12.00 | 3,800+ sales | ⭐ 4.8\n3. **Business Planner Bundle** — $24.99 | 2,900+ sales | ⭐ 4.7\n\n🔍 Common traits: Bundle pricing, professional mockups, 10+ variations included.`,
  },
  {
    slug: "market-demand-score",
    title: "Market Demand Score",
    description: "Get an AI-powered demand score for any product idea.",
    icon: Gauge,
    category: "research",
    fields: [
      { name: "product", label: "Product Idea", type: "text", placeholder: "e.g. Instagram content calendar template" },
      { name: "audience", label: "Target Audience", type: "text", placeholder: "e.g. small business owners" },
    ],
    mockOutput: `📈 **Market Demand Score: 8.7/10**\n\n✅ Search Volume: High (9,200/mo)\n✅ Growth Trend: +34% YoY\n✅ Audience Size: Large\n⚠️ Competition: Medium (127 competitors)\n✅ Price Viability: $12–$25 sweet spot\n\n🎯 Verdict: **Strong opportunity** — recommend launching within 30 days.`,
  },
  {
    slug: "seasonal-idea-generator",
    title: "Seasonal Product Ideas",
    description: "Generate product ideas based on upcoming seasons and holidays.",
    icon: Snowflake,
    category: "research",
    fields: [
      { name: "season", label: "Season / Holiday", type: "select", options: ["Spring", "Summer", "Fall", "Winter", "Valentine's Day", "Halloween", "Black Friday", "Christmas", "Back to School"] },
      { name: "niche", label: "Your Niche", type: "text", placeholder: "e.g. printables, templates" },
    ],
    mockOutput: `🎄 **Seasonal Product Ideas — Christmas**\n\n1. **Holiday Gift Tag Printables** — Launch by Nov 1 | Est. price: $5\n2. **Christmas Social Media Templates** — Launch by Nov 15 | Est. price: $15\n3. **Holiday Budget Planner** — Launch by Oct 15 | Est. price: $8\n4. **Christmas Card Template Bundle** — Launch by Nov 1 | Est. price: $12\n\n⏰ Optimal launch window: 6–8 weeks before the holiday.`,
  },

  // ── Product Creation ──
  {
    slug: "product-name-generator",
    title: "Product Name Generator",
    description: "Generate catchy names for your digital product.",
    icon: Type,
    category: "creation",
    fields: [
      { name: "description", label: "Product Description", type: "textarea", placeholder: "Describe your product in a few sentences..." },
      { name: "style", label: "Name Style", type: "select", options: ["Professional", "Creative", "Minimal", "Fun", "Luxurious"] },
    ],
    mockOutput: `✨ **Product Name Suggestions**\n\n1. **PlannerPro Elite** — Professional, premium feel\n2. **The Daily Blueprint** — Clean, action-oriented\n3. **Organize & Thrive** — Motivational, benefit-driven\n4. **FlowState Planner** — Modern, trendy\n5. **Simply Structured** — Minimal, elegant\n\n⭐ Top pick: **FlowState Planner** — high memorability + search-friendly.`,
  },
  {
    slug: "product-feature-generator",
    title: "Product Feature Generator",
    description: "Generate compelling features for your product.",
    icon: ListChecks,
    category: "creation",
    fields: [
      { name: "product", label: "Product Name / Type", type: "text", placeholder: "e.g. Social Media Planner Template" },
      { name: "audience", label: "Target Audience", type: "text", placeholder: "e.g. content creators, freelancers" },
    ],
    mockOutput: `📋 **Product Features**\n\n✅ 30-day content calendar with drag-and-drop scheduling\n✅ 50+ pre-designed post templates (Stories, Reels, Feed)\n✅ Hashtag research tracker with performance metrics\n✅ Analytics dashboard for engagement tracking\n✅ Brand kit section (colors, fonts, logo placement)\n✅ Printable + digital versions included\n✅ Free lifetime updates`,
  },
  {
    slug: "product-benefit-generator",
    title: "Product Benefit Generator",
    description: "Turn features into customer-focused benefits.",
    icon: Heart,
    category: "creation",
    fields: [
      { name: "features", label: "Product Features", type: "textarea", placeholder: "List your product features..." },
      { name: "audience", label: "Target Audience", type: "text", placeholder: "e.g. busy entrepreneurs" },
    ],
    mockOutput: `💎 **Customer Benefits**\n\n1. **Save 10+ hours per week** on content planning — more time for what matters\n2. **Look professional instantly** with designer-quality templates\n3. **Grow your following 3x faster** with strategic posting schedules\n4. **Never run out of ideas** with 50+ content prompts included\n5. **Track what works** and double down on high-performing content`,
  },
  {
    slug: "product-structure-builder",
    title: "Product Structure Builder",
    description: "Build a structured outline for your digital product.",
    icon: Building,
    category: "creation",
    fields: [
      { name: "product", label: "Product Type", type: "text", placeholder: "e.g. Online Course, Ebook, Template Pack" },
      { name: "topic", label: "Topic / Subject", type: "text", placeholder: "e.g. Instagram Marketing" },
    ],
    mockOutput: `🏗️ **Product Structure**\n\n📁 **Module 1: Foundation**\n  - Getting Started Guide\n  - Quick-Start Checklist\n\n📁 **Module 2: Core Content**\n  - Main Templates (10 variants)\n  - Tutorial Videos\n\n📁 **Module 3: Advanced Strategies**\n  - Pro Tips & Tricks\n  - Case Studies\n\n📁 **Module 4: Bonus Resources**\n  - Cheat Sheets\n  - Resource Library\n  - Community Access`,
  },
  {
    slug: "product-roadmap-generator",
    title: "Product Roadmap Generator",
    description: "Create a launch-ready roadmap for your product.",
    icon: Map,
    category: "creation",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Ultimate Planner Bundle" },
      { name: "timeline", label: "Timeline", type: "select", options: ["2 Weeks", "1 Month", "2 Months", "3 Months"] },
    ],
    mockOutput: `🗺️ **Product Roadmap — 1 Month**\n\n**Week 1: Research & Planning**\n- Validate idea with audience\n- Outline product structure\n- Set pricing strategy\n\n**Week 2: Creation**\n- Design core templates\n- Write copy & descriptions\n- Create mockups\n\n**Week 3: Pre-Launch**\n- Set up sales page\n- Build email waitlist\n- Create social media teasers\n\n**Week 4: Launch**\n- Launch with limited-time offer\n- Email blast to waitlist\n- Social media campaign\n- Collect reviews`,
  },

  // ── Listing Optimization ──
  {
    slug: "title-optimizer",
    title: "Title Optimizer",
    description: "Optimize your listing title for maximum visibility.",
    icon: PenTool,
    category: "listing",
    fields: [
      { name: "currentTitle", label: "Current Title", type: "text", placeholder: "e.g. Planner Template" },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Gumroad", "Amazon KDP", "Creative Market", "Shopify"] },
    ],
    mockOutput: `✏️ **Optimized Titles**\n\n1. "Digital Planner Template 2026 | Daily Weekly Monthly | iPad Goodnotes Notability"\n2. "Minimalist Planner Bundle | Printable & Digital | Instant Download"\n3. "ADHD-Friendly Daily Planner Template | Undated | Aesthetic Minimal Design"\n\n📈 Estimated CTR improvement: +45%\n🔑 Key changes: Added trending keywords, platform-specific formatting, benefit-driven language.`,
  },
  {
    slug: "tag-generator",
    title: "Tag Generator",
    description: "Generate optimized tags for your marketplace listings.",
    icon: Tag,
    category: "listing",
    fields: [
      { name: "product", label: "Product Description", type: "textarea", placeholder: "Describe your product..." },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Gumroad", "Amazon KDP", "Redbubble"] },
    ],
    mockOutput: `🏷️ **Optimized Tags (13/13)**\n\n1. digital planner\n2. planner template 2026\n3. goodnotes planner\n4. minimalist planner\n5. daily planner printable\n6. ADHD planner\n7. weekly planner\n8. undated planner\n9. aesthetic planner\n10. iPad planner\n11. productivity planner\n12. digital download\n13. planner bundle\n\n💡 Mix of high-volume and long-tail keywords for optimal reach.`,
  },
  {
    slug: "seo-description-improver",
    title: "SEO Description Improver",
    description: "Improve your product description for better SEO.",
    icon: FileSearch,
    category: "listing",
    fields: [
      { name: "description", label: "Current Description", type: "textarea", placeholder: "Paste your current product description..." },
      { name: "keywords", label: "Target Keywords", type: "text", placeholder: "e.g. digital planner, printable, template" },
    ],
    mockOutput: `📝 **Improved SEO Description**\n\n"Transform your daily routine with this beautifully designed **Digital Planner Template for 2026**. Perfect for iPad (Goodnotes, Notability) and printable use. This **minimalist planner** includes daily, weekly, and monthly layouts with hyperlinked tabs for easy navigation.\n\n✨ What's included:\n• 365 daily pages\n• 52 weekly spreads\n• 12 monthly overviews\n• Goal setting pages\n• Habit tracker\n\n📱 Compatible with Goodnotes, Notability, and all PDF annotation apps."\n\n🎯 SEO Score: 9.2/10 (+3.1 improvement)`,
  },
  {
    slug: "slug-generator",
    title: "Slug Generator",
    description: "Generate SEO-friendly URL slugs for your products.",
    icon: Link2,
    category: "listing",
    fields: [
      { name: "title", label: "Product Title", type: "text", placeholder: "e.g. Ultimate Digital Planner Bundle 2026" },
      { name: "style", label: "Slug Style", type: "select", options: ["Short & Clean", "Keyword-Rich", "Brand-Focused"] },
    ],
    mockOutput: `🔗 **Generated Slugs**\n\n1. \`digital-planner-bundle-2026\` — Keyword-rich, SEO optimal\n2. \`ultimate-planner-bundle\` — Short & clean\n3. \`creatorwand-planner-2026\` — Brand-focused\n\n✅ Recommended: \`digital-planner-bundle-2026\`\n📏 Length: 28 chars (under 60 char limit)\n🔑 Contains 3 target keywords`,
  },
  {
    slug: "faq-generator",
    title: "FAQ Generator",
    description: "Generate FAQs for your product listing.",
    icon: HelpCircle,
    category: "listing",
    fields: [
      { name: "product", label: "Product Name & Description", type: "textarea", placeholder: "Describe your product..." },
      { name: "count", label: "Number of FAQs", type: "select", options: ["5", "8", "10", "15"] },
    ],
    mockOutput: `❓ **Generated FAQs**\n\n**Q: Is this a digital download or physical product?**\nA: This is a digital download. You'll receive instant access after purchase.\n\n**Q: What apps is this compatible with?**\nA: Works with Goodnotes, Notability, PDF Expert, and any PDF annotation app.\n\n**Q: Can I print this planner?**\nA: Yes! A print-optimized version is included.\n\n**Q: Do you offer refunds?**\nA: Due to the digital nature, we don't offer refunds but happy to help with any issues.\n\n**Q: Will I receive updates?**\nA: Yes, free lifetime updates are included with your purchase.`,
  },
  {
    slug: "product-summary-generator",
    title: "Product Summary Generator",
    description: "Generate concise product summaries for listings.",
    icon: AlignLeft,
    category: "listing",
    fields: [
      { name: "details", label: "Product Details", type: "textarea", placeholder: "Enter all product details..." },
      { name: "length", label: "Summary Length", type: "select", options: ["Short (50 words)", "Medium (100 words)", "Long (200 words)"] },
    ],
    mockOutput: `📄 **Product Summary**\n\nTransform your productivity with the Ultimate Digital Planner — a beautifully designed, hyperlinked template for iPad and print. Includes 365 daily pages, weekly & monthly spreads, goal trackers, and habit logs. Works seamlessly with Goodnotes and Notability. Instant download with free lifetime updates.\n\n📊 Readability Score: 92/100\n⏱️ Reading time: 15 seconds\n🎯 Perfect for: Listing descriptions, social media bios, email previews`,
  },

  // ── Visual Content ──
  {
    slug: "cover-prompt-generator",
    title: "Product Cover Prompt",
    description: "Generate AI image prompts for product covers.",
    icon: Palette,
    category: "visual",
    fields: [
      { name: "product", label: "Product Type", type: "text", placeholder: "e.g. ebook, template bundle, course" },
      { name: "style", label: "Visual Style", type: "select", options: ["Minimalist", "Bold & Colorful", "Elegant", "Retro", "3D Render"] },
      { name: "tool", label: "Design Tool", type: "select", options: ["Canva", "Figma", "Kittl", "Midjourney", "DALL-E"] },
    ],
    mockOutput: `🎨 **Product Cover Prompts**\n\n**Prompt 1 (Minimalist):**\n"Clean, minimalist ebook cover with soft gradient background in pastel pink and cream. Centered sans-serif title typography. Subtle geometric accents. Professional, modern aesthetic. 1600x2400px."\n\n**Prompt 2 (3D Render):**\n"3D rendered digital product mockup floating at slight angle, soft studio lighting, clean white background, subtle shadow. Product displayed on tablet screen. Photorealistic."\n\n🛠️ Optimized for: Canva\n📐 Recommended dimensions: 1600 x 2400px`,
  },
  {
    slug: "thumbnail-prompt-generator",
    title: "Thumbnail Prompt Generator",
    description: "Generate AI prompts for product thumbnails.",
    icon: ImageIcon,
    category: "visual",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Social Media Kit" },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Gumroad", "YouTube", "Pinterest"] },
    ],
    mockOutput: `🖼️ **Thumbnail Prompts**\n\n**Etsy Listing (2000x2000):**\n"Flat lay mockup of digital planner on marble background with gold accessories. iPad showing planner interface. Soft natural lighting. Text overlay: 'Digital Planner 2026'. Warm color palette."\n\n**Pinterest Pin (1000x1500):**\n"Vertical pin design with bold headline at top, product mockup in center, call-to-action at bottom. Pastel pink background with subtle pattern. Eye-catching and scroll-stopping."`,
  },
  {
    slug: "hero-image-prompt-generator",
    title: "Hero Image Prompt Generator",
    description: "Generate prompts for hero/banner images.",
    icon: Layout,
    category: "visual",
    fields: [
      { name: "product", label: "Product / Brand", type: "text", placeholder: "e.g. CreatorWand Planner" },
      { name: "mood", label: "Mood", type: "select", options: ["Inspiring", "Professional", "Playful", "Luxurious", "Tech-Forward"] },
    ],
    mockOutput: `🖥️ **Hero Image Prompts**\n\n**Prompt 1 (Inspiring):**\n"Wide hero banner with sunrise gradient (peach to lavender). Floating 3D product mockups arranged dynamically. Subtle particle effects. Bold headline space on left, product display on right. 1920x600px."\n\n**Prompt 2 (Professional):**\n"Clean corporate hero with subtle mesh gradient background. Product screenshots in browser mockup frames. Minimal, sophisticated. Ample white space for text overlay."`,
  },
  {
    slug: "social-media-prompt-generator",
    title: "Social Media Prompt Generator",
    description: "Generate prompts for social media visuals.",
    icon: Share2,
    category: "visual",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Fitness Planner Bundle" },
      { name: "platform", label: "Social Platform", type: "select", options: ["Instagram Feed", "Instagram Story", "Facebook", "Twitter/X", "LinkedIn"] },
    ],
    mockOutput: `📱 **Social Media Image Prompts**\n\n**Instagram Feed (1080x1080):**\n"Carousel post slide 1: Bold product name on gradient background. Slide 2: Feature highlights with icons. Slide 3: Customer testimonial quote. Slide 4: Pricing + CTA button. Cohesive color scheme throughout."\n\n**Instagram Story (1080x1920):**\n"Story mockup showing product in-use on tablet. Swipe-up CTA at bottom. Animated text effect suggestion: typewriter reveal for headline."`,
  },

  // ── Video Marketing ──
  {
    slug: "short-video-ad-script",
    title: "Short Video Ad Script",
    description: "Generate scripts for short video ads (15-60s).",
    icon: Video,
    category: "video",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Digital Planner Pro" },
      { name: "duration", label: "Duration", type: "select", options: ["15 seconds", "30 seconds", "60 seconds"] },
      { name: "platform", label: "Platform", type: "select", options: ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook"] },
    ],
    mockOutput: `🎬 **30-Second Ad Script**\n\n**Scene 1 (0-5s):** Hook\n📷 Close-up of messy desk → transition to organized planner\n💬 "Tired of feeling overwhelmed?"\n\n**Scene 2 (5-15s):** Problem → Solution\n📷 Screen recording of planner features\n💬 "Meet the Digital Planner that changed everything..."\n\n**Scene 3 (15-25s):** Social proof\n📷 Customer testimonial screenshots scrolling\n💬 "Join 5,000+ creators already using it"\n\n**Scene 4 (25-30s):** CTA\n📷 Product mockup with price\n💬 "Get 40% off this week only. Link in bio!"\n🎵 Trending upbeat audio`,
  },
  {
    slug: "youtube-video-script",
    title: "YouTube Video Script",
    description: "Generate scripts for YouTube product videos.",
    icon: Youtube,
    category: "video",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Course Creator Toolkit" },
      { name: "duration", label: "Video Length", type: "select", options: ["3-5 minutes", "5-10 minutes", "10-15 minutes"] },
      { name: "style", label: "Video Style", type: "select", options: ["Tutorial", "Review", "Behind-the-Scenes", "Comparison"] },
    ],
    mockOutput: `📹 **YouTube Script (5-10 min Tutorial)**\n\n**Intro (0:00-0:30):**\n📷 Camera: Face-to-camera, well-lit desk setup\n💬 "In this video, I'll show you exactly how I use [Product] to save 10 hours every week..."\n\n**Chapter 1: The Problem (0:30-2:00):**\n📷 Screen share showing pain points\n💬 Walk through common struggles\n📝 Text overlay: "The Old Way vs The New Way"\n\n**Chapter 2: The Solution (2:00-5:00):**\n📷 Product demo with screen recording\n💬 Feature walkthrough with real examples\n\n**Chapter 3: Results (5:00-7:00):**\n📷 Before/after comparison\n💬 Share specific metrics & outcomes\n\n**Outro (7:00-8:00):**\n📷 Face-to-camera\n💬 CTA: "Link in description — use code LAUNCH for 40% off"\n📝 End screen: Subscribe + related video`,
  },
  {
    slug: "tiktok-reels-script",
    title: "TikTok / Reels Script",
    description: "Generate viral scripts for TikTok and Reels.",
    icon: Film,
    category: "video",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Budget Planner Template" },
      { name: "hook", label: "Hook Style", type: "select", options: ["Shocking Stat", "Question", "Controversial Take", "Story Time", "POV"] },
    ],
    mockOutput: `🎵 **TikTok/Reels Script — "Question" Hook**\n\n**Hook (0-3s):**\n📷 POV: Looking at phone, shocked expression\n💬 "Why is nobody talking about this?"\n🎵 Trending sound: [viral suspense audio]\n\n**Build (3-10s):**\n📷 Quick cuts showing product features\n💬 "I found a template that literally manages your entire budget..."\n📝 Text overlay with key stats\n\n**Payoff (10-15s):**\n📷 Screen recording of product in action\n💬 "And it's only $7..."\n📝 Text: "LINK IN BIO 🔗"\n\n**CTA (15s):**\n📷 Point at link in bio\n💬 "Go get it before the sale ends"\n\n📊 Est. viral potential: 8/10`,
  },

  // ── Marketing Strategy ──
  {
    slug: "launch-plan-generator",
    title: "Launch Plan Generator",
    description: "Generate a complete product launch plan.",
    icon: Rocket,
    category: "marketing",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Ultimate Design Bundle" },
      { name: "timeline", label: "Launch Timeline", type: "select", options: ["1 Week", "2 Weeks", "1 Month"] },
      { name: "budget", label: "Marketing Budget", type: "select", options: ["$0 (Organic)", "$50-$100", "$100-$500", "$500+"] },
    ],
    mockOutput: `🚀 **Launch Plan — 2 Weeks**\n\n**Pre-Launch (Days 1-7):**\n- Day 1-2: Finalize product & create mockups\n- Day 3: Set up landing page with email capture\n- Day 4-5: Create 5 teaser social posts\n- Day 6: Send "Coming Soon" email to list\n- Day 7: Share behind-the-scenes content\n\n**Launch Week (Days 8-14):**\n- Day 8: 🎉 LAUNCH — Email blast + social posts\n- Day 9: Share customer testimonials\n- Day 10: Host IG Live / TikTok Live demo\n- Day 11: Limited-time bonus offer\n- Day 12: Retarget with social ads\n- Day 13: Send "Last chance" email\n- Day 14: Close launch offer, share results\n\n📊 Expected results: 200-500 sales at $15 avg = $3,000-$7,500`,
  },
  {
    slug: "sales-page-copy-generator",
    title: "Sales Page Copy Generator",
    description: "Generate high-converting sales page copy.",
    icon: FileText,
    category: "marketing",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Creator Toolkit Pro" },
      { name: "price", label: "Price", type: "text", placeholder: "e.g. $29.99" },
      { name: "audience", label: "Target Audience", type: "text", placeholder: "e.g. content creators" },
    ],
    mockOutput: `📄 **Sales Page Copy**\n\n**Headline:** "Stop Spending Hours on Content — Start Creating in Minutes"\n\n**Subheadline:** "The all-in-one toolkit that 5,000+ creators use to save 10 hours every week"\n\n**Pain Points:**\n❌ Spending hours designing from scratch\n❌ Inconsistent branding across platforms\n❌ No strategy, just random posting\n\n**Solution:**\n✅ 100+ ready-to-use templates\n✅ Brand consistency toolkit\n✅ Strategic content calendar\n\n**Social Proof:**\n"This toolkit paid for itself in the first week." — Sarah K.\n\n**CTA:** "Get Instant Access for $29.99"\n**Urgency:** "Launch pricing ends in 48 hours"`,
  },
  {
    slug: "headline-generator",
    title: "Landing Page Headlines",
    description: "Generate attention-grabbing landing page headlines.",
    icon: Heading,
    category: "marketing",
    fields: [
      { name: "product", label: "Product / Offer", type: "text", placeholder: "e.g. Freelancer Invoice Template" },
      { name: "tone", label: "Tone", type: "select", options: ["Professional", "Casual", "Urgent", "Inspirational", "Bold"] },
    ],
    mockOutput: `📢 **Landing Page Headlines**\n\n1. "Get Paid Faster with Professional Invoices — In Under 2 Minutes"\n2. "The Invoice Template That Helped 3,000+ Freelancers Get Paid On Time"\n3. "Stop Chasing Payments. Start Getting Paid."\n4. "Professional Invoices, Zero Design Skills Required"\n5. "Your Clients Will Take You More Seriously — Starting Today"\n\n⭐ Top performer prediction: #3 — emotional trigger + clear benefit`,
  },
  {
    slug: "cta-generator",
    title: "Call-to-Action Generator",
    description: "Generate high-converting CTAs.",
    icon: MousePointerClick,
    category: "marketing",
    fields: [
      { name: "product", label: "Product / Offer", type: "text", placeholder: "e.g. Design Template Bundle" },
      { name: "action", label: "Desired Action", type: "select", options: ["Purchase", "Sign Up", "Download", "Start Trial", "Join Waitlist"] },
    ],
    mockOutput: `🎯 **CTA Suggestions**\n\n**Primary CTAs:**\n1. "Get Instant Access →"\n2. "Start Creating Now — $19.99"\n3. "Download Your Templates"\n\n**Urgency CTAs:**\n4. "Grab It Before Price Goes Up ⏰"\n5. "Only 47 Left at This Price"\n\n**Social Proof CTAs:**\n6. "Join 5,000+ Happy Creators"\n7. "See Why Creators Love This →"\n\n💡 Best practice: Use primary CTA above fold, urgency CTA at checkout.`,
  },
  {
    slug: "limited-time-offer-generator",
    title: "Limited Time Offer Generator",
    description: "Create compelling limited-time offers.",
    icon: Timer,
    category: "marketing",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Complete Creator Bundle" },
      { name: "originalPrice", label: "Original Price", type: "text", placeholder: "e.g. $49.99" },
      { name: "duration", label: "Offer Duration", type: "select", options: ["24 Hours", "48 Hours", "72 Hours", "1 Week"] },
    ],
    mockOutput: `⏰ **Limited Time Offer**\n\n**Offer Name:** "Creator Launch Special"\n**Duration:** 48 Hours\n\n**Pricing Structure:**\n- Original: ~~$49.99~~\n- Sale: **$24.99** (50% off)\n- Bundle bonus: Add Premium Templates for +$9.99\n\n**Urgency Copy:**\n"🔥 Flash Sale — 48 hours only. After that, it goes back to $49.99. No exceptions."\n\n**Email Subject Lines:**\n1. "50% off ends TONIGHT ⏰"\n2. "[Last chance] Your $25 savings expire soon"\n3. "I'm only doing this once..."`,
  },

  // ── Pricing & Sales ──
  {
    slug: "profit-calculator",
    title: "Profit Calculator",
    description: "Calculate profit margins for your digital products.",
    icon: Calculator,
    category: "pricing",
    fields: [
      { name: "price", label: "Selling Price", type: "text", placeholder: "e.g. $29.99" },
      { name: "costs", label: "Monthly Costs (tools, ads, etc.)", type: "text", placeholder: "e.g. $50" },
      { name: "sales", label: "Expected Monthly Sales", type: "text", placeholder: "e.g. 100" },
    ],
    mockOutput: `💰 **Profit Analysis**\n\n📊 Revenue: $2,999.00/mo (100 sales × $29.99)\n💳 Platform fees (5%): -$149.95\n📢 Marketing costs: -$50.00\n🛠️ Tool costs: -$50.00\n\n✅ **Net Profit: $2,749.05/mo**\n📈 Profit Margin: 91.7%\n💵 Annual projection: **$32,988.60**\n\n🎯 Break-even point: 4 sales/month\n📊 To hit $5k/mo: Need 167 sales`,
  },
  {
    slug: "price-testing-suggestions",
    title: "Price Testing Suggestions",
    description: "Get AI suggestions for A/B testing your prices.",
    icon: FlaskConical,
    category: "pricing",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Digital Planner Bundle" },
      { name: "currentPrice", label: "Current Price", type: "text", placeholder: "e.g. $19.99" },
      { name: "category", label: "Product Category", type: "text", placeholder: "e.g. templates, ebooks" },
    ],
    mockOutput: `🧪 **Price Testing Strategy**\n\n**Current Price:** $19.99\n\n**Test Variations:**\n| Test | Price | Strategy | Expected Impact |\n|------|-------|----------|----------------|\n| A | $14.99 | Volume play | +40% sales, -10% revenue |\n| B | $24.99 | Premium positioning | -20% sales, +15% revenue |\n| C | $19.99 + $9.99 upsell | Bundle strategy | +30% AOV |\n\n**Recommendation:** Start with Test C (upsell) — lowest risk, highest revenue potential.\n\n⏱️ Run each test for 7 days minimum with 100+ visitors.`,
  },
  {
    slug: "upsell-idea-generator",
    title: "Upsell Idea Generator",
    description: "Generate upsell ideas to increase revenue.",
    icon: ArrowUpRight,
    category: "pricing",
    fields: [
      { name: "product", label: "Main Product", type: "text", placeholder: "e.g. Social Media Template Pack" },
      { name: "price", label: "Main Product Price", type: "text", placeholder: "e.g. $19.99" },
    ],
    mockOutput: `📈 **Upsell Ideas**\n\n1. **Premium Add-on (+$9.99):** "Unlock 50 extra templates + brand kit"\n2. **Video Tutorials (+$14.99):** "Step-by-step video guide for each template"\n3. **Lifetime Updates (+$7.99):** "Get every future update free forever"\n4. **Done-For-You Setup (+$29.99):** "We customize the templates with your branding"\n5. **Bundle Deal (+$19.99):** "Add the Content Calendar + Hashtag Toolkit"\n\n💡 Top revenue booster: Bundle Deal — 35% attach rate typical\n📊 Projected AOV increase: $19.99 → $31.48 (+57%)`,
  },
  {
    slug: "cross-sell-suggestions",
    title: "Cross-Sell Suggestions",
    description: "Get AI suggestions for cross-selling products.",
    icon: ShoppingCart,
    category: "pricing",
    fields: [
      { name: "product", label: "Current Product", type: "text", placeholder: "e.g. Budget Planner Template" },
      { name: "catalog", label: "Your Product Catalog", type: "textarea", placeholder: "List your other products..." },
    ],
    mockOutput: `🛒 **Cross-Sell Suggestions**\n\n**When someone buys: Budget Planner Template**\n\n1. 🎯 "Customers also bought: **Savings Goal Tracker** — $7.99"\n2. 📊 "Complete the set: **Financial Dashboard Template** — $12.99"\n3. 📚 "Learn more: **Personal Finance Ebook** — $9.99"\n\n**Placement Strategy:**\n- Thank-you page: Show #1\n- Follow-up email (Day 3): Show #2\n- Email sequence (Day 7): Show #3\n\n📈 Expected cross-sell rate: 15-25%`,
  },

  // ── Growth ──
  {
    slug: "global-pricing-converter",
    title: "Global Pricing Converter",
    description: "Convert and optimize pricing for global markets.",
    icon: DollarSign,
    category: "growth",
    fields: [
      { name: "price", label: "Base Price (USD)", type: "text", placeholder: "e.g. $19.99" },
      { name: "markets", label: "Target Markets", type: "select", options: ["Europe", "UK", "Asia", "Latin America", "Global"] },
    ],
    mockOutput: `🌍 **Global Pricing**\n\n| Market | Currency | Converted | Recommended |\n|--------|----------|-----------|-------------|\n| 🇺🇸 USA | USD | $19.99 | $19.99 |\n| 🇪🇺 Europe | EUR | €18.49 | €17.99 |\n| 🇬🇧 UK | GBP | £15.89 | £15.99 |\n| 🇯🇵 Japan | JPY | ¥2,998 | ¥2,980 |\n| 🇧🇷 Brazil | BRL | R$99.95 | R$89.90 |\n\n💡 Tip: Use psychological pricing (e.g., .99) for Western markets and round numbers for Asian markets.`,
  },
  {
    slug: "localization-suggestions",
    title: "Localization Suggestions",
    description: "Get suggestions for localizing your products.",
    icon: MapPin,
    category: "growth",
    fields: [
      { name: "product", label: "Product Type", type: "text", placeholder: "e.g. planner template, ebook" },
      { name: "targetMarket", label: "Target Market", type: "select", options: ["Spain/Latin America", "France", "Germany", "Japan", "Brazil", "Middle East"] },
    ],
    mockOutput: `🌐 **Localization Suggestions — Spain/Latin America**\n\n📝 **Content Adjustments:**\n- Use A4 paper size (not Letter)\n- Week starts on Monday\n- Use DD/MM/YYYY date format\n- Currency symbol before number: €19,99\n\n🎨 **Design Adjustments:**\n- Warmer color palettes perform better\n- Include Spanish-language mockup images\n- Right-align price tags\n\n📣 **Marketing Adjustments:**\n- Focus on WhatsApp marketing (primary channel)\n- Instagram > Facebook for discovery\n- Emphasize community & family themes`,
  },

  // ── Business Management ──
  {
    slug: "content-calendar-generator",
    title: "Content Calendar Generator",
    description: "Generate a content calendar for product promotion.",
    icon: CalendarDays,
    category: "business",
    fields: [
      { name: "product", label: "Product / Brand", type: "text", placeholder: "e.g. CreatorWand" },
      { name: "duration", label: "Calendar Duration", type: "select", options: ["1 Week", "2 Weeks", "1 Month"] },
      { name: "platforms", label: "Platforms", type: "select", options: ["Instagram + TikTok", "Twitter + LinkedIn", "All Platforms", "YouTube + Blog"] },
    ],
    mockOutput: `📅 **Content Calendar — Week 1**\n\n| Day | Platform | Content Type | Topic |\n|-----|----------|-------------|-------|\n| Mon | Instagram | Carousel | "5 Signs You Need a Digital Planner" |\n| Tue | TikTok | Short Video | Behind-the-scenes of product creation |\n| Wed | Instagram | Story Poll | "What feature do you want next?" |\n| Thu | TikTok | Tutorial | "How to set up your digital planner" |\n| Fri | Instagram | Reel | Customer transformation story |\n| Sat | TikTok | Trending | Hop on trending audio with product |\n| Sun | Instagram | Static Post | Weekly motivation + soft CTA |\n\n📊 Posting times: 9AM, 12PM, or 6PM (audience peak hours)`,
  },
  {
    slug: "product-improvement-suggestions",
    title: "Product Improvement Ideas",
    description: "Get AI suggestions to improve your existing products.",
    icon: Wrench,
    category: "business",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Digital Planner Pro" },
      { name: "feedback", label: "Customer Feedback (optional)", type: "textarea", placeholder: "Paste any customer reviews or feedback..." },
    ],
    mockOutput: `🔧 **Improvement Suggestions**\n\n**Quick Wins (This Week):**\n1. Add a quick-start guide PDF\n2. Include 3 color variations\n3. Add hyperlinks to all pages\n\n**Medium-Term (This Month):**\n4. Create video tutorials for setup\n5. Add a monthly review/reflection page\n6. Include a habit tracker section\n\n**Growth Moves (Next Quarter):**\n7. Launch a premium version with more templates\n8. Create a companion mobile app\n9. Build a community for users\n\n📈 Impact prediction: Quick wins alone could boost ratings by +0.3 stars`,
  },

  // ── Bonus Analysis ──
  {
    slug: "digital-product-quality-score",
    title: "Product Quality Score",
    description: "Get an AI quality score for your digital product.",
    icon: Star,
    category: "bonus",
    fields: [
      { name: "product", label: "Product Name", type: "text", placeholder: "e.g. Ultimate Planner Bundle" },
      { name: "details", label: "Product Details", type: "textarea", placeholder: "Describe features, contents, pricing..." },
    ],
    mockOutput: `⭐ **Product Quality Score: 7.8/10**\n\n| Criteria | Score | Notes |\n|----------|-------|-------|\n| Content depth | 8/10 | Good variety of pages |\n| Design quality | 7/10 | Could use more polish |\n| Value for price | 9/10 | Excellent price point |\n| Uniqueness | 6/10 | Similar products exist |\n| User experience | 8/10 | Good navigation |\n| Market fit | 9/10 | Strong demand |\n\n🔑 **Top improvement:** Increase uniqueness — add a feature competitors don't have.\n💡 Suggestion: Add an AI-powered goal-setting section.`,
  },
  {
    slug: "viral-product-predictor",
    title: "Viral Product Predictor",
    description: "Predict the viral potential of your product.",
    icon: Flame,
    category: "bonus",
    fields: [
      { name: "product", label: "Product Idea", type: "text", placeholder: "e.g. ADHD-friendly planner template" },
      { name: "platform", label: "Primary Platform", type: "select", options: ["TikTok", "Instagram", "Etsy", "Twitter/X", "Pinterest"] },
    ],
    mockOutput: `🔥 **Viral Potential Score: 8.5/10**\n\n✅ **Viral Factors:**\n- Taps into underserved community (ADHD)\n- Highly shareable / relatable content\n- Visual product = great for short-form video\n- Strong emotional connection\n\n📈 **Predicted Performance:**\n- TikTok: 500K+ views potential\n- Conversion rate: 3-5%\n- Best posting time: Tue/Thu 6-9PM\n\n🎯 **Viral Strategy:**\n1. Share creator's personal story with ADHD\n2. Before/after organization content\n3. Partner with ADHD content creators\n\n⚠️ **Risk:** Market could saturate in 3-6 months — move fast.`,
  },
  {
    slug: "customer-avatar-builder",
    title: "Customer Avatar Builder",
    description: "Build a detailed customer avatar for targeting.",
    icon: UserCircle,
    category: "bonus",
    fields: [
      { name: "product", label: "Product Type", type: "text", placeholder: "e.g. Social Media Templates" },
      { name: "niche", label: "Niche / Industry", type: "text", placeholder: "e.g. small business, fitness" },
    ],
    mockOutput: `👤 **Customer Avatar: "Creative Carla"**\n\n**Demographics:**\n- Age: 25-35\n- Gender: Female (70%)\n- Location: Urban, US/UK/AU\n- Income: $40K-$70K\n\n**Psychographics:**\n- Values aesthetics and organization\n- Active on Instagram & Pinterest\n- Aspiring entrepreneur or side-hustler\n- Tech-savvy but not a designer\n\n**Pain Points:**\n😫 "I spend hours making my posts look good"\n😫 "My brand looks inconsistent"\n😫 "I can't afford a designer"\n\n**Buying Behavior:**\n- Researches on Pinterest, buys on Etsy\n- Influenced by before/after content\n- Price-sensitive but pays for quality\n- Reads reviews before purchasing`,
  },
  {
    slug: "creator-brand-name-generator",
    title: "Creator Brand Name Generator",
    description: "Generate unique brand names for your creator business.",
    icon: Fingerprint,
    category: "bonus",
    fields: [
      { name: "niche", label: "Your Niche", type: "text", placeholder: "e.g. digital planning, design templates" },
      { name: "style", label: "Brand Style", type: "select", options: ["Modern & Minimal", "Fun & Playful", "Professional", "Luxury", "Artsy"] },
      { name: "keywords", label: "Keywords to Include (optional)", type: "text", placeholder: "e.g. create, design, studio" },
    ],
    mockOutput: `🏷️ **Brand Name Suggestions**\n\n1. **PixelMint Studio** — Modern, fresh, creative\n2. **The Create Lab** — Action-oriented, inclusive\n3. **Luminary Designs** — Premium, aspirational\n4. **Craft & Flow Co.** — Approachable, artisan feel\n5. **NeonCanvas** — Bold, contemporary\n\n✅ **Domain Availability:**\n- pixelmintstudio.com ✅\n- thecreatelab.co ✅\n- luminarydesigns.com ❌ (try .co)\n- craftandflow.co ✅\n- neoncanvas.com ✅\n\n⭐ Top pick: **PixelMint Studio** — unique, memorable, domain available.`,
  },
  {
    slug: "digital-store-bio-generator",
    title: "Digital Store Bio Generator",
    description: "Generate professional bios for your digital store.",
    icon: Store,
    category: "bonus",
    fields: [
      { name: "storeName", label: "Store / Brand Name", type: "text", placeholder: "e.g. PixelMint Studio" },
      { name: "niche", label: "What You Sell", type: "text", placeholder: "e.g. Canva templates, digital planners" },
      { name: "platform", label: "Platform", type: "select", options: ["Etsy", "Gumroad", "Shopify", "Creative Market", "Social Media"] },
    ],
    mockOutput: `✍️ **Store Bio Options**\n\n**Professional:**\n"Welcome to PixelMint Studio ✨ We create beautiful, ready-to-use digital templates that help creators and entrepreneurs save time and look professional. 5,000+ happy customers worldwide. New designs added weekly!"\n\n**Casual & Friendly:**\n"Hey! 👋 I'm [Name], the creator behind PixelMint Studio. I make digital templates so you can spend less time designing and more time doing what you love. Grab a template and let's create something amazing!"\n\n**SEO-Optimized:**\n"PixelMint Studio | Premium Digital Templates & Planners | Canva Templates, Social Media Kits, Digital Planners | Instant Download | 5,000+ Sales | ⭐ 4.9 Rating"\n\n📊 Recommended: Use Professional for Etsy, Casual for Gumroad, SEO for Creative Market.`,
  },
];

export function getToolsByCategory(category: string): ToolConfig[] {
  return tools.filter((t) => t.category === category);
}

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return tools.find((t) => t.slug === slug);
}
