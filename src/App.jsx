import { useState, useEffect, useRef } from "react";

/* ───────────── ROUTE CONTEXT ───────────── */
const routes = {
  "/": "home",
  "/about": "about",
  "/solutions/ecommerce": "ecommerce",
  "/solutions/brand-social": "brand-social",
  "/solutions/measurement": "measurement",
  "/resources": "resources",
  "/brand-terms": "brand-terms",
  "/data-processing-addendum": "dpa",
  "/privacy": "privacy",
};

function useRoute() {
  const getPath = () => (window.location.hash.slice(1) || "/").split("#")[0];
  const [path, setPath] = useState(getPath());
  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return path;
}

function Link({ to, children, className, onClick }) {
  const basePath = to.split("#")[0];
  const anchor = to.includes("#") ? to.split("#")[1] : null;
  return (
    <a
      href={`#${basePath}`}
      className={className}
      onClick={(e) => {
        if (!anchor) {
          window.scrollTo(0, 0);
        }
        onClick?.();
        if (anchor) {
          setTimeout(() => {
            const el = document.getElementById(anchor);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 200);
        }
      }}
    >
      {children}
    </a>
  );
}

function goToSection(sectionId) {
  window.location.hash = "/resources";
  var tryScroll = function(attempts) {
    var el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else if (attempts < 10) {
      setTimeout(function() { tryScroll(attempts + 1); }, 200);
    }
  };
  setTimeout(function() { tryScroll(0); }, 100);
}

/* ───────────── CONTENT IMPORTS ───────────── */
import homepageContent from "./content/homepage.json";
import aboutContent from "./content/about.json";
import ecommerceContent from "./content/solutions-ecommerce.json";
import brandSocialContent from "./content/solutions-brand-social.json";
import measurementContent from "./content/solutions-measurement.json";
import faqContent from "./content/faq.json";

/* ───────────── SCROLL ANIMATION HOOK ───────────── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ───────────── CALCULATOR LIGHTBOX ───────────── */
function CalculatorLightbox({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    skus: '', visitors: '', cr: '', aov: '', coverage: '', placement: '',
    email: '', website: ''
  });
  const [results, setResults] = useState({ revenue: 0, lift: 0, rocs: 0 });
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTLGqhWFEMmLIy4bNlyRVWwkbl4gfYrMbZ8v9bmR7soK93bYQSPzORh2G9iZE9oZ8wIA/exec';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setStep(1);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const update = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const calculate = () => {
    const visitors = parseFloat(form.visitors) || 0;
    const baselineCR = (parseFloat(form.cr) || 0) / 100;
    const aov = parseFloat(form.aov) || 0;
    const playbackRate = parseFloat(form.placement) || 0;
    const existingCoverage = (parseFloat(form.coverage) || 0) / 100;
    const liftMultiplier = 1.563;
    const videoCR = baselineCR * liftMultiplier;
    const watchers = visitors * playbackRate;
    const nonWatchers = visitors * (1 - playbackRate);
    const baselineSales = visitors * baselineCR * aov;
    const salesWithVideo = watchers * videoCR * aov;
    const salesWithout = nonWatchers * baselineCR * aov;
    const salesWithUGC = salesWithVideo + salesWithout;
    const incrementalRevenue = (salesWithUGC - baselineSales) * (1 - existingCoverage);
    const commissionRate = 0.05;
    const totalCommissions = salesWithVideo * commissionRate;
    const rocs = totalCommissions > 0 ? incrementalRevenue / totalCommissions : 0;
    const liftPct = baselineSales > 0 ? (incrementalRevenue / baselineSales) * 100 : 0;
    setResults({ revenue: incrementalRevenue, lift: liftPct, rocs });
  };

  const submitToSheets = () => {
    const placementEl = { '0.24234': 'Mostly Above The Fold', '0.19442': 'Both Above & Below The Fold', '0.13622': 'Mostly Below The Fold' };
    const calcData = {
      email: form.email, website: form.website, skus: form.skus,
      visitors: form.visitors, baselineCR: form.cr, aov: form.aov,
      existingCoverage: form.coverage || '0',
      placement: placementEl[form.placement] || '',
      incrementalRevenue: formatCurrency(results.revenue)
    };
    fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(calcData) }).catch(() => {});
  };

  const goToStep = (target) => {
    if (target === 2 && step === 1) {
      if (!form.skus || !form.visitors || !form.cr || !form.aov || !form.placement) return;
    }
    if (target === 3 && step === 2) {
      if (!form.email || !form.website) return;
      const emailDomain = form.email.toLowerCase().split('@')[1];
      if (!emailDomain || !form.website.toLowerCase().includes(emailDomain.split('.')[0])) {
        alert("Please provide a valid company email that matches your website domain.");
        return;
      }
      calculate();
      submitToSheets();
    }
    setStep(target);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const exportCSV = () => {
    const csv = [
      'Onsite Commission Opportunity Report', '',
      'Company Email,' + form.email, 'Company Website,' + form.website, '',
      'Input Parameters',
      'Product SKUs,' + form.skus, 'Monthly Unique Visitors,' + form.visitors,
      'Conversion Rate (%),' + form.cr, 'Average Order Value ($),' + form.aov,
      'Existing UGC Coverage (%),' + (form.coverage || '0'), '',
      'Results',
      'Estimated Monthly Incremental Revenue,' + formatCurrency(results.revenue),
      'Incremental Sales Lift,+' + results.lift.toFixed(1) + '%',
      'Return on Commission Spend (ROCS),' + results.rocs.toFixed(1) + 'x',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'onsite-commission-report.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const stepDot = (num) => {
    let cls = 'calc-step-dot';
    if (num < step) cls += ' done';
    else if (num === step) cls += ' active';
    return <div className={cls}>{num < step ? '✓' : num}</div>;
  };

  return (
    <div className="calc-overlay" onClick={(e) => { if (e.target.className === 'calc-overlay') onClose(); }}>
      <div className="calc-lightbox">
        <button className="calc-close" onClick={onClose}>✕</button>

        <div className="calc-header">
          <h2>Calculate Your <span className="gradient-text">Sales Lift</span></h2>
          <p>See how much incremental revenue an Onsite Commission program can deliver for your business.</p>
        </div>

        <div className="calc-steps-bar">
          {stepDot(1)}
          <div className={`calc-step-line ${step > 1 ? 'active' : ''}`} />
          {stepDot(2)}
          <div className={`calc-step-line ${step > 2 ? 'active' : ''}`} />
          {stepDot(3)}
        </div>
        <div className="calc-step-labels">
          <span className={step === 1 ? 'active' : ''}>Customize</span>
          <span className={step === 2 ? 'active' : ''}>Your Info</span>
          <span className={step === 3 ? 'active' : ''}>Results</span>
        </div>

        <div className="calc-body">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="calc-panel">
              <div className="calc-field-row">
                <div className="calc-field">
                  <label>Product SKUs</label>
                  <input type="number" placeholder="e.g. 4,000" value={form.skus} onChange={e => update('skus', e.target.value)} />
                </div>
                <div className="calc-field">
                  <label>Monthly Unique Visitors</label>
                  <input type="number" placeholder="e.g. 1,000,000" value={form.visitors} onChange={e => update('visitors', e.target.value)} />
                </div>
              </div>
              <div className="calc-field-row">
                <div className="calc-field">
                  <label>Conversion Rate (%)</label>
                  <input type="number" placeholder="e.g. 1.6" step="0.1" value={form.cr} onChange={e => update('cr', e.target.value)} />
                </div>
                <div className="calc-field">
                  <label>Average Order Value ($)</label>
                  <input type="number" placeholder="e.g. 141" value={form.aov} onChange={e => update('aov', e.target.value)} />
                </div>
              </div>
              <div className="calc-field-row">
                <div className="calc-field">
                  <label>Existing UGC Coverage (%)</label>
                  <input type="number" placeholder="e.g. 25" value={form.coverage} onChange={e => update('coverage', e.target.value)} />
                </div>
                <div className="calc-field">
                  <label>UGC Placement</label>
                  <select value={form.placement} onChange={e => update('placement', e.target.value)}>
                    <option value="" disabled>Select...</option>
                    <option value="0.24234">Mostly Above the Fold</option>
                    <option value="0.19442">Both Above &amp; Below</option>
                    <option value="0.13622">Mostly Below the Fold</option>
                  </select>
                </div>
              </div>
              <div className="calc-nav">
                <button className="calc-btn-next" onClick={() => goToStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="calc-panel">
              <div className="calc-field">
                <label>Company Email Address</label>
                <input type="email" placeholder="you@company.com" value={form.email} onChange={e => update('email', e.target.value)} />
              </div>
              <div className="calc-field">
                <label>Company Website</label>
                <input type="text" placeholder="www.yourcompany.com" value={form.website} onChange={e => update('website', e.target.value)} />
              </div>
              <div className="calc-nav">
                <button className="calc-btn-back" onClick={() => goToStep(1)}>← Back</button>
                <button className="calc-btn-next" onClick={() => goToStep(3)}>Calculate My Sales Lift →</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="calc-panel">
              <div className="calc-results-card">
                <div className="calc-result-label">Estimated Monthly Incremental Revenue</div>
                <div className="calc-result-value">{formatCurrency(results.revenue)}</div>
              </div>
              <div className="calc-stats-row">
                <div className="calc-stat-box">
                  <div className="calc-stat-num">+{results.lift.toFixed(1)}%</div>
                  <div className="calc-stat-label">Incremental Sales Lift</div>
                </div>
                <div className="calc-stat-box">
                  <div className="calc-stat-num">{results.rocs.toFixed(1)}x</div>
                  <div className="calc-stat-label">Return on Commission Spend at 5%</div>
                </div>
              </div>
              <div className="calc-export-row">
                <button className="calc-btn-export" onClick={exportCSV}>↓ Export CSV</button>
                <button className="calc-btn-export" onClick={exportCSV}>⊞ Export to Sheets</button>
              </div>
             <button className="calc-btn-cta" onClick={() => { window.location.href = 'mailto:info@onsiteaffiliate.com?subject=Onsite Commission Inquiry'; }}>
                Begin Your Onsite Commission Journey →
              </button>
              <p className="calc-fine-print">Your data is never shared. Estimates based on industry benchmarks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────── NAVBAR ───────────── */
function Navbar({ onCalcOpen }) {
  const [open, setOpen] = useState(false);
  const [solOpen, setSolOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const path = useRoute();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" onClick={() => setOpen(false)}>
          <img src="/images/logo-icon-white.png" alt="" className="nav-logo-icon" />
          <span className="nav-logo-text">ONSITE<br/>AFFILIATE</span>
        </Link>

        <button className="hamburger" onClick={() => { setOpen(!open); setSolOpen(false); setResOpen(false); }} aria-label="Menu">
          <span className={open ? "bar open" : "bar"} />
          <span className={open ? "bar open" : "bar"} />
          <span className={open ? "bar open" : "bar"} />
        </button>

        <div className={`mobile-overlay ${open ? "active" : ""}`} onClick={() => setOpen(false)} />

        <div className={`nav-links ${open ? "mobile-open" : ""}`}>
          <div
            className="nav-dropdown"
            onMouseEnter={() => { if (window.innerWidth > 768) setSolOpen(true); }}
            onMouseLeave={() => { if (window.innerWidth > 768) setSolOpen(false); }}
          >
            <button className="nav-link dropdown-trigger" onClick={() => { setSolOpen(!solOpen); setResOpen(false); }}>
              Solutions <span className="caret">▾</span>
            </button>
            {solOpen && (
              <div className="dropdown-menu">
                <Link to="/solutions/ecommerce" onClick={() => { setOpen(false); setSolOpen(false); }}>
                  E-Commerce
                </Link>
                <Link to="/solutions/brand-social" onClick={() => { setOpen(false); setSolOpen(false); }}>
                  Brand &amp; Social
                </Link>
                <Link to="/solutions/measurement" onClick={() => { setOpen(false); setSolOpen(false); }}>
                  Measurement
                </Link>
              </div>
            )}
          </div>

          <Link to="/about" className="nav-link" onClick={() => setOpen(false)}>
            About
          </Link>

          <div
            className="nav-dropdown"
            onMouseEnter={() => { if (window.innerWidth > 768) setResOpen(true); }}
            onMouseLeave={() => { if (window.innerWidth > 768) setResOpen(false); }}
          >
            <button className="nav-link dropdown-trigger" onClick={() => { setResOpen(!resOpen); setSolOpen(false); }}>
              Resources <span className="caret">▾</span>
            </button>
            {resOpen && (
              <div className="dropdown-menu">
                <button onClick={() => { setOpen(false); setResOpen(false); goToSection("blog"); }}>
                  Blog
                </button>
                <button onClick={() => { setOpen(false); setResOpen(false); goToSection("case-studies"); }}>
                  Case Studies
                </button>
                <button onClick={() => { setOpen(false); setResOpen(false); goToSection("faq"); }}>
                  FAQ
                </button>
              </div>
            )}
          </div>

          <a href="https://app.onsiteaffiliate.com/auth" className="nav-link" target="_blank" rel="noopener noreferrer">
            Login
          </a>

          <button className="nav-cta" onClick={() => { setOpen(false); onCalcOpen(); }}>
            Calculate My Sales Lift
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ───────────── FOOTER ───────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo-wrap">
            <img src="/images/logo-icon-white.png" alt="" className="footer-logo-icon" />
            <span className="footer-logo-text">ONSITE<br/>AFFILIATE</span>
          </div>
          <p className="footer-tagline">
            The missing link for onsite creator commissions.
          </p>
        </div>
        <div className="footer-cols">
          <div>
            <h4>Solutions</h4>
            <Link to="/solutions/ecommerce">E-Commerce</Link>
            <Link to="/solutions/brand-social">Brand &amp; Social</Link>
            <Link to="/solutions/measurement">Measurement</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/resources">Blog</Link>
            <Link to="/resources">Case Studies</Link>
            <Link to="/resources">FAQ</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link to="/brand-terms">Brand Terms</Link>
            <Link to="/data-processing-addendum">Data Processing Addendum</Link>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
          <div>
            <h4>Connect</h4>
            <a href="mailto:info@onsiteaffiliate.com" onClick={(e) => { e.preventDefault(); window.location.href = 'mailto:info@onsiteaffiliate.com'; }}>info@onsiteaffiliate.com</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Onsite Affiliate. All rights reserved.</p>
      </div>
    </footer>
  );
}

/* ───────────── PILL CARD (gradient pill style from designs) ───────────── */
function PillCard({ title, description, delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <div className="pill-card">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Reveal>
  );
}

/* ───────────── HOME PAGE ───────────── */
function HomePage() {
  const c = homepageContent;
  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <Reveal>
            <h1>
              {c.heroHeadline}{" "}
              <span className="gradient-text">{c.heroHighlight}</span>{" "}
              {c.heroHeadlineEnd}
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <button className="btn-primary" onClick={() => window.__openCalc()}>
              Calculate My Sales Lift
            </button>
          </Reveal>
        </div>
      </section>

      {/* MISSING LINK */}
      <section className="section-dark">
        <div className="container two-col">
          <Reveal>
            <div>
              <h2>
                {c.missingLinkHeadline}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="flywheel-wrap">
              <img src="/images/flywheel.png" alt="Onsite Affiliate Flywheel" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-black">
        <div className="container">
          <Reveal>
            <h2 className="section-title">
              How <span className="gradient-text">Onsite Commissions</span> Work
            </h2>
          </Reveal>
          <div className="steps-grid">
            {c.steps.map((item, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="step-row">
                  <div className="step-badge">{item.step}</div>
                  <p>
                    <strong>{item.bold}</strong> {item.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={600}>
            <p className="centered-statement">
              {c.bottomStatement1}
              <br />
              {c.bottomStatement2}
            </p>
          </Reveal>
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section className="section-dark">
        <div className="container two-col reverse">
          <Reveal>
            <div className="matrix-wrap">
              <img src="/images/capes-matrix.png" alt="Capabilities comparison matrix" />
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div>
              <h2>{c.comparisonHeadline}</h2>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

/* ───────────── ABOUT PAGE ───────────── */
function AboutPage() {
  const c = aboutContent;
  const lastMember = c.team[c.team.length - 1];
  const regularMembers = c.team.slice(0, -1);
  return (
    <main>
      <section className="page-hero">
        <div className="hero-glow" />
        <div className="container">
          <Reveal>
            <h1>
              Our <span className="gradient-text">Mission</span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="hero-subtitle">{c.missionSubtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className="section-dark">
        <div className="container two-col">
          <Reveal>
            <div>
              <h3 className="accent-label">Who We Are</h3>
              <p>{c.whoWeAre1}</p>
              <p>{c.whoWeAre2}</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="graphic-wrap">
              <img src="/images/our-mission.png" alt="Our Mission graphic" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-black">
        <div className="container">
          <Reveal>
            <h2>
              Meet the <span className="gradient-text">Team</span>
            </h2>
          </Reveal>

          <div className="team-grid">
            {regularMembers.map((member, i) => (
              <Reveal key={i} delay={(i + 1) * 150} className="team-grid-item">
                <div className="team-card">
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <p>{member.bio}</p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={(regularMembers.length + 1) * 150} className="team-grid-item">
              <div className="team-card services-card">
                <img src="/images/meet-team.png" alt="Services Team" className="services-img" />
                <h3>{lastMember.name}</h3>
                <p>{lastMember.bio}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────────── SOLUTIONS PAGES ───────────── */
function SolutionPage({ title, subtitle, image, pills }) {
  return (
    <main>
      <section className="page-hero">
        <div className="hero-glow" />
        <div className="container">
          <Reveal>
            <h1>{title}</h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="hero-subtitle">{subtitle}</p>
          </Reveal>
        </div>
      </section>

      <section className="section-dark">
        <div className="container two-col">
          <div className="pills-col">
            {pills.map((p, i) => (
              <PillCard key={i} title={p.title} description={p.desc} delay={i * 150} />
            ))}
          </div>
          <Reveal delay={200}>
            <div className="graphic-wrap solution-graphic">
              <img src={image} alt={title} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-black cta-section">
        <div className="container centered">
          <Reveal>
            <h2>Ready to get started?</h2>
            <button className="btn-primary" onClick={() => window.__openCalc()}>
              Calculate My Sales Lift
            </button>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

function EcommercePage() {
  const c = ecommerceContent;
  return (
    <SolutionPage
      title={c.headline}
      subtitle={c.subtitle}
      image="/images/solutions-ecommerce.png"
      pills={c.pills}
    />
  );
}

function BrandSocialPage() {
  const c = brandSocialContent;
  return (
    <SolutionPage
      title={c.headline}
      subtitle={c.subtitle}
      image="/images/solutions-brand-social.png"
      pills={c.pills}
    />
  );
}

function MeasurementPage() {
  const c = measurementContent;
  return (
    <SolutionPage
      title={c.headline}
      subtitle={c.subtitle}
      image="/images/solutions-measurement.png"
      pills={c.pills}
    />
  );
}

/* ───────────── BLOG MODAL ───────────── */
function BlogModal({ blog, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
        <button className="blog-modal-close" onClick={onClose}>✕</button>
        <div className="blog-modal-header">
          <span className="blog-date">{blog.date}</span>
          <h2>{blog.title}</h2>
          <p className="blog-modal-sub">{blog.sub}</p>
        </div>
        <div className="blog-modal-body">
          {blog.content}
        </div>
      </div>
    </div>
  );
}

/* ───────────── RESOURCES PAGE ───────────── */
function ResourcesPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeBlog, setActiveBlog] = useState(null);
  const faqs = faqContent.faqs;

  const blogs = [
    {
      title: "Why UGC Below the Fold is Your Secret Conversion Weapon",
      sub: "Closing \"The Scroll Gap\"",
      date: "Feb 3, 2026",
      content: (
        <>
          <p>Most brands obsess over above-the-fold content — hero images, product titles, and star ratings. But the real conversion battle happens below the fold, where high-intent shoppers are actively scrolling to validate their purchase decision.</p>
          <p>We call this "The Scroll Gap" — the distance between initial interest and the Add to Cart button. Shoppers who scroll past the first viewport are signaling strong purchase intent. They're looking for reasons to buy, not reasons to leave.</p>
          <h3>Why Below-the-Fold UGC Converts</h3>
          <p>When a shopper scrolls down a product page, they've already passed the basic qualification stage. They know what the product is and roughly what it costs. What they need now is validation — and that's exactly what authentic creator videos provide.</p>
          <p>Creator UGC placed in the scroll path acts as a conversion accelerator. It provides the social proof, real-world context, and objection handling that branded content simply can't match. Our data shows that shoppers who interact with creator video content below the fold convert at significantly higher rates than those who don't.</p>
          <h3>The Opportunity</h3>
          <p>The below-the-fold zone is prime real estate that most brands are underutilizing. By placing authentic creator content where high-intent shoppers are already looking, you can close the scroll gap and turn browsers into buyers — without changing a single thing about your above-the-fold experience.</p>
        </>
      ),
    },
    {
      title: "The Economics of Onsite Commissions",
      sub: "The \"Found Money\" in Onsite Commissions",
      date: "Jan 26, 2026",
      content: (
        <>
          <p>When most brands hear "commission," they think of another line item eating into their margins. But Onsite Commissions flip that equation entirely. Instead of paying upfront for content that may or may not perform, you're paying a small percentage only after a verified sale occurs.</p>
          <h3>The "Found Money" Model</h3>
          <p>Think about the creator content you've already paid for — campaign videos, influencer partnerships, UGC from gifted product. Most of that content lives on social media for a few days, gets some engagement, and then disappears into the algorithmic void.</p>
          <p>With Onsite Commissions, that same content gets a second life on your product pages, working 24/7 to convert high-intent shoppers. The commission you pay is a fraction of the incremental revenue that content generates. It's not a cost — it's found money.</p>
          <h3>Why the Math Works</h3>
          <p>Onsite Commission rates are typically 1–5% of the sale price — significantly lower than traditional affiliate commissions or the cost of producing new branded content. When you factor in the conversion lift that authentic creator content provides, the ROI is compelling. You're paying pennies on the dollar for content that's actively driving sales.</p>
        </>
      ),
    },
    {
      title: "Stop Sending Free Product: Why Onsite Commissions Are the Secret to Scaling Creator UGC",
      sub: "Creators Want a Piece of the Pie",
      date: "Jan 24, 2026",
      content: (
        <>
          <p>The traditional UGC playbook is broken. Brands send free product to creators, hope for authentic content in return, and cross their fingers that it performs. It's expensive, unpredictable, and doesn't scale.</p>
          <h3>Creators Want a Piece of the Pie</h3>
          <p>Today's creators understand the value of their content. They know that a well-made product video on a high-traffic PDP can drive thousands of dollars in sales. Sending them a $50 product and hoping for the best isn't just inefficient — it's disrespectful of their contribution.</p>
          <p>Onsite Commissions align incentives perfectly. Creators earn ongoing passive income every time their content drives a sale. The better their content performs, the more they earn. This creates a virtuous cycle where creators are motivated to produce their best work.</p>
          <h3>Scale Without the Overhead</h3>
          <p>When you shift from gifting to commissioning, you eliminate the overhead of managing product shipments, tracking deliverables, and chasing content deadlines. Creators produce content because they want to earn — and you only pay when that content actually converts.</p>
        </>
      ),
    },
    {
      title: "The Secrets to Making Onsite Commissions Work",
      sub: "The UGC Game Changer",
      date: "Jan 19, 2026",
      content: (
        <>
          <p>Onsite Commissions have the potential to transform how brands think about creator content. But like any powerful tool, the results depend on execution. Here are the key principles that separate successful programs from underperforming ones.</p>
          <h3>The UGC Game Changer</h3>
          <p>The most successful Onsite Commission programs share a few common traits: they prioritize authentic content over polished production, they give creators creative freedom, and they use data to optimize placement and attribution.</p>
          <h3>Key Principles</h3>
          <p>First, start with your existing creator relationships. You likely already have creators who love your products — they're your best candidates for an onsite commission program. Second, set clear attribution windows and commission rates that are fair to creators while protecting your margins. Third, use A/B testing to optimize where and how creator content appears on your PDPs.</p>
          <p>The brands seeing the best results treat their Onsite Commission program as a core part of their conversion strategy, not an afterthought. When you give it the attention it deserves, the results speak for themselves.</p>
        </>
      ),
    },
    {
      title: "30 Years, Hundreds of Partners: What I've Learned About Exceptional Service",
      sub: "The Human Element in a Tech-Driven World",
      date: "Jan 19, 2026",
      content: (
        <>
          <p>In three decades of working across affiliate marketing, AdTech, and creator commerce, I've worked with hundreds of brands, platforms, and partners. The technology has changed dramatically, but the principles of exceptional service have remained remarkably consistent.</p>
          <h3>The Human Element in a Tech-Driven World</h3>
          <p>In an industry increasingly driven by algorithms and automation, the human element is more important than ever. The best partnerships aren't built on technology alone — they're built on trust, communication, and a genuine commitment to the partner's success.</p>
          <p>Every successful engagement I've been part of shared one thing in common: the service provider treated the client's business as their own. That means proactive communication, honest assessments (even when the news isn't great), and a relentless focus on outcomes over activity.</p>
          <h3>What Exceptional Looks Like</h3>
          <p>Exceptional service means being available when you're needed, not just when it's convenient. It means understanding the client's business deeply enough to anticipate problems before they arise. And it means measuring success by the client's results, not your own billable hours.</p>
        </>
      ),
    },
    {
      title: "Why Affiliate Platforms Fail for Onsite Commissions",
      sub: "Misalignment of Intent",
      date: "Jan 13, 2026",
      content: (
        <>
          <p>If you've tried to run an Onsite Commission program through a traditional affiliate platform, you've probably been frustrated by the results. That's not because the concept doesn't work — it's because affiliate platforms were never designed for this use case.</p>
          <h3>Misalignment of Intent</h3>
          <p>Traditional affiliate platforms are built around one core mechanic: the referral link. A creator posts a link on their blog, social media, or website. A follower clicks that link and lands on your site. If they buy, the creator earns a commission.</p>
          <p>Onsite Commissions work completely differently. The creator's content is already on your site. There's no referral link, no external traffic source, no click to track. The value comes from the content's ability to convert shoppers who are already browsing your products.</p>
          <h3>The Technical Gap</h3>
          <p>Most affiliate platforms explicitly exclude "internal" traffic from commission eligibility. Their tracking is designed to credit external referrals, not onsite content engagement. Trying to force-fit onsite commissions into this model leads to inaccurate attribution, missed commissions, and frustrated creators.</p>
          <p>What you need is a purpose-built solution that tracks content engagement, video playback, and purchase attribution in a single integrated system — exactly what Onsite Affiliate provides.</p>
        </>
      ),
    },
  ];

  return (
    <main>
      {/* BLOG */}
      <section className="page-hero" id="blog">
        <div className="hero-glow" />
        <div className="container">
          <Reveal>
            <h1>
              <span className="gradient-text">Insights</span> &amp; Resources
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="section-dark">
        <div className="container">
          <div className="blog-grid">
            {blogs.map((b, i) => (
              <Reveal key={i} delay={i * 100} className="blog-grid-item">
                <div className="blog-card" onClick={() => setActiveBlog(b)} role="button" tabIndex={0}>
                  <span className="blog-date">{b.date}</span>
                  <h3>{b.title}</h3>
                  <p className="blog-sub">{b.sub}</p>
                  <span className="blog-link">Read More →</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {activeBlog && <BlogModal blog={activeBlog} onClose={() => setActiveBlog(null)} />}

      {/* CASE STUDIES */}
      <section className="section-black" id="case-studies">
        <div className="container">
          <Reveal>
            <h2>
              <span className="gradient-text">Case</span> Studies
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="case-study-card">
              <div className="case-study-header">
                <span className="case-study-tag">Case Study</span>
                <h3>Scaling Conversion with Amazon Onsite Commissions</h3>
                <p className="case-study-summary">
                  How Amazon's Onsite Commission Program transformed the traditional product detail page into a dynamic, video-first shopping experience — boosting conversion rates for high-intent "scrollers" through authentic creator content at scale.
                </p>
              </div>

              <div className="case-study-stats">
                <div className="stat-item">
                  <span className="stat-number">10–20%</span>
                  <span className="stat-label">Conversion lift on listings with creator videos</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">$2K–$15K+</span>
                  <span className="stat-label">Monthly earnings for top-tier creators from onsite commissions alone</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">1–5%</span>
                  <span className="stat-label">Onsite commission rate, offset by massive pre-existing traffic</span>
                </div>
              </div>

              <div className="case-study-body">
                <h4>The Challenge: The "PDP Scroller" Gap</h4>
                <p>
                  Amazon identified a specific friction point: the high-intent customer who lands on a product page but hesitates because they lack social proof, contextual scale, and objection handling. Traditional brand-produced videos often feel like commercials, triggering consumer skepticism. Amazon needed authentic, third-party validation at scale.
                </p>

                <h4>The Solution: The Onsite Commission Flywheel</h4>
                <p>
                  Amazon launched the Onsite Commission program to allow influencers to earn a percentage of sales even if they didn't drive the traffic themselves. Unlike traditional affiliate marketing, this program rewards creators for content that converts customers already on the site.
                </p>

                <div className="case-study-pillars">
                  <div className="pillar">
                    <h5>The "Second Approval" Gate</h5>
                    <p>Creators must pass a manual audit of three "shoppable videos," ensuring content meets high standards for audio, lighting, and value.</p>
                  </div>
                  <div className="pillar">
                    <h5>Algorithmic Placement</h5>
                    <p>Amazon's algorithm places videos in the "Videos About this Product" carousel based on conversion performance rather than view counts.</p>
                  </div>
                  <div className="pillar">
                    <h5>Performance-Based Incentives</h5>
                    <p>Creators earn 1–5% for onsite conversions — a lower rate offset by the massive, pre-existing traffic of the Amazon ecosystem.</p>
                  </div>
                </div>

                <h4>Scaling and Impact</h4>
                <div className="case-study-table">
                  <div className="table-row table-header">
                    <span>Stakeholder</span>
                    <span>The Benefit</span>
                  </div>
                  <div className="table-row">
                    <span><strong>Amazon</strong></span>
                    <span>Generated hundreds of thousands of organic "review-style" videos without the cost of a traditional production studio.</span>
                  </div>
                  <div className="table-row">
                    <span><strong>Creators</strong></span>
                    <span>Tens of thousands of influencers have built passive income streams; top-tier creators report earnings of $2,000–$15,000+ per month solely from onsite commissions.</span>
                  </div>
                  <div className="table-row">
                    <span><strong>Sellers</strong></span>
                    <span>Listings with creator videos see a marked conversion lift (10–20%) and reduced return rates due to clearer consumer expectations.</span>
                  </div>
                </div>

                <h4>Why It Works for Conversion</h4>
                <div className="case-study-pillars">
                  <div className="pillar">
                    <h5>The "Expert Peer" Effect</h5>
                    <p>Creators are seen as knowledgeable peers rather than salespeople.</p>
                  </div>
                  <div className="pillar">
                    <h5>Visual Friction Removal</h5>
                    <p>Seeing a product unboxed or demonstrated in 4K resolution answers final questions that text cannot.</p>
                  </div>
                  <div className="pillar">
                    <h5>Saturation as a Signal</h5>
                    <p>Having 5–10 different creators review a product creates an "echo chamber of trust" that pushes the scroller to purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-black" id="faq">
        <div className="container">
          <Reveal>
            <h2>
              Your <span className="gradient-text">Questions</span> Answered
            </h2>
          </Reveal>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <Reveal key={i} delay={i * 60}>
                <div
                  className={`faq-item ${openFaq === i ? "faq-open" : ""}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="faq-q">
                    <span>{f.q}</span>
                    <span className="faq-icon">{openFaq === i ? "−" : "▾"}</span>
                  </div>
                  {openFaq === i && <p className="faq-a">{f.a}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────────── LEGAL PAGE WRAPPER ───────────── */
function LegalPage({ title, lastUpdated, children }) {
  return (
    <main>
      <section className="page-hero">
        <div className="hero-glow" />
        <div className="container">
          <Reveal>
            <h1>{title}</h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="legal-date">Last Updated {lastUpdated}</p>
          </Reveal>
        </div>
      </section>
      <section className="section-dark">
        <div className="container">
          <div className="legal-content">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ───────────── BRAND TERMS PAGE ───────────── */
function BrandTermsPage() {
  return (
    <LegalPage title="Brand Terms" lastUpdated="February 15, 2026">
      <h3>1. DEFINITIONS AND INTERPRETATION</h3>
      <p><strong>1.1</strong> The following definitions and rules of interpretation apply in this Agreement:</p>
      <ul>
        <li><strong>"Approved Order"</strong> means (i) an Order approved by the Brand in accordance with clause 5; or (ii) an Order in respect of which the Validation Period has expired;</li>
        <li><strong>"Attribution Settings"</strong> means Qualifying Events, Attribution Window, Attribution Model, and Commission Rates;</li>
        <li><strong>"Attribution Model"</strong> means the rules that determine if an Order is credited to a Creator based on an Exposure;</li>
        <li><strong>"Attribution Window"</strong> means the defined period of time after an Exposure to determine if an Order is credited to a Creator;</li>
        <li><strong>"Brand Downtime"</strong> means any failure of the Attribution Code to properly record, amongst other things, an Order or Qualifying Events as a result of the Brand's breach of clause 2.2.1 or 3.2.4;</li>
        <li><strong>"Brand Materials"</strong> means any trade marks, advertising content, images, text, video, data or other material provided by or on behalf of the Brand to the Company or a Participating Creator;</li>
        <li><strong>"Brand URL"</strong> means, from time to time, any websites, apps or services of the Brand which are (i) set out in the Insertion Order or (ii) made subject of this Agreement in accordance with the Attribution Policy;</li>
        <li><strong>"Brand Standards"</strong> means any applicable laws, regulations or standards, data laws relating to advertising (including the Children's Online Privacy Protection Act), any generally accepted self-regulatory codes of practice, and any related guidance or best practice advice;</li>
        <li><strong>"Business Day"</strong> means a day other than a Saturday, Sunday or national public holiday in the United States of America;</li>
        <li><strong>"Commission"</strong> means a fee payable to the Creator, calculated as a percentage of the approved Order as set out in the Insertion Order;</li>
        <li><strong>"Commission Rates"</strong> means the percentage of the approved Order that is used to calculate a Commission;</li>
        <li><strong>"Commission Tracking Fee"</strong> means the percentage of the approved Commission as set out in the Insertion Order;</li>
        <li><strong>"Confidential Information"</strong> means any information disclosed by or relating to a party, including: information arising during the term of this Agreement; information about a party's business affairs; any reports generated by the use of the Interface; information about a party's operations, products or trade secrets; information about a party's technology (including any know-how and source code) and any derivatives of any part of any of them and which (i) is marked or identified as confidential; or (ii) would be regarded as confidential by a reasonable business person;</li>
        <li><strong>"Content"</strong> means any video, image, text, or other creative material uploaded by a Creator to the Network for playback or display on Brand URLs;</li>
        <li><strong>"Creator"</strong> means a user that has joined the Company's application and uploaded a video for playback on Brand URLs;</li>
        <li><strong>"Date Live"</strong> means the actual date of the Brand's program launch;</li>
        <li><strong>"Data Regulation"</strong> means any data protection, privacy or similar local laws that apply to Personal Data Processed in connection with this Agreement, including ECPA, COPPA, the GDPR and any implementing regulations;</li>
        <li><strong>"Exposure"</strong> means a Creator video playback on the Brand URLs that includes the Qualifying Events;</li>
        <li><strong>"Fees"</strong> means the Commission Tracking Fee and the Platform Fee as set out in the Insertion Order;</li>
        <li><strong>"GDPR"</strong> means the EU General Data Protection Regulation 2016/679;</li>
        <li><strong>"Intellectual Property Rights"</strong> means all copyright and related rights, patents, trademarks, service marks, trade names, domain names, rights in trade dress, rights in goodwill, rights in designs, rights in computer software, database rights, moral rights, rights in confidential information and any other intellectual property rights, whether registered or unregistered;</li>
        <li><strong>"Interface"</strong> means the intranet and software platform operated by the Company to provide the Services;</li>
        <li><strong>"Network"</strong> means the marketing network of Creators and Brands operated by the Company;</li>
        <li><strong>"Participating Creator"</strong> means any Creator approved by the Brand for participation in their Program;</li>
        <li><strong>"Product"</strong> means a product, service or equivalent offered for sale by the Brand on any Brand URL;</li>
        <li><strong>"Program"</strong> means the ongoing provision of the Services in respect of the Brand URL for the Term;</li>
        <li><strong>"Order"</strong> means the purchase of a Product by a Visitor on the Brand URLs;</li>
        <li><strong>"Qualifying Events"</strong> means the video playback engagement events initiated by a Visitor to determine an Exposure;</li>
        <li><strong>"Renewal Term"</strong> means a period equal to the Initial Term, starting from the end of the Initial Term or preceding Renewal Term;</li>
        <li><strong>"Services"</strong> means the services or assistance provided by the Company under this Agreement;</li>
        <li><strong>"Term"</strong> means the term of this Agreement from the Effective Date until its termination or expiry;</li>
        <li><strong>"Tracking Code"</strong> means the Company's software code for the recording of Qualifying Events and Orders;</li>
        <li><strong>"Visitor"</strong> means any person who visits the Brand URLs.</li>
      </ul>
      <p><strong>1.2</strong> In this Agreement any meanings given to terms in the attached Insertion Order shall apply to these Standard Terms.</p>
      <p><strong>1.3</strong> If there is a conflict between the Insertion Order and the Standard Terms, the Insertion Order shall prevail.</p>

      <h3>2. SET-UP</h3>
      <p><strong>2.1</strong> Either prior to or promptly following the Effective Date the Company will provide the Brand:</p>
      <p>2.1.1 access to the Tracking Code; and</p>
      <p>2.1.2 any information, assistance or access reasonably requested to enable the proper integration of the Tracking Code into the Brand URLs by the Brand.</p>
      <p><strong>2.2</strong> Within 15 Business Days of the Effective Date the Brand will:</p>
      <p>2.2.1 properly integrate the Tracking Code into the Brand URLs, in accordance with the Company's Tracking Policy; and</p>
      <p>2.2.2 provide the Company the Brand Materials.</p>
      <p><strong>2.3</strong> The Company may test the integration of the Tracking Code into the Brand URLs, by initiating Qualifying Events and placing test orders for the purchase of Products. The Company will notify the Brand of any test order, which shall be canceled by the Brand within 48 hours of such notice.</p>
      <p><strong>2.5</strong> The Brand acknowledges that:</p>
      <p>2.5.1 the Company depends on proper use of the Tracking Code to ensure Qualifying Events and Orders are tracked and recorded;</p>
      <p>2.5.2 to achieve optimal tracking and recording of Orders, the Brand shall implement the Tracking Code as instructed by the Company;</p>
      <p>2.5.3 the Brand will integrate the Tracking Code on the Brand URLs and any iterations of the Brand URLs so as to allow the Tracking Code to track Qualifying Events and Orders in real time.</p>

      <h3>3. PROVISION AND USE OF THE SERVICE</h3>
      <p><strong>3.1</strong> Subject to the Brand's compliance with clause 2.2, the Company will provide to the Brand:</p>
      <p>3.1.1 the Services;</p>
      <p>3.1.2 access to the Interface; and</p>
      <p>3.1.3 updates to the Tracking Code it makes generally available.</p>
      <p><strong>3.2</strong> During the Term, the Brand will:</p>
      <p>3.2.1 provide the Company the Brand Materials;</p>
      <p>3.2.2 ensure any Brand Materials shall be legally compliant in every respect;</p>
      <p>3.2.3 promptly select and approve Creators to act as Participating Creators;</p>
      <p>3.2.4 maintain the proper integration of the Tracking Code into the Brand URLs;</p>
      <p>3.2.5 use all reasonable efforts to inform the Company of any circumstances likely to prevent the Tracking Code accurately recording Orders;</p>
      <p>3.2.6 provide the Company any information, assistance or access reasonably requested;</p>
      <p>3.2.7 ensure any information it provides to the Company is accurate and up to date; and</p>
      <p>3.2.8 notify the Company of any actual or anticipated downtime of any of the Brand URLs.</p>

      <h3>4. MANAGING ONSITE COMMISSION PROGRAMS</h3>
      <p><strong>4.1</strong> Programs will commence as soon as practicable after completion of the obligations at clause 2.</p>
      <p><strong>4.2</strong> Services to be provided will be provided by the Company for the period, budget and other terms set out in writing.</p>
      <p><strong>4.3</strong> The Brand will provide the Company any Brand Materials relevant to the Program as applicable.</p>
      <p><strong>4.4</strong> The Company will suggest appropriate Participating Creators; and on the Brand's request: prevent any Creator from acting as a Participating Creator; and use reasonable efforts to procure Participating Creators remove Brand Materials or Links from Creator Websites.</p>
      <p><strong>4.5</strong> The Brand will permit Creators to market the Brand and its Products; inform Participating Creators of relevant information, Advertising Standards, terms and conditions; alert Company in writing to any Brand Materials directed to children; inform the Company of any complaints; and comply with requirements applied by a Participating Creator.</p>
      <p><strong>4.6–4.8</strong> Terms applied by the Brand shall be subject to this Agreement. The Brand may not reject Creators permitted on other affiliate networks. The Brand may delegate day-to-day operations to a third party on written notice.</p>

      <h3>5. TRACKING</h3>
      <p><strong>5.1</strong> The Tracking Code and Attribution Settings will be the sole basis for recording and determining Exposures, Orders and Commissions.</p>
      <p><strong>5.2</strong> The Company will enable the Brand to approve or decline Orders and respond to questions regarding Orders.</p>
      <p><strong>5.3</strong> The Brand must approve Orders in good faith and in a manner consistent with its historic approach.</p>
      <p><strong>5.4</strong> The Brand shall use all reasonable efforts to approve Orders within the Validation Period.</p>
      <p><strong>5.5</strong> The Brand may only decline Orders which were canceled, returned or refunded; or which were generated in breach of terms or the result of fraud.</p>
      <p><strong>5.6</strong> Each Order will be deemed approved at the end of the Validation Period, unless declined in accordance with clause 5.5.</p>
      <p><strong>5.7</strong> The Brand has no right to recover Fees or Commissions paid in respect of Approved Orders.</p>

      <h3>6. ORDERS, COMMISSIONS AND BONUSES</h3>
      <p><strong>6.1</strong> Commissions in respect of approved Orders will be determined as a percentage of the purchase price of the Product(s).</p>
      <p><strong>6.2</strong> The Brand may commit to pay additional Commissions at its discretion.</p>
      <p><strong>6.3</strong> The Company will make an equivalent payment to the respective Participating Creator.</p>
      <p><strong>6.4</strong> The Brand may vary the prospective Commission on 30 Business Days' notice.</p>
      <p><strong>6.5–6.7</strong> Commissions applicable to past Orders may not be varied. The Brand will be bound to pay Commission as varied. Variations do not constitute amendments to this Agreement.</p>

      <h3>7. PAYMENTS, INVOICING</h3>
      <p><strong>7.1</strong> The amount of Fees is as set out in the Insertion Order. Commission Tracking Fees are payable in addition to Commissions. The Brand will pay the Platform Fee, Commission Tracking Fee, and any Pilot or Other Fees.</p>
      <p><strong>7.2</strong> Invoices will be sent to the Brand's invoice email address. The Company will invoice for Pilot and Platform Fees on or shortly after the Effective Date.</p>
      <p><strong>7.3</strong> The Brand will pay invoices on the agreed terms. All payments will be made to the bank account nominated by the Company. Late payments accrue interest at 1.5% per month. The Company may suspend Services or terminate for non-payment. Payments are made in the invoiced currency.</p>

      <h3>8. COUNTRIES AND ADDITIONAL COUNTRY AGREEMENTS</h3>
      <p><strong>8.1–8.4</strong> This Agreement is entered in respect of the Country only. Additional country agreements may be entered. Each constitutes a separate agreement.</p>

      <h3>9. WARRANTIES</h3>
      <p><strong>9.1</strong> Each party warrants full power and authority, proper licensing, compliance with laws, and no disparaging representations.</p>
      <p><strong>9.2</strong> The Brand warrants Brand Materials compliance and authorized Commission variations.</p>
      <p><strong>9.3</strong> The Company warrants it has obtained necessary Content rights and that Content use will not infringe third-party IP.</p>

      <h3>10. INTELLECTUAL PROPERTY</h3>
      <p><strong>10.1</strong> The Brand grants the Company a non-exclusive, transferable, royalty-free, worldwide license to use Brand Materials for operating the Program and enabling Participating Creators.</p>
      <p><strong>10.2</strong> The Company may sublicense Brand Materials to Participating Creators and Content to the Brand for use on Brand URLs.</p>
      <p><strong>10.3</strong> The Company grants the Brand a non-exclusive, non-sublicensable license to use the Tracking Code and Interface.</p>
      <p><strong>10.6–10.8</strong> The Brand will not reverse engineer the Interface or Tracking Code. Each party reserves its IP rights. The Brand will indemnify the Company regarding use of Brand Materials.</p>

      <h3>11. CONFIDENTIALITY</h3>
      <p><strong>11.1</strong> Each party will only use Confidential Information to enjoy its rights or comply with its obligations. Confidential Information shall be kept confidential.</p>
      <p><strong>11.2</strong> Exceptions: public domain information, independently developed information, information published on the Interface, and court-ordered disclosure.</p>
      <p><strong>11.3–11.4</strong> The Company may disclose to Group Companies. This clause survives termination for five years.</p>

      <h3>12. DATA PROTECTION</h3>
      <p><strong>12.1–12.5</strong> Both parties will comply with Data Regulation. Each party will provide reasonable co-operation. The Brand shall not use Interface reports to create Visitor profiles.</p>

      <h3>13. LIMITATION OF LIABILITY</h3>
      <p><strong>13.1–13.8</strong> The Company is not liable for losses caused by the Brand's acts or omissions; losses of profits, business, goodwill; losses from Creator acts; or indirect/consequential losses. Total liability is limited to fees received in the preceding 12 months. The Network, Interface, Tracking Code and Services are provided "as is." Nothing limits liability for death, personal injury, fraud, or fraudulent misrepresentation.</p>

      <h3>14. TERMINATION</h3>
      <p><strong>14.1</strong> The Agreement continues for the Initial Term and automatically renews for successive Renewal Terms.</p>
      <p><strong>14.2</strong> The Company may terminate immediately for failure to comply with integration, approval, or participation obligations.</p>
      <p><strong>14.3</strong> The Company may suspend for non-compliance with specified clauses.</p>
      <p><strong>14.4</strong> Either party may terminate on at least three months' written notice.</p>
      <p><strong>14.6</strong> Either party may terminate immediately for material breach (unremedied within 14 days), data processing breach, or insolvency.</p>

      <h3>15. NOTICES</h3>
      <p><strong>15.1</strong> Notices will be in writing, delivered by hand, pre-paid post, or email to addresses in the Insertion Order.</p>

      <h3>16. GENERAL</h3>
      <p><strong>16.1–16.11</strong> Agent authority and Brand liability. Right of set-off. Time is of the essence. Force Majeure provisions. Assignment restrictions. No partnership or agency. No third-party rights. Electronic execution. Variation requirements. Governed by California law. Exclusive jurisdiction in Orange County, California.</p>
    </LegalPage>
  );
}

/* ───────────── DATA PROCESSING ADDENDUM PAGE ───────────── */
function DPAPage() {
  return (
    <LegalPage title="Data Processing Addendum" lastUpdated="February 15, 2026">
      <p>This Data Processing Agreement ("DPA") forms part of the Agreement between the Parties and is effective as of the effective date of the applicable Order Form or Brand Insertion Order (the "Agreement"). In the event of conflict, this DPA governs with respect to Personal Data processing.</p>
      <p>This DPA applies where Onsite Affiliate processes Personal Data on behalf of Brand in connection with affiliate marketing, onsite video syndication, engagement tracking, purchase attribution, analytics, and commission calculation services.</p>
      <p>Applicable Data Protection Laws include, where relevant, the <strong>General Data Protection Regulation (GDPR)</strong> and the <strong>California Privacy Rights Act (CPRA)</strong>, as well as other applicable U.S. state privacy laws.</p>

      <h3>1. Roles and Scope</h3>
      <h4>1.1 Roles</h4>
      <ul>
        <li>Brand = Controller (or "Business" under CPRA)</li>
        <li>Onsite Affiliate = Processor (or "Service Provider" under CPRA)</li>
      </ul>
      <p>The Parties acknowledge that Brand determines the purposes and means of processing Personal Data, and Onsite Affiliate processes Personal Data solely on Brand's behalf.</p>
      <h4>1.2 Scope of Services</h4>
      <p>Processing is limited to provision of the Services, including:</p>
      <ul>
        <li>Syndication of approved creator video content to onsite placements</li>
        <li>Video engagement tracking</li>
        <li>Affiliate click and conversion tracking</li>
        <li>Transaction and purchase attribution</li>
        <li>Commission calculation and reporting</li>
        <li>Fraud detection and prevention</li>
        <li>Aggregated analytics and performance reporting</li>
      </ul>
      <h4>1.3 Duration</h4>
      <p>Processing continues for the term of the Agreement and for up to ninety (90) days thereafter for deletion or return of Personal Data unless retention is required by law.</p>

      <h3>2. Categories of Data</h3>
      <h4>2.1 Data Subjects</h4>
      <ul>
        <li>Consumers interacting with ecommerce websites or apps</li>
        <li>Users engaging with onsite video placements</li>
      </ul>
      <h4>2.2 Types of Personal Data</h4>
      <ul>
        <li>IP address</li>
        <li>Device identifiers (cookie IDs, mobile advertising IDs, hashed identifiers)</li>
        <li>Browser and operating system data</li>
        <li>Video interaction events</li>
        <li>Affiliate click identifiers</li>
        <li>Transaction identifiers</li>
        <li>Purchase event metadata</li>
        <li>Country/state-level geolocation derived from IP</li>
      </ul>
      <p>Onsite Affiliate does not intentionally collect or process Sensitive Personal Data.</p>

      <h3>3. Controller Obligations</h3>
      <p>Brand represents and warrants that it:</p>
      <ul>
        <li>Has established a lawful basis for processing Personal Data</li>
        <li>Has implemented required consent and cookie mechanisms where applicable</li>
        <li>Has provided required notices to Data Subjects</li>
        <li>Has authority to disclose Personal Data to Processor</li>
      </ul>
      <p>Brand remains responsible for compliance with Applicable Data Protection Laws.</p>

      <h3>4. Processor Obligations</h3>
      <p>Onsite Affiliate shall:</p>
      <p><strong>4.1</strong> Process Personal Data only on documented instructions from Brand.</p>
      <p><strong>4.2</strong> Inform Brand if an instruction violates Applicable Data Protection Laws.</p>
      <p><strong>4.3</strong> Ensure personnel are subject to confidentiality obligations.</p>
      <p><strong>4.4</strong> Implement reasonable and appropriate technical and organizational safeguards, including:</p>
      <ul>
        <li>Encryption in transit</li>
        <li>Logical customer data separation</li>
        <li>Role-based access controls</li>
        <li>Security monitoring and logging</li>
      </ul>
      <p><strong>4.5</strong> Notify Brand without undue delay and no later than forty-eight (48) hours after becoming aware of a confirmed Personal Data Breach.</p>
      <p><strong>4.6</strong> Assist Brand, to a commercially reasonable extent, in responding to Data Subject requests.</p>
      <p><strong>4.7</strong> Delete or return Personal Data upon termination of Services unless retention is required by law.</p>

      <h3>5. AI and Automated Processing</h3>
      <p>Onsite Affiliate may use automated processing, algorithms, and machine learning models to:</p>
      <ul>
        <li>Optimize video placement and ranking</li>
        <li>Analyze engagement trends</li>
        <li>Detect fraud and abuse</li>
        <li>Calculate attribution and commissions</li>
      </ul>
      <p>Such processing does not produce legal or similarly significant effects on Data Subjects, is not used for credit, employment, eligibility, or profiling decisions, and is limited to performance optimization within the Services.</p>
      <p>Onsite Affiliate will not use Personal Data received from Brand to train generalized artificial intelligence models outside the scope of providing the Services.</p>

      <h3>6. Multi-Tenant SaaS Environment</h3>
      <p>The Services operate in a multi-tenant cloud environment. Onsite Affiliate shall implement logical and technical controls designed to prevent unauthorized access between customers and shall not disclose Personal Data from one Brand to another Brand.</p>
      <p>Onsite Affiliate may use aggregated, anonymized, and de-identified data derived from Personal Data across customers for service improvement, analytics and benchmarking, fraud detection, and product development. Such aggregated data will not identify any Data Subject or Brand.</p>

      <h3>7. CPRA and U.S. State Privacy Compliance</h3>
      <p>To the extent CPRA or similar U.S. state privacy laws apply, Onsite Affiliate:</p>
      <ul>
        <li>Acts as a Service Provider</li>
        <li>Processes Personal Data solely for business purposes under the Agreement</li>
        <li>Does not sell or share Personal Data</li>
        <li>Does not retain, use, or disclose Personal Data outside the direct business relationship with Brand</li>
        <li>Does not combine Personal Data received from Brand with Personal Data from other sources except as permitted by law</li>
        <li>Will notify Brand if it determines it can no longer meet its obligations</li>
      </ul>

      <h3>8. Subprocessors</h3>
      <p>Onsite Affiliate may engage Subprocessors. Onsite Affiliate shall maintain a current list of Subprocessors available upon request, impose data protection obligations consistent with this DPA, and remain responsible for Subprocessor compliance.</p>
      <p>Brand may object to a new Subprocessor on reasonable data protection grounds within fifteen (15) days of notice. If unresolved, either Party may terminate affected Services.</p>

      <h3>9. International Transfers</h3>
      <p>If Personal Data subject to GDPR is transferred outside the EEA or UK, the Parties incorporate the applicable Standard Contractual Clauses (Controller-to-Processor module). The UK Addendum applies where required.</p>

      <h3>10. Audits</h3>
      <p>Onsite Affiliate may satisfy audit requests by providing a summary of security controls and relevant third-party security certifications (if available). Onsite inspections are permitted no more than once annually, upon thirty (30) days' notice, during normal business hours, and at Brand's expense.</p>

      <h3>11. Retention</h3>
      <p>Attribution logs and event data may be retained for up to twenty-four (24) months for reporting, fraud prevention, and audit purposes unless otherwise agreed in writing.</p>

      <h3>12. Liability</h3>
      <p>This DPA is subject to the liability limitations set forth in the Agreement.</p>
    </LegalPage>
  );
}

/* ───────────── PRIVACY POLICY PAGE ───────────── */
function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="February 5, 2026">
      <h3>1. Introduction</h3>
      <p>Welcome to Onsite Affiliate ("we," "us," or "our"). We operate onsiteaffiliate.com (the "Site"). We respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, and disclose information when you visit our Site.</p>

      <h3>2. Information We Collect</h3>
      <p>We may collect information that identifies, relates to, or could reasonably be linked to you ("Personal Information"). This includes:</p>
      <ul>
        <li><strong>Identifiers:</strong> Name, email address, or IP address (collected via cookies or contact forms).</li>
        <li><strong>Commercial Information:</strong> Records of video engagement and product purchases for the purposes of attributing commissions.</li>
        <li><strong>Internet Activity:</strong> Browsing history, search history, and interactions with our website or advertisements.</li>
      </ul>

      <h3>3. How We Collect Information</h3>
      <ul>
        <li><strong>Directly from You:</strong> When you use our website or contact us.</li>
        <li><strong>Automatically:</strong> Through cookies, web beacons, and other tracking technologies as you navigate the Site.</li>
        <li><strong>From Third Parties:</strong> We may receive data from our partners to calculate and pay commissions.</li>
      </ul>

      <h3>4. Use of Your Information</h3>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Operate and maintain the Site.</li>
        <li>Track video engagements and process commissions.</li>
        <li>Send newsletters or promotional materials (if you have opted in).</li>
        <li>Analyze Site traffic and improve user experience.</li>
      </ul>

      <h3>5. Sharing Your Information</h3>
      <p>We do not sell your personal information. However, we may share data with:</p>
      <ul>
        <li><strong>Onsite Partners:</strong> To track video engagements and purchases made through video content.</li>
        <li><strong>Service Providers:</strong> Such as email marketing platforms or website hosting providers.</li>
        <li><strong>Legal Requirements:</strong> If required by law or to protect our rights.</li>
      </ul>

      <h3>6. Cookies and Tracking Technologies</h3>
      <p>We use cookies to enhance your experience. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. Note that some parts of the Site may not function properly without cookies.</p>

      <h3>7. Your California Privacy Rights (CCPA/CPRA)</h3>
      <p>As a California resident, you have the following rights:</p>
      <ul>
        <li><strong>Right to Know:</strong> You can request a list of the personal information we have collected about you.</li>
        <li><strong>Right to Delete:</strong> You can request that we delete your personal information.</li>
        <li><strong>Right to Opt-Out:</strong> You have the right to opt-out of the "sale" or "sharing" of your personal information. (Note: We do not currently sell your data).</li>
        <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising these rights.</li>
      </ul>

      <h3>8. "Do Not Track" Signals</h3>
      <p>Under CalOPPA, we must disclose how we respond to "Do Not Track" (DNT) signals. Currently, our Site does not change its behavior based on DNT browser settings, as there is no industry-wide standard for these signals.</p>

      <h3>9. Third-Party Links</h3>
      <p>Our Site contains links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.</p>

      <h3>10. Contact Us</h3>
      <p>If you have questions about this Privacy Policy, please contact us at:</p>
      <p><strong>Email:</strong> legal@onsiteaffiliate.com</p>
      <p><strong>Address:</strong> Onsite Affiliate Partners, LLC, 30025 Alicia Pkwy #20-2472 Laguna Niguel, CA 92677</p>
    </LegalPage>
  );
}

/* ───────────── APP ROUTER ───────────── */
export default function App() {
  const path = useRoute();
  const [calcOpen, setCalcOpen] = useState(false);

  // Make openCalc available globally for buttons
  window.__openCalc = () => setCalcOpen(true);

  let page;
  switch (path) {
    case "/about":
      page = <AboutPage />;
      break;
    case "/solutions/ecommerce":
      page = <EcommercePage />;
      break;
    case "/solutions/brand-social":
      page = <BrandSocialPage />;
      break;
    case "/solutions/measurement":
      page = <MeasurementPage />;
      break;
    case "/resources":
      page = <ResourcesPage />;
      break;
    case "/brand-terms":
      page = <BrandTermsPage />;
      break;
    case "/data-processing-addendum":
      page = <DPAPage />;
      break;
    case "/privacy":
      page = <PrivacyPage />;
      break;
    default:
      page = <HomePage />;
  }

  return (
    <>
      <Navbar onCalcOpen={() => setCalcOpen(true)} />
      {page}
      <Footer />
      <CalculatorLightbox isOpen={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
}
