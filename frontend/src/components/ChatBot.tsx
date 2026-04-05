import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  Coffee,
  Building2,
  Phone,
  MessageSquare,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  displayedText: string; // for streaming effect
  timestamp: Date;
  quickActions?: QuickAction[];
  isStreaming: boolean;
  feedback?: "up" | "down";
}

interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

interface ChatBotProps {
  onNavigate?: (page: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════════
   KNOWLEDGE BASE
   ═══════════════════════════════════════════════════════════════════════════════ */

const INFO = {
  name: "Megapods India",
  location: "Surat, Gujarat, India",
  phone1: "+91 87581 76693",
  phone2: "+91 92653 80907",
  email: "megapodsindia@gmail.com",
  hours: "Mon–Sat: 9 AM – 7 PM",
  closed: "Sunday: Closed",
  whatsapp: "919426951908",
};

/* ═══════════════════════════════════════════════════════════════════════════════
   HUMAN-LIKE RESPONSE ENGINE
   ─ Natural, warm, conversational tone — like talking to a real person
   ═══════════════════════════════════════════════════════════════════════════════ */

const GREET_VARIANTS = [
  `Hey there! 👋 Welcome to Megapods India! I'm really glad you stopped by.\n\nI'm here to help you with anything — whether you want to learn about our container solutions, get a price estimate, or just explore what's possible with modular architecture.\n\nSo, what brings you here today?`,
  `Hi! 😊 Great to have you here at Megapods India!\n\nI can help you explore our container cafes, offices, public toilet solutions, and custom builds. I can also get you a quick quote or connect you with our team.\n\nWhat would you like to know?`,
  `Hello! Welcome to Megapods India! 🏗️\n\nI'm your personal assistant here — think of me as your go-to person for everything about premium container architecture. From pricing to customization, I've got all the answers.\n\nHow can I help you today?`,
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

// Conversation memory for context
let conversationTopics: string[] = [];

function detectAndRespond(
  userText: string
): { text: string; quickActions: QuickAction[] } {
  const n = normalize(userText);

  // ── Greetings ──
  if (/^(hi+|hello|hey|namaste|good\s*(morning|afternoon|evening)|howdy|yo|sup)\b/.test(n)) {
    return {
      text: pickRandom(GREET_VARIANTS),
      quickActions: [
        { label: "Our Services", action: "services", icon: "⚡" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
        { label: "See Our Work", action: "gallery", icon: "🖼️" },
        { label: "Talk to Team", action: "contact", icon: "📞" },
      ],
    };
  }

  // ── Thanks / Bye ──
  if (/\b(thank|thanks|bye|goodbye|see you|take care|dhanyavaad|shukriya)\b/.test(n)) {
    return {
      text: pickRandom([
        `You're welcome! 😊 It was lovely chatting with you. If you ever need anything — a quote, design advice, or just want to brainstorm ideas — I'm always here.\n\nYou can also reach our team directly at **${INFO.phone1}** or WhatsApp us anytime. Have a great day! ✨`,
        `Glad I could help! 🙏 Don't hesitate to come back if you have more questions. Our team is also available at **${INFO.phone1}** if you'd prefer a call.\n\nTake care and happy building! 🏗️`,
        `Thank you for chatting with us! It's been a pleasure. 😊\n\nWhenever you're ready to take the next step — whether it's getting a quote or scheduling a consultation — we're just a message away. See you soon! ✨`,
      ]),
      quickActions: [
        { label: "WhatsApp Us", action: "whatsapp", icon: "💬" },
        { label: "New Chat", action: "restart", icon: "🔄" },
      ],
    };
  }

  // ── Contact Info ──
  if (/\b(contact|phone|call|number|email|address|location|where|reach|visit)\b/.test(n)) {
    conversationTopics.push("contact");
    return {
      text: `Sure! Here's how you can reach us:\n\n📞 **Phone:** ${INFO.phone1} / ${INFO.phone2}\n📧 **Email:** ${INFO.email}\n📍 **Office:** ${INFO.location}\n🕐 **Hours:** ${INFO.hours} (${INFO.closed})\n\nThe quickest way to get a response? Drop us a WhatsApp message — we usually reply within minutes! 💬\n\nWould you like me to help you with something specific?`,
      quickActions: [
        { label: "WhatsApp Now", action: "whatsapp", icon: "💬" },
        { label: "Contact Page", action: "nav_contact", icon: "📍" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Working Hours ──
  if (/\b(hour|timing|open|close|when|schedule|available|kab)\b/.test(n)) {
    return {
      text: `We're available **Monday through Saturday, 9 AM to 7 PM**. Sundays we take a breather! 😄\n\nBut honestly, you can WhatsApp us anytime — even on Sundays — and we'll get back to you as soon as possible.\n\nWant to schedule something specific?`,
      quickActions: [
        { label: "Call Now", action: "call", icon: "📞" },
        { label: "WhatsApp", action: "whatsapp", icon: "💬" },
      ],
    };
  }

  // ── About Company ──
  if (/\b(about|who|company|megapods|tell me about|information)\b/.test(n)) {
    conversationTopics.push("about");
    return {
      text: `Great question! Let me give you the quick rundown 😊\n\n**Megapods India** is a premium modular construction company based in **Surat, Gujarat**. We basically take shipping containers and transform them into something incredible — think stylish cafes, modern offices, clean public restrooms, and really anything you can imagine.\n\nWhat makes us different?\n• We use **ISO-certified materials** — no compromise on quality\n• Every project is **100% customized** to your brand and needs\n• We handle **everything** from design to delivery (turnkey solutions)\n• Our structures last **25+ years** with proper maintenance\n\nWe've been helping entrepreneurs, municipalities, and businesses create amazing spaces without the hassle and cost of traditional construction.\n\nWhat aspect would you like to dive deeper into?`,
      quickActions: [
        { label: "Our Services", action: "services", icon: "⚡" },
        { label: "Why Choose Us", action: "why_choose", icon: "🏆" },
        { label: "See Portfolio", action: "gallery", icon: "🖼️" },
      ],
    };
  }

  // ── Container Cafe ──
  if (/\b(cafe|coffee|restaurant|food|kitchen|juice|bar|chai|tea|bakery|bistro)\b/.test(n)) {
    conversationTopics.push("cafe");
    return {
      text: `Oh, container cafes are probably our most popular product — and honestly, they turn out SO good! ☕✨\n\nHere's what you get:\n• **Fully equipped kitchen** with all plumbing and electrical\n• **Custom branding** — your colors, your logo, your vibe\n• **Climate control** — AC, ventilation, the works\n• **Outdoor seating** options if you want that open-air feel\n• **Instagram-worthy design** that'll have people stopping to take photos 📸\n\n**Perfect for:** Coffee shops, juice bars, food trucks, beach cafes, pop-up restaurants, event catering\n\n**Starting price:** Around ₹5–8 lakhs depending on what you want inside. We've done cafes for as low as ₹4.5L for basic setups.\n\n**Timeline:** Usually 4-6 weeks from design approval to your doorstep.\n\nWant me to get you a detailed quote for your cafe idea? I'd love to hear what you're envisioning! 🎨`,
      quickActions: [
        { label: "Get Cafe Quote", action: "nav_quotation", icon: "💰" },
        { label: "See Cafe Designs", action: "nav_gallery", icon: "🖼️" },
        { label: "Talk to Expert", action: "nav_contact", icon: "📞" },
        { label: "Other Services", action: "services", icon: "⚡" },
      ],
    };
  }

  // ── Container Office ──
  if (/\b(office|workspace|work\s*space|desk|corporate|startup|cowork)\b/.test(n)) {
    conversationTopics.push("office");
    return {
      text: `Container offices are a game-changer, especially for startups and businesses that want something professional without breaking the bank! 🏢\n\nHere's what we build:\n• **Climate-controlled** workspace with proper insulation\n• **Professional interiors** — partition walls, meeting rooms, reception area\n• **Full electrical** with data cable setup, power outlets everywhere\n• **Security features** — access control, CCTV mounting points\n• **Energy-efficient** design that keeps electricity bills low\n\n**Great for:** Startups, construction site offices, satellite offices, co-working spaces, remote team hubs\n\nThe best part? If your business moves, your office moves with you! We can relocate it to a new site.\n\n**Timeline:** 5-8 weeks depending on the configuration.\n\nWant me to help you figure out the right setup for your team?`,
      quickActions: [
        { label: "Get Office Quote", action: "nav_quotation", icon: "💰" },
        { label: "See Office Designs", action: "nav_gallery", icon: "🖼️" },
        { label: "Talk to Expert", action: "nav_contact", icon: "📞" },
      ],
    };
  }

  // ── Public Toilets ──
  if (/\b(toilet|washroom|bathroom|restroom|sanitation|lavatory|loo|shauchalay)\b/.test(n)) {
    conversationTopics.push("toilet");
    return {
      text: `Public toilet solutions are a really important part of what we do — clean sanitation is something everyone deserves! 🚻\n\nOur toilet units come with:\n• **Multiple compartment** options (2, 4, 6, 8 units)\n• **Water-efficient fixtures** that save resources\n• **Ventilation & odor control** — nobody likes a smelly restroom!\n• **Accessible designs** for people with disabilities\n• **Anti-corrosion materials** that last for decades\n• **Easy-to-clean** surfaces for minimal maintenance\n\n**Perfect for:** Municipal projects, parks, highway rest stops, construction sites, events, commercial complexes\n\nWe work with government bodies too, so if this is a municipal project, we can definitely help with the paperwork and compliance.\n\nWant to discuss your specific requirements?`,
      quickActions: [
        { label: "Get Quote", action: "nav_quotation", icon: "💰" },
        { label: "Contact Team", action: "nav_contact", icon: "📞" },
        { label: "Other Services", action: "services", icon: "⚡" },
      ],
    };
  }

  // ── Custom Solutions ──
  if (/\b(custom|bespoke|unique|special|gym|clinic|store|retail|studio|housing|medical|shop|mall|showroom)\b/.test(n)) {
    conversationTopics.push("custom");
    return {
      text: `Oh, custom projects are where the magic happens! This is where we get really creative 🎨\n\nWe've built all sorts of things:\n• **Retail stores** with display areas and branding\n• **Fitness centers / gyms** with proper ventilation and flooring\n• **Medical clinics** with hygiene-certified interiors\n• **Art studios** and **photography studios**\n• **Pop-up showrooms** for product launches\n• **Temporary housing** for workers or events\n\nBasically, if you can dream it, we can build it inside a container! We work with you from the very first sketch to final delivery.\n\nThe process starts with a **free consultation** where we understand exactly what you need. Then our design team creates 3D renders so you can see it before we build it.\n\nWhat kind of custom project are you thinking about? I'd love to hear your idea! 💡`,
      quickActions: [
        { label: "Free Consultation", action: "nav_contact", icon: "📅" },
        { label: "Get Quote", action: "nav_quotation", icon: "💰" },
        { label: "See Examples", action: "nav_gallery", icon: "🖼️" },
      ],
    };
  }

  // ── All Services ──
  if (/\b(service|solution|product|offer|provide|what can|what do|do you|build|make|create)\b/.test(n)) {
    conversationTopics.push("services");
    return {
      text: `We've got four main offerings, and each one is fully customizable to your needs:\n\n☕ **Container Cafes** — Perfect for entrepreneurs who want a trendy, eye-catching cafe. Starting from ₹5-8L.\n\n🏢 **Container Offices** — Professional workspaces at a fraction of traditional construction costs.\n\n🚻 **Public Toilets** — Clean, durable sanitation solutions for public spaces and municipalities.\n\n📦 **Custom Builds** — Literally anything! Gyms, clinics, retail stores, studios — you name it.\n\n**What's included with every project:**\n✅ Free design consultation\n✅ 3D renders before construction\n✅ Premium ISO-certified materials\n✅ Complete electrical & plumbing\n✅ Delivery and installation at your site\n\nWhich one catches your eye? I can give you much more detail on any of these! 😊`,
      quickActions: [
        { label: "☕ Cafes", action: "cafe_details", icon: "☕" },
        { label: "🏢 Offices", action: "office_details", icon: "🏢" },
        { label: "🚻 Toilets", action: "toilet_details", icon: "🚻" },
        { label: "📦 Custom", action: "custom_details", icon: "📦" },
      ],
    };
  }

  // ── Process / How it works ──
  if (/\b(process|how\s*(it|does it|do you)\s*work|step|procedure|workflow|get started|start|begin|kaise)\b/.test(n)) {
    return {
      text: `Great question! Here's how the whole journey works — it's pretty straightforward:\n\n**Step 1: Free Consultation** 💬\nWe hop on a call or meet in person. You tell us your vision, budget, and timeline. Zero pressure, just a friendly chat.\n\n**Step 2: Design & 3D Renders** 🎨\nOur design team creates detailed 3D visualizations of your container. You get to see exactly how it'll look before we start building. We refine until you love it.\n\n**Step 3: Manufacturing** 🔧\nOnce you approve the design, our team gets to work. We use premium, ISO-certified materials and do everything in-house for quality control.\n\n**Step 4: Delivery & Setup** 🚛\nWe deliver to your location, install everything, and make sure it's 100% ready to use. You just walk in and start your business!\n\n**Total timeline:** Usually 4-8 weeks depending on complexity.\n\nReady to take the first step? That free consultation is genuinely free — no strings attached! 😊`,
      quickActions: [
        { label: "Book Free Consultation", action: "nav_contact", icon: "📅" },
        { label: "Get Instant Quote", action: "nav_quotation", icon: "💰" },
        { label: "WhatsApp Us", action: "whatsapp", icon: "💬" },
      ],
    };
  }

  // ── Pricing / Cost / Quote ──
  if (/\b(price|cost|pricing|quote|quotation|estimate|how much|kitna|paisa|rupee|lakh|budget|rate|charge|fee|afford)\b/.test(n)) {
    conversationTopics.push("pricing");
    return {
      text: `Let's talk numbers! 💰 Here's a rough idea:\n\n☕ **Container Cafe:** ₹5–8 lakhs for a standard setup. Premium builds with full kitchen can go up to ₹12-15L.\n\n🏢 **Container Office:** ₹6–12 lakhs depending on size and interior finish.\n\n🚻 **Public Toilets:** ₹3–8 lakhs based on number of compartments and features.\n\n📦 **Custom Builds:** Really depends on what you need — could be ₹4L for something simple or ₹20L+ for something elaborate.\n\n**Important things to know:**\n• All prices are **indicative** — your actual quote depends on your specific requirements\n• Prices **include GST**\n• Quotes are **valid for 30 days**\n• **No hidden charges** — what we quote is what you pay\n\n🔥 **Pro tip:** Use our **Quotation Generator** on the website for an instant estimate! Or I can connect you with our team for a detailed, personalized quote.\n\nWhat kind of project are you budgeting for?`,
      quickActions: [
        { label: "Instant Quote Tool", action: "nav_quotation", icon: "🧮" },
        { label: "Call for Quote", action: "call", icon: "📞" },
        { label: "WhatsApp Quote", action: "whatsapp", icon: "💬" },
      ],
    };
  }

  // ── Gallery / Portfolio / Show work ──
  if (/\b(gallery|photo|image|picture|portfolio|design|show|look|see|sample|example|demo|work)\b/.test(n)) {
    return {
      text: `Oh yes, you definitely should check out our work! 📸\n\nOur gallery has some beautiful designs:\n• Trendy cafe concepts that look amazing\n• Sleek, professional office spaces\n• Clean, modern toilet facilities\n• Some really creative custom builds\n\nKeep in mind — these are design benchmarks. Your project will be **completely customized** to match YOUR brand, YOUR style, and YOUR requirements. Think of the gallery as inspiration! 🎨\n\nWant to take a look?`,
      quickActions: [
        { label: "Open Gallery", action: "nav_gallery", icon: "🖼️" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
        { label: "Talk to Designer", action: "nav_contact", icon: "🎨" },
      ],
    };
  }

  // ── WhatsApp ──
  if (/\b(whatsapp|chat|message|dm|direct|msg)\b/.test(n)) {
    return {
      text: `WhatsApp is honestly the fastest way to reach us! 📱\n\nJust click the button below and you'll be connected instantly. Our team usually responds within minutes during working hours.\n\nYou can share:\n• Your project requirements\n• Reference images or sketches\n• Questions about pricing\n• Anything at all!\n\nWe're super responsive on WhatsApp — give it a try! 💬`,
      quickActions: [
        { label: "Open WhatsApp", action: "open_whatsapp", icon: "💬" },
        { label: "Prefer Calling?", action: "call", icon: "📞" },
      ],
    };
  }

  // ── Timeline / Duration ──
  if (/\b(how long|time|timeline|duration|week|day|month|deliver|fast|quick|jaldi|kab)\b/.test(n)) {
    return {
      text: `Here's what the timeline typically looks like:\n\n📋 **Simple Projects** (basic cafe, small office): **4-5 weeks**\n📋 **Standard Projects** (custom cafe, full office): **5-7 weeks**\n📋 **Complex Projects** (multi-container, heavy customization): **6-10 weeks**\n\nThis includes design approval, manufacturing, and delivery. The clock starts once you approve the final design.\n\n**Want it faster?** We can sometimes expedite projects for an additional fee — just let us know your deadline and we'll see what we can do! ⚡\n\nWhat's your timeline looking like?`,
      quickActions: [
        { label: "Start a Project", action: "nav_contact", icon: "🚀" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Durability / Quality ──
  if (/\b(durable|weather|rain|rust|strong|last|lifespan|year|weatherproof|quality|reliable|safe|sturdy)\b/.test(n)) {
    return {
      text: `This is one of my favorite questions because the answer is SO reassuring! 💪\n\nShipping containers are literally built to survive **ocean storms** — they're some of the toughest structures out there. And then WE make them even better:\n\n🛡️ **Weatherproofing** — Rain, sun, wind? No problem.\n🛡️ **Rust-proofing** — Special coatings that prevent corrosion\n🛡️ **Insulation** — Keeps it cool in summer, warm in winter\n🛡️ **ISO-certified materials** — International quality standards\n\n**How long do they last?** With basic maintenance, you're looking at **25+ years easily**. Some containers are still going strong after 40+ years!\n\n**Maintenance?** Super minimal — just occasional cleaning and a paint touch-up every few years. Way less hassle than a traditional building.\n\nPretty impressive, right? 😊`,
      quickActions: [
        { label: "See Our Quality", action: "gallery", icon: "🖼️" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
        { label: "More Questions", action: "help", icon: "❓" },
      ],
    };
  }

  // ── Customization ──
  if (/\b(customize|custom|design|modify|color|brand|interior|layout|paint|choose|option|personali)\b/.test(n)) {
    return {
      text: `The customization options are honestly endless — that's the beauty of working with us! 🎨\n\nHere's what you can customize:\n\n🎨 **Exterior:** Colors, branding, logo placement, lighting, signage\n🏠 **Interior:** Layout, flooring, wall finishes, ceiling design\n🚪 **Doors & Windows:** Placement, type (sliding, roll-up, glass), sizes\n⚡ **Electrical:** Wiring, outlets, data cables, smart features\n🔧 **Plumbing:** Sinks, toilets, kitchen setup\n❄️ **HVAC:** AC, ventilation, heating\n🪑 **Furniture:** Built-in counters, shelves, desks, seating\n🔐 **Security:** Locks, CCTV mounts, access control\n\nBasically, if you can think it, we can build it. The process starts with you sharing your ideas — even rough sketches work — and our design team turns them into reality.\n\nWhat are you looking to customize? Let me know your vision! 💡`,
      quickActions: [
        { label: "Start Customizing", action: "nav_contact", icon: "🎨" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
        { label: "See Examples", action: "gallery", icon: "🖼️" },
      ],
    };
  }

  // ── Sizes ──
  if (/\b(size|dimension|feet|ft|20|40|square|area|big|small|large|measure|space|room)\b/.test(n)) {
    return {
      text: `We work with multiple container sizes to fit your needs:\n\n📦 **20ft Container** (~150 sq ft) — Great for small cafes, kiosks, guard rooms\n📦 **40ft Container** (~320 sq ft) — Perfect for full offices, restaurants, larger setups\n📦 **Multi-Container** — Combine 2, 3, or even 4+ containers for bigger spaces\n📦 **Custom Dimensions** — Need something non-standard? We can make it happen!\n\n**Not sure which size you need?** Tell me what you're planning to put inside, and I can recommend the right size for you! 😊`,
      quickActions: [
        { label: "Recommend a Size", action: "nav_contact", icon: "📐" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Why choose / Benefits ──
  if (/\b(why|reason|advantage|benefit|better|best|choose|differ|compare|vs|versus|traditional)\b/.test(n)) {
    return {
      text: `Here's the honest truth about why our clients choose us over traditional construction:\n\n**⚡ Speed** — Ready in 4-8 weeks vs. months for traditional building\n**💰 Cost** — 40-60% cheaper than brick-and-mortar construction\n**🔄 Portable** — If you move, your building moves with you!\n**🌱 Eco-friendly** — Recycling containers = less construction waste\n**🎨 100% Custom** — Every inch designed for YOUR needs\n**🛡️ Durable** — Built to last 25+ years\n**🔑 Turnkey** — We handle everything from A to Z\n**📋 Low maintenance** — Way less upkeep than traditional buildings\n\nPlus, our team genuinely cares about your project. We're not just building a container — we're building your dream space. 🏗️\n\nWant to see what we can do for you?`,
      quickActions: [
        { label: "Get Started", action: "nav_contact", icon: "🚀" },
        { label: "See Our Work", action: "gallery", icon: "🖼️" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Permits / Legal ──
  if (/\b(permit|permission|legal|government|approval|regulation|license|complian|noc|municipality)\b/.test(n)) {
    return {
      text: `Good thinking — permits are important! Here's the deal:\n\n**For temporary / mobile setups:**\nUsually very minimal paperwork. Many clients set up without issues, especially for pop-up cafes and event structures.\n\n**For permanent installations:**\nYou may need building permits and local authority approval. This varies by city and state.\n\n**How we help:**\n• We guide you through the local requirements\n• Our designs comply with safety standards\n• We can provide structural certification if needed\n• For government projects, we handle all compliance documentation\n\nDon't stress about this — we've done it many times and we'll walk you through every step! 😊\n\nAnything else you're wondering about?`,
      quickActions: [
        { label: "Talk to Expert", action: "nav_contact", icon: "📞" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Relocation ──
  if (/\b(relocat|move|shift|portable|transport|another|transfer)\b/.test(n)) {
    return {
      text: `Yes! This is actually one of the BEST things about container structures — **they can move with you!** 🚛\n\nIf you decide to change locations, we can:\n• Arrange crane services for loading\n• Handle transportation to the new site\n• Re-install and re-connect everything at the new location\n\nThe container itself is built to be transported — that's literally what they were designed for! Moving typically takes 1-2 days.\n\nSome of our clients have relocated their cafes seasonally (beach location in summer, city center in winter). Pretty cool, right? 😎`,
      quickActions: [
        { label: "Learn More", action: "nav_contact", icon: "📞" },
        { label: "Our Services", action: "services", icon: "⚡" },
      ],
    };
  }

  // ── Maintenance ──
  if (/\b(maintain|maintenance|care|upkeep|clean|service|repair|fix)\b/.test(n)) {
    return {
      text: `One of the best things about our containers is they need **very little maintenance**! Here's what we recommend:\n\n**Monthly:**\n• Basic exterior cleaning (just a hose down)\n• Check door and window seals\n\n**Every 6 months:**\n• Inspect paint/coating for any chips\n• Service AC/ventilation equipment\n• Check plumbing connections\n\n**Annually:**\n• Touch up paint if needed\n• Full electrical inspection\n• Structural check (usually quick and easy)\n\nWe provide a **detailed maintenance guide** with every project, and our team is always available if you need help with anything.\n\nCompared to a traditional building, this is a walk in the park! 🌿`,
      quickActions: [
        { label: "More Questions", action: "help", icon: "❓" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
      ],
    };
  }

  // ── Mission / Vision ──
  if (/\b(mission|vision|values|believe|goal|purpose|philosophy)\b/.test(n)) {
    return {
      text: `At our core, here's what drives us:\n\n🎯 **Our Mission:** To make premium modular architecture accessible to everyone — not just big corporations. We believe sustainable, beautiful spaces shouldn't cost a fortune.\n\n👁️ **Our Vision:** To become the global benchmark in modular engineering by combining innovative design with industrial-grade precision.\n\n**What we believe in:**\n• Quality without shortcuts — ISO-certified everything\n• Innovation — we're always experimenting with new designs and materials\n• Customer-first — your project, your vision, our execution\n• Sustainability — turning containers into spaces instead of waste\n\nWe're not just building containers — we're building the future of how people live and work. ✨`,
      quickActions: [
        { label: "About Us Page", action: "nav_about", icon: "📖" },
        { label: "Our Services", action: "services", icon: "⚡" },
      ],
    };
  }

  // ── Help ──
  if (/\b(help|assist|support|guide|stuck|confused|don't know|idea)\b/.test(n)) {
    return {
      text: `No worries, I'm here for you! 😊 Here's what I can help with:\n\n**🏗️ Products & Services**\n"Tell me about container cafes" / "What do you build?"\n\n**💰 Pricing & Quotes**\n"How much does a cafe cost?" / "Get me a quote"\n\n**📋 Process & Timelines**\n"How do I get started?" / "How long does it take?"\n\n**📞 Getting in Touch**\n"How can I contact you?" / "WhatsApp number?"\n\n**❓ Common Questions**\n"Are containers durable?" / "Can I customize everything?"\n\nJust type naturally — I understand conversational language! You can ask me anything about Megapods India and I'll do my best to help. 🤝`,
      quickActions: [
        { label: "Our Services", action: "services", icon: "⚡" },
        { label: "Get a Quote", action: "quotation", icon: "💰" },
        { label: "Contact Team", action: "contact", icon: "📞" },
        { label: "See Our Work", action: "gallery", icon: "🖼️" },
      ],
    };
  }

  // ── Fallback — Conversational and helpful ──
  const fallbacks = [
    `Hmm, I'm not 100% sure I understood that correctly! 😅 But I definitely want to help.\n\nI'm great at answering questions about:\n• Our container solutions (cafes, offices, toilets, custom builds)\n• Pricing and getting you a quote\n• How our process works\n• Contact info and scheduling\n\nCould you rephrase that, or pick one of the options below? Or if you'd prefer, you can talk directly to our team at **${INFO.phone1}** — they're super helpful! 💪`,
    `I appreciate you asking! While I might not have the perfect answer for that specific question, I can definitely help with:\n\n• Detailed info about our container solutions\n• Pricing estimates and quotations\n• Our construction process and timelines\n• Connecting you with our expert team\n\nTry asking something like "Tell me about container cafes" or "How much does it cost?" — or just pick an option below! 😊`,
    `That's an interesting question! I want to make sure I give you the right answer, so let me suggest a couple of options:\n\n1. I can tell you all about our **services and pricing**\n2. I can show you our **portfolio and designs**\n3. I can connect you with our **expert team** who can answer anything!\n\nWhat sounds good? 🤔`,
  ];

  return {
    text: pickRandom(fallbacks),
    quickActions: [
      { label: "Our Services", action: "services", icon: "⚡" },
      { label: "Get a Quote", action: "quotation", icon: "💰" },
      { label: "Contact Team", action: "contact", icon: "📞" },
      { label: "How We Work", action: "process", icon: "🔧" },
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════════════════════
   WELCOME SUGGESTIONS
   ═══════════════════════════════════════════════════════════════════════════════ */

const WELCOME_SUGGESTIONS = [
  { icon: <Coffee size={16} />, label: "Container Cafe options", prompt: "Tell me about container cafes" },
  { icon: <Building2 size={16} />, label: "Office space solutions", prompt: "I need a container office" },
  { icon: <MessageSquare size={16} />, label: "How does it work?", prompt: "How does your process work?" },
  { icon: <Phone size={16} />, label: "Get a price estimate", prompt: "How much does it cost?" },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   CHATBOT COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */

export default function ChatBot({ onNavigate }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Cleanup streaming on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // ── Stream text word-by-word (ChatGPT style) ──
  const streamBotMessage = useCallback(
    (fullText: string, quickActions?: QuickAction[]) => {
      const msgId = `bot-${Date.now()}`;
      const words = fullText.split(/(\s+)/); // split but keep whitespace
      let idx = 0;

      setIsTyping(true);

      // Small delay before streaming starts
      setTimeout(() => {
        setIsTyping(false);

        // Add empty message that will stream
        const newMsg: ChatMessage = {
          id: msgId,
          role: "bot",
          text: fullText,
          displayedText: "",
          timestamp: new Date(),
          quickActions,
          isStreaming: true,
        };
        setMessages((prev) => [...prev, newMsg]);

        // Stream words
        const interval = setInterval(() => {
          idx++;
          const displayed = words.slice(0, idx).join("");

          setMessages((prev) =>
            prev.map((m) =>
              m.id === msgId
                ? {
                    ...m,
                    displayedText: displayed,
                    isStreaming: idx < words.length,
                  }
                : m
            )
          );

          if (idx >= words.length) {
            clearInterval(interval);
            streamIntervalRef.current = null;
          }
        }, 18); // fast streaming, ~18ms per word chunk

        streamIntervalRef.current = interval;
      }, 600);
    },
    []
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setShowPulse(false);
  }, []);

  const processUserInput = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        text,
        displayedText: text,
        timestamp: new Date(),
        isStreaming: false,
      };
      setMessages((prev) => [...prev, userMsg]);

      const { text: responseText, quickActions } = detectAndRespond(text);
      streamBotMessage(responseText, quickActions);
    },
    [streamBotMessage]
  );

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isTyping) return;
    setInputValue("");
    processUserInput(text);
  }, [inputValue, isTyping, processUserInput]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      const navMap: Record<string, string> = {
        nav_contact: "contact",
        nav_quotation: "quotation",
        nav_gallery: "gallery",
        nav_about: "about",
        nav_solutions: "solutions",
      };

      if (navMap[action] && onNavigate) {
        onNavigate(navMap[action]);
        setIsOpen(false);
        return;
      }

      if (action === "open_whatsapp" || action === "whatsapp") {
        window.open(
          `https://wa.me/${INFO.whatsapp}?text=Hello!%20I%20would%20like%20to%20know%20more%20about%20your%20container%20solutions.`,
          "_blank"
        );
        return;
      }

      if (action === "call") {
        window.open(`tel:${INFO.phone1}`, "_self");
        return;
      }

      if (action === "restart") {
        setMessages([]);
        conversationTopics = [];
        return;
      }

      const actionToPrompt: Record<string, string> = {
        cafe_details: "Tell me about container cafes",
        office_details: "I want a container office",
        toilet_details: "Tell me about public toilet solutions",
        custom_details: "What custom solutions do you offer?",
        services: "What services do you provide?",
        quotation: "I want to know about pricing",
        gallery: "Show me your portfolio",
        contact: "How can I contact you?",
        process: "How does your process work?",
        about: "Tell me about Megapods India",
        why_choose: "Why should I choose Megapods?",
        help: "I need some help",
        sizes: "What sizes are available?",
      };

      if (actionToPrompt[action]) {
        processUserInput(actionToPrompt[action]);
      }
    },
    [onNavigate, processUserInput]
  );

  const handleCopy = (text: string, id: string) => {
    // Strip markdown-style bold markers for clean copy
    const clean = text.replace(/\*\*(.*?)\*\*/g, "$1");
    navigator.clipboard.writeText(clean);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (id: string, type: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, feedback: type } : m))
    );
  };

  // ── Render markdown-ish text ──
  const renderText = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\n/g, "<br/>");
    return html;
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      {/* ── FAB ── */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-[9998]">
          {showPulse && (
            <>
              <span className="chatbot-pulse-ring" />
              <span className="chatbot-pulse-ring chatbot-pulse-ring-2" />
            </>
          )}
          <button
            onClick={handleOpen}
            id="chatbot-open-btn"
            className="chatbot-fab group"
            aria-label="Open AI Chat"
          >
            <div className="chatbot-fab-inner">
              <Bot size={26} className="text-white" />
            </div>
            <span className="chatbot-fab-label">
              <Sparkles size={12} /> AI Assistant
            </span>
          </button>
        </div>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div className="fixed bottom-0 left-0 sm:bottom-6 sm:left-6 z-[9999] chatbot-enter">
          <div className="chatbot-window">
            {/* Header */}
            <div className="chatbot-header">
              <div className="flex items-center gap-3">
                <div className="chatbot-avatar">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-sm tracking-tight">
                    Megapods AI
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-orange-200 text-[10px] font-semibold tracking-wider uppercase">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setMessages([]);
                    conversationTopics = [];
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all text-orange-200 hover:text-white"
                  title="New conversation"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-all text-orange-200 hover:text-white"
                  title="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="chatbot-messages">
              {/* Welcome Screen (when no messages) */}
              {!hasMessages && (
                <div className="chatbot-welcome">
                  <div className="chatbot-welcome-icon">
                    <Sparkles size={28} className="text-orange-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-800 mb-1">
                    Hi there! 👋
                  </h4>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    I'm the Megapods AI assistant. Ask me anything about our
                    container solutions, pricing, or process!
                  </p>
                  <div className="chatbot-suggestions">
                    {WELCOME_SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => processUserInput(s.prompt)}
                        className="chatbot-suggestion-card"
                      >
                        <span className="chatbot-suggestion-icon">
                          {s.icon}
                        </span>
                        <span>{s.label}</span>
                        <ArrowRight
                          size={14}
                          className="ml-auto text-slate-300 group-hover:text-orange-500 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chatbot-msg ${
                    msg.role === "user"
                      ? "chatbot-msg-user"
                      : "chatbot-msg-bot"
                  }`}
                >
                  {msg.role === "bot" && (
                    <div className="chatbot-msg-avatar-bot">
                      <Bot size={14} className="text-orange-600" />
                    </div>
                  )}

                  <div className="chatbot-msg-content">
                    <div
                      className={`chatbot-msg-bubble ${
                        msg.role === "user"
                          ? "chatbot-bubble-user"
                          : "chatbot-bubble-bot"
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            renderText(
                              msg.role === "bot" && msg.isStreaming
                                ? msg.displayedText
                                : msg.text
                            ) +
                            (msg.isStreaming
                              ? '<span class="chatbot-stream-cursor"></span>'
                              : ""),
                        }}
                        className="chatbot-msg-text"
                      />

                      {/* Quick actions — only show when streaming is done */}
                      {msg.quickActions &&
                        !msg.isStreaming &&
                        msg.role === "bot" && (
                          <div className="chatbot-quick-actions">
                            {msg.quickActions.map((qa, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleQuickAction(qa.action)}
                                className="chatbot-quick-btn"
                              >
                                {qa.icon && (
                                  <span className="text-xs">{qa.icon}</span>
                                )}
                                <span>{qa.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Bot message actions — copy, feedback */}
                    {msg.role === "bot" && !msg.isStreaming && (
                      <div className="chatbot-msg-actions">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="chatbot-action-btn"
                          title="Copy"
                        >
                          {copiedId === msg.id ? (
                            <Check size={13} className="text-green-500" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, "up")}
                          className={`chatbot-action-btn ${
                            msg.feedback === "up"
                              ? "chatbot-action-active"
                              : ""
                          }`}
                          title="Helpful"
                        >
                          <ThumbsUp size={13} />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, "down")}
                          className={`chatbot-action-btn ${
                            msg.feedback === "down"
                              ? "chatbot-action-active"
                              : ""
                          }`}
                          title="Not helpful"
                        >
                          <ThumbsDown size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="chatbot-msg-avatar-user">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="chatbot-msg chatbot-msg-bot">
                  <div className="chatbot-msg-avatar-bot">
                    <Bot size={14} className="text-orange-600" />
                  </div>
                  <div className="chatbot-msg-content">
                    <div className="chatbot-bubble-bot chatbot-msg-bubble">
                      <div className="chatbot-typing-indicator">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chatbot-input-bar">
              <div className="chatbot-input-wrapper">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about Megapods..."
                  className="chatbot-input"
                  id="chatbot-input"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="chatbot-send-btn"
                  id="chatbot-send-btn"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="chatbot-powered-by">
                <Zap size={10} /> Megapods AI · Always here to help
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
