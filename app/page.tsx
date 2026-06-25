import Link from "next/link";
import {
  ArrowRight, Check, Flower2, Gem, MapPin, Menu,
  Scissors, Search, ShieldCheck, Sparkles, Star, TrendingUp, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/landing/faq-accordion";
import { MobileNav } from "@/components/landing/mobile-nav";
import { BeautyAssistant } from "@/components/ai-assistant/beauty-assistant";

/* ── static data ──────────────────────────────────────────── */
const FEATURED = [
  { id:"salon-01", name:"Jasmine & Jade Studio",   area:"Anna Nagar", rating:4.8, price:"₹₹₹",  match:94, tags:["Bridal Specialist","Unisex"],       from:"#7C3AED", to:"#C084FC", Icon:Flower2 },
  { id:"salon-04", name:"The Glow Room",            area:"Adyar",      rating:4.7, price:"₹₹",   match:91, tags:["Skin & Facials","Women Only"],      from:"#6D28D9", to:"#A78BFA", Icon:Sparkles },
  { id:"salon-07", name:"Clip & Co. Unisex",        area:"Velachery",  rating:4.6, price:"₹₹",   match:88, tags:["Walk-ins Welcome","Men's Grooming"],from:"#5B21B6", to:"#8B5CF6", Icon:Scissors },
  { id:"salon-09", name:"Silk Route Bridal Studio", area:"T Nagar",    rating:4.9, price:"₹₹₹₹", match:96, tags:["Bridal Specialist","By Appt"],      from:"#7C3AED", to:"#D8B4FE", Icon:Gem },
  { id:"salon-11", name:"Urban Snip Barber Co.",    area:"OMR",        rating:4.5, price:"₹",    match:85, tags:["Men's Grooming","Home Service"],    from:"#4C1D95", to:"#9061F9", Icon:Scissors },
  { id:"salon-05", name:"Salt & Strand Spa",        area:"Adyar",      rating:4.8, price:"₹₹₹",  match:90, tags:["Spa","Home Service"],              from:"#6D28D9", to:"#C4B5FD", Icon:Flower2 },
];

const TRENDING = [
  { name:"Glass Skin Facial",              cat:"Skin",   blurb:"Korean-inspired dewy finish — big this wedding season.",                    trend:"+38%" },
  { name:"Bridal Jadai with Fresh Jasmine",cat:"Bridal", blurb:"Traditional braid styling with fresh jasmine, a Chennai wedding staple.",   trend:"+52%" },
  { name:"Curtain Bangs for Curly Hair",   cat:"Hair",   blurb:"Face-framing layers cut specifically for curl patterns.",                   trend:"+29%" },
  { name:"Balayage for Indian Hair Tones", cat:"Hair",   blurb:"Sun-kissed colour technique adapted for darker hair.",                      trend:"+24%" },
  { name:"Festive Smoky Eye",              cat:"Makeup", blurb:"The Diwali and Pongal party-season favourite.",                             trend:"+41%" },
  { name:"Keratin Smoothening",            cat:"Hair",   blurb:"Frizz control built for Chennai humidity.",                                 trend:"+33%" },
];

const TESTIMONIALS = [
  { name:"Priya S.",  area:"Anna Nagar", role:"Bride-to-be",          quote:"I typed in my hair type and budget and the match score actually made sense — found my bridal salon in one evening instead of three weekends." },
  { name:"Arjun K.",  area:"OMR",        role:"Working professional",  quote:"Booked a home-service haircut between two meetings. The slot picker showed real availability, no back-and-forth on WhatsApp." },
  { name:"Meena R.",  area:"Velachery",  role:"College student",       quote:"The trending tab is how I found an affordable curtain-bangs place near campus. Didn't know that was even a service I wanted." },
];

const FAQS = [
  { q:"Is GlamConnect AI free to use as a customer?",    a:"Yes. Browsing salons, using the AI Beauty Assistant, and booking appointments is free for customers. We earn a small commission from salons on completed bookings." },
  { q:"How does the AI Match Score actually work?",      a:"It weighs your stated budget, distance, service preferences, and past bookings against a salon's pricing, ratings, and review themes — then shows you the score plus the specific reasons behind it, not just a number." },
  { q:"Can I book a home-service appointment?",          a:"Salons tagged 'Home Service' let you pick that option at checkout. You'll see a small convenience fee before you confirm, never after." },
  { q:"How are salons verified before they're listed?",  a:"Every salon submits business proof and photos for manual review, and our team spot-checks listings against customer-reported issues on a rolling basis." },
  { q:"Do you only operate in Chennai right now?",       a:"We're Chennai-first by design — it lets us actually verify every salon on the platform. Other Tamil Nadu cities are next on the roadmap." },
];

/* ── page (Server Component) ─────────────────────────────── */
export default function HomePage() {
  return (
    <main id="main-content">

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-line backdrop-blur-xl bg-ink/80">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold focus-ring">
            <span className="w-7 h-7 rounded-full match-ring flex items-center justify-center" aria-hidden="true">
              <span className="w-4 h-4 rounded-full bg-ink" />
            </span>
            GlamConnect <span className="text-violet-light">AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-paper/80" aria-label="Main navigation">
            <Link href="/discover"     className="hover:text-paper transition-colors focus-ring">Discover</Link>
            <Link href="/ai-assistant" className="hover:text-paper transition-colors focus-ring">AI Assistant</Link>
            <Link href="#trending"     className="hover:text-paper transition-colors focus-ring">Trending</Link>
            <Link href="/owner"        className="hover:text-paper transition-colors focus-ring">For Salons</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button asChild variant="ghost" size="sm"><Link href="/auth/sign-in">Log in</Link></Button>
            <Button asChild size="sm"><Link href="/auth/sign-in">Get started</Link></Button>
          </div>

          {/* Mobile hamburger */}
          <MobileNav />
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-ink">
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="aurora-blob bg-violet-600 w-[420px] h-[420px] -top-28 -left-24" />
          <div className="aurora-blob w-[360px] h-[360px] top-20 -right-28" style={{background:"#E8B65A"}} />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light">
              <Sparkles size={14} aria-hidden="true" /> AI Beauty Matching · Chennai
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.08] font-semibold mt-5 text-paper">
              Every salon in Chennai, sorted by{" "}
              <span className="gradient-text">how well it fits you.</span>
            </h1>
            <p className="text-paper/70 text-lg mt-5 max-w-xl">
              Tell GlamConnect AI about your hair, your face shape, and your budget. It reads
              the reviews that actually matter and matches you to a salon with a score — not a shrug.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Button asChild size="lg">
                <Link href="/discover">Find my match <ArrowRight size={16} aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/owner">I run a salon</Link>
              </Button>
            </div>
            <div className="flex items-center gap-6 mt-9 text-sm text-paper/55">
              <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-violet-light" aria-hidden="true" /> Verified salons only</span>
              <span className="flex items-center gap-1.5"><Star size={16} className="text-jasmine" aria-hidden="true" /> 4.7 avg. rating</span>
            </div>

            {/* Hero search bar */}
            <form action="/discover" method="GET" className="glass rounded-2xl mt-10 p-3 sm:p-4 flex flex-col sm:flex-row gap-3" role="search" aria-label="Quick salon search">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1">
                <MapPin size={18} className="text-paper/50 shrink-0" aria-hidden="true" />
                <label htmlFor="hero-area" className="sr-only">Area in Chennai</label>
                <input id="hero-area" name="area" placeholder="Area — Anna Nagar, Adyar, OMR…" className="bg-transparent outline-none text-sm w-full placeholder:text-paper/40 text-paper focus-ring" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 flex-1">
                <Search size={18} className="text-paper/50 shrink-0" aria-hidden="true" />
                <label htmlFor="hero-service" className="sr-only">Service type</label>
                <input id="hero-service" name="service" placeholder="Service — bridal makeup, haircut…" className="bg-transparent outline-none text-sm w-full placeholder:text-paper/40 text-paper focus-ring" />
              </div>
              <Button type="submit" className="shrink-0 w-full sm:w-auto">Search</Button>
            </form>
          </div>

          {/* Match card */}
          <div className="flex justify-center lg:justify-end" aria-hidden="true">
            <div className="glass rounded-3xl p-6 w-full max-w-sm float-y">
              <div className="flex items-center gap-4">
                <div className="relative w-[90px] h-[90px] shrink-0">
                  <div className="match-ring rounded-full w-full h-full" />
                  <div className="absolute inset-[6px] rounded-full bg-ink flex flex-col items-center justify-center">
                    <span className="font-display text-xl font-semibold">94%</span>
                    <span className="text-[10px] uppercase tracking-wider text-paper/60 mt-0.5">Match</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-paper/50">Best match for you</p>
                  <p className="font-display text-base font-semibold mt-1 text-paper">Jasmine &amp; Jade Studio</p>
                  <p className="text-sm text-paper/60">Anna Nagar · 0.8 km away</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-line space-y-2 text-sm text-paper/80">
                <p className="flex gap-2"><Check size={15} className="text-violet-light mt-0.5 shrink-0" />Specialises in curly &amp; oval-face styling</p>
                <p className="flex gap-2"><Check size={15} className="text-violet-light mt-0.5 shrink-0" />Within your ₹₹ budget range</p>
                <p className="flex gap-2"><Check size={15} className="text-violet-light mt-0.5 shrink-0" />4.8★ across 1,240 reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED SALONS ── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light"><Sparkles size={14} aria-hidden="true" /> Featured this week</span>
            <h2 className="font-display text-3xl font-semibold mt-3 text-paper">Salons matched to Chennai&apos;s regulars</h2>
          </div>
          <Link href="/discover" className="text-sm font-semibold text-violet-light flex items-center gap-1 focus-ring">
            Browse all salons <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map(({ id, name, area, rating, price, match, tags, from, to, Icon }) => (
            <Link key={id} href={`/salon/${id}`} className="glass rounded-2xl overflow-hidden card-hover block focus-ring" aria-label={`${name} — ${area}, ${price}, rated ${rating} stars, ${match}% match`}>
              <div className="h-32 flex items-center justify-center relative" style={{background:`linear-gradient(135deg,${from},${to})`}} aria-hidden="true">
                <Icon size={36} className="text-white/90" />
                <span className="absolute top-3 right-3 text-xs font-bold bg-ink/70 backdrop-blur px-2.5 py-1 rounded-full text-paper">{match}% Match</span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-paper">{name}</h3>
                  <span className="flex items-center gap-1 text-sm text-jasmine font-semibold shrink-0 ml-2" aria-hidden="true"><Star size={14} fill="currentColor" />{rating}</span>
                </div>
                <p className="text-sm text-paper/55 mt-1">{area} · {price}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/70">{t}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI ASSISTANT DEMO ── */}
      <section id="ai-assistant" className="bg-ink-soft border-y border-line py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light"><Sparkles size={14} aria-hidden="true" /> Try it live</span>
            <h2 className="font-display text-3xl font-semibold mt-4 text-paper">Tell our AI about your hair. Get matched in seconds.</h2>
            <p className="text-paper/65 mt-3">This calls a real AI model live — the same matching logic that powers the full beauty assistant.</p>
          </div>
          <BeautyAssistant />
        </div>
      </section>

      {/* ── TRENDING ── */}
      <section id="trending" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light"><Sparkles size={14} aria-hidden="true" /> AI trend discovery</span>
          <h2 className="font-display text-3xl font-semibold mt-3 text-paper">What Chennai is booking right now</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TRENDING.map(t => (
            <div key={t.name} className="glass rounded-2xl p-5 card-hover">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-line text-paper/65">{t.cat}</span>
                <span className="text-xs font-bold text-violet-light flex items-center gap-1"><TrendingUp size={13} aria-hidden="true" />{t.trend}</span>
              </div>
              <h3 className="font-display font-semibold text-base text-paper">{t.name}</h3>
              <p className="text-sm text-paper/60 mt-2">{t.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light"><Sparkles size={14} aria-hidden="true" /> From the community</span>
          <h2 className="font-display text-3xl font-semibold mt-3 text-paper">People who stopped guessing</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <figure key={t.name} className="glass rounded-2xl p-6 flex flex-col">
              <div className="flex gap-1 text-jasmine mb-4" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="currentColor" aria-hidden="true" />)}
              </div>
              <blockquote className="text-sm text-paper/80 flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-5 pt-4 border-t border-line">
                <p className="text-sm font-semibold text-paper">{t.name}</p>
                <p className="text-xs text-paper/50">{t.role} · {t.area}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── SALON OWNER CTA ── */}
      <section id="for-salons" className="max-w-6xl mx-auto px-5 sm:px-8 py-20">
        <div className="rounded-3xl overflow-hidden" style={{background:"linear-gradient(120deg,#4C1D95,#6E3AD6 55%,#2A1454)"}}>
          <div className="grid lg:grid-cols-2 gap-10 p-8 sm:p-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-pale"><Sparkles size={14} aria-hidden="true" /> For salon owners</span>
              <h2 className="font-display text-3xl font-semibold mt-4 text-white">Your chairs, fully booked. Your marketing, on autopilot.</h2>
              <p className="text-white/75 mt-4 max-w-md">A booking dashboard, revenue tracking, and an AI marketing assistant that writes your Instagram captions and festival promos — built for independent and bridal studios across Chennai.</p>
              <div className="flex flex-wrap gap-3 mt-7">
                <Button asChild className="bg-white text-ink hover:bg-white/90"><Link href="/owner">Open salon dashboard</Link></Button>
              </div>
            </div>
            <div className="glass rounded-2xl p-6 border border-white/20">
              <div className="flex gap-1 text-jasmine mb-3" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_,i) => <Star key={i} size={14} fill="currentColor" aria-hidden="true" />)}
              </div>
              <p className="text-sm text-white/90">&ldquo;The AI marketing tool alone saves me a weekend a month — it drafts our festival offers and I just tweak the discount.&rdquo;</p>
              <div className="mt-5 pt-4 border-t border-white/20">
                <p className="text-sm font-semibold text-white">Lakshmi N.</p>
                <p className="text-xs text-white/60">Owner, The Glow Room — Adyar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-5 sm:px-8 py-20">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.18em] uppercase text-violet-light"><Sparkles size={14} aria-hidden="true" /> Good to know</span>
          <h2 className="font-display text-3xl font-semibold mt-3 text-paper">Frequently asked questions</h2>
        </div>
        <FAQAccordion faqs={FAQS} />
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-line" aria-label="Site footer">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="font-display text-lg font-semibold text-paper flex items-center gap-2">
              <span className="w-6 h-6 rounded-full match-ring flex items-center justify-center" aria-hidden="true"><span className="w-3.5 h-3.5 rounded-full bg-ink" /></span>
              GlamConnect AI
            </p>
            <p className="text-sm text-paper/55 mt-3">Chennai&apos;s AI-matched beauty marketplace — for people who&apos;d rather know than guess.</p>
          </div>
          {[
            { h:"Discover",   items:[["Browse salons","/discover"],["AI Assistant","/ai-assistant"],["Trending","#trending"]] },
            { h:"For salons", items:[["Salon dashboard","/owner"],["List your salon","/owner"]] },
            { h:"Company",    items:[["About","#"],["Contact","#"]] },
          ].map(col => (
            <nav key={col.h} aria-label={col.h}>
              <p className="text-sm font-semibold text-paper/85 mb-3">{col.h}</p>
              <ul className="space-y-2">
                {col.items.map(([label, href]) => (
                  <li key={label}><Link href={href} className="text-sm text-paper/55 hover:text-paper/85 focus-ring">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="text-xs text-paper/35 text-center pb-10">© 2026 GlamConnect AI · Chennai, India</p>
      </footer>
    </main>
  );
}
