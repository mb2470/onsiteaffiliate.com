import { useState, useEffect, useCallback } from 'react';
import { usePresentation } from './usePresentations';
import DEFAULT_SLIDES from './defaultSlides';

// ─── Replace [Customer] tokens ───
function rc(text, name) {
  if (!text) return text;
  return text.replace(/\[Customer\]/g, name || '[Customer]');
}

// ─── Individual Slide Renderers ───
function SlideTitle({ slide, name, logoUrl }) {
  return (
    <div className="pres-slide-content pres-slide--dark">
      <div className="pres-slide__inner">
        <div className="pres-accent-line" />
        {logoUrl && (
          <img src={logoUrl} alt={name} className="pres-brand-logo" />
        )}
        <h1 className="pres-title--xl">{rc(slide.title, name)}</h1>
        <p className="pres-subtitle">{rc(slide.subtitle, name)}</p>
        <span className="pres-watermark">ONSITE AFFILIATE</span>
      </div>
    </div>
  );
}

function SlideContent({ slide, name }) {
  return (
    <div className="pres-slide-content pres-slide--light">
      <div className="pres-slide__inner">
        <div className="pres-left-bar" />
        <h2 className="pres-title">{rc(slide.title, name)}</h2>
        {slide.intro && <p className="pres-intro">{rc(slide.intro, name)}</p>}
        <div className="pres-bullets">
          {slide.bullets?.map((b, i) => (
            <div key={i} className="pres-bullet">
              <span className="pres-bullet__num">{i + 1}</span>
              <p>{rc(b, name)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideHero({ slide, name }) {
  return (
    <div className="pres-slide-content pres-slide--dark">
      <div className="pres-slide__inner pres-two-col">
        <div>
          <h2 className="pres-title">{rc(slide.title, name)}</h2>
          <p className="pres-subtitle">{rc(slide.subtitle, name)}</p>
        </div>
        <div className="pres-flywheel-wrap">
          <img
            src="/images/FC-Flywheel_Static.png"
            alt="Onsite Affiliate Flywheel"
            className="pres-flywheel-img"
          />
        </div>
      </div>
    </div>
  );
}

function SlidePhases({ slide }) {
  return (
    <div className="pres-slide-content pres-slide--light">
      <div className="pres-slide__inner">
        <h2 className="pres-title">{slide.title}</h2>
        <p className="pres-intro">{slide.subtitle}</p>
        <p className="pres-text-sm">{slide.intro}</p>
        <div className="pres-phases-row">
          {slide.phases?.map((p, i) => (
            <div key={i} className="pres-phase-card">
              <span className="pres-phase-icon">{p.icon}</span>
              <h3>{p.name}</h3>
              <span className="pres-phase-dur">{p.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlidePhaseDetail({ slide }) {
  const colors = { 1: '#8B5CF6', 2: '#10B981', 3: '#F59E0B' };
  const c = colors[slide.phaseNumber] || '#8B5CF6';
  return (
    <div className="pres-slide-content pres-slide--light">
      <div className="pres-slide__inner">
        <div className="pres-phase-indicators">
          {[1, 2, 3].map((n) => (
            <span key={n} className="pres-phase-dot" style={{
              background: n === slide.phaseNumber ? c : 'rgba(255,255,255,0.08)',
              color: n === slide.phaseNumber ? 'white' : '#666',
              borderColor: n === slide.phaseNumber ? c : 'rgba(255,255,255,0.1)',
            }}>{n}</span>
          ))}
          <span className="pres-phase-label">{slide.phaseLabel}</span>
        </div>
        <h2 className="pres-title">{slide.title}</h2>
        <p className="pres-intro" style={{ color: c }}>{slide.subtitle}</p>
        <div className="pres-detail-grid">
          <div className="pres-detail-box">
            <span className="pres-detail-label">Goal</span>
            <p>{slide.goal}</p>
          </div>
          <div className="pres-detail-box">
            <span className="pres-detail-label">Strategy</span>
            <p>{slide.strategy}</p>
          </div>
        </div>
        <div className="pres-detail-box pres-detail-box--full">
          <span className="pres-detail-label">Numbers (per 1,000 Products)</span>
          <div className="pres-numbers-row">
            {Object.entries(slide.numbers || {}).map(([k, v]) => (
              <div key={k}>
                <span className="pres-detail-label">{k.replace(/([A-Z])/g, ' $1')}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
        </div>
        <div className="pres-phase-footer">
          <span className="pres-metric-badge" style={{ background: c }}>{slide.primaryMetric}</span>
          <span>Timeline: <strong>{slide.timeline}</strong></span>
        </div>
      </div>
    </div>
  );
}

function SlidePricing({ slide }) {
  return (
    <div className="pres-slide-content pres-slide--light">
      <div className="pres-slide__inner">
        <h2 className="pres-title">{slide.title}</h2>
        <p className="pres-intro">{slide.intro}</p>
        <div className="pres-two-col">
          <div className="pres-pricing-tiers">
            {slide.pricingTiers?.map((t, i) => (
              <div key={i} className="pres-tier" style={{ borderLeftColor: ['#8B5CF6', '#10B981', '#F59E0B'][i] }}>
                <h4>{t.name}</h4>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
          <div className="pres-pricing-table">
            <div className="pres-pricing-table__title">Annual Program Example</div>
            <div className="pres-pricing-table__header">{slide.table?.header}</div>
            <table>
              <tbody>
                {slide.table?.rows.map((row, i) => {
                  if (!row[0] && !row[1]) return <tr key={i}><td colSpan={2} style={{ padding: '4px 0' }}></td></tr>;
                  const hl = row[0]?.includes('ROCS') || row[0]?.includes('Total Onsite');
                  return (
                    <tr key={i} className={hl ? 'pres-row-hl' : ''}>
                      <td>{row[0]}</td>
                      <td className="pres-td-right">{row[1]}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideTeam({ slide }) {
  return (
    <div className="pres-slide-content pres-slide--dark">
      <div className="pres-slide__inner">
        <h2 className="pres-title">{slide.title}</h2>
        <div className="pres-team-row">
          {slide.members?.map((m, i) => (
            <div key={i} className="pres-team-card">
              <div className="pres-team-avatar">
                {m.name.split(' ').map((n) => n[0]).join('')}
              </div>
              <h3>{m.name}</h3>
              <span className="pres-team-role">{m.role}</span>
              <p>{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slide Router ───
function Slide({ slide, name, logoUrl }) {
  const renderers = {
    title: SlideTitle, content: SlideContent, hero: SlideHero,
    phases: SlidePhases, 'phase-detail': SlidePhaseDetail,
    pricing: SlidePricing, team: SlideTeam,
  };
  const Comp = renderers[slide.type] || SlideContent;
  return <Comp slide={slide} name={name} logoUrl={logoUrl} />;
}

// ─── Main Presentation Viewer ───
export default function PresentationPage({ slug }) {
  const { presentation, loading, error } = usePresentation(slug);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = presentation?.slides?.length ? presentation.slides : DEFAULT_SLIDES;
  const total = slides.length;

  const prev = useCallback(() => setCurrentSlide((s) => Math.max(0, s - 1)), []);
  const next = useCallback(() => setCurrentSlide((s) => Math.min(total - 1, s + 1)), [total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  if (loading) {
    return (
      <div className="pres-loading">
        <div className="pres-spinner" />
        <p>Loading presentation…</p>
      </div>
    );
  }

  if (error || !presentation) {
    return (
      <div className="pres-loading">
        <h2 style={{ fontSize: '3rem', marginBottom: 12 }}>404</h2>
        <p>This presentation doesn't exist.</p>
        <a href="#/admin" className="pres-back-link">Go to Admin →</a>
      </div>
    );
  }

  const name = presentation.customer_name;
  const logoUrl = presentation.logo_url || null;

  const handlePrint = () => window.print();

  return (
    <div className="pres-viewer">
      {/* Sticky top bar */}
      <nav className="pres-nav no-print">
        <div className="pres-nav__left">
          <a href="#/" className="pres-nav__logo">
            <img src="/images/logo-icon-white.png" alt="" style={{ height: 24 }} />
            <span>ONSITE AFFILIATE</span>
          </a>
          <span className="pres-nav__sep">|</span>
          <span className="pres-nav__customer">{name}</span>
        </div>
        <div className="pres-nav__right">
          <span className="pres-nav__counter">{currentSlide + 1} / {total}</span>
          <button className="pres-nav__btn" onClick={handlePrint}>
            ⤓ PDF
          </button>
        </div>
      </nav>

      {/* Carousel */}
      <div className="pres-carousel">
        <div
          className="pres-carousel__track"
          style={{ transform: `translateX(-${currentSlide * 100}vw)` }}
        >
          {slides.map((slide, i) => (
            <div className="pres-carousel__slide" key={slide.id || i}>
              <Slide slide={slide} name={name} logoUrl={logoUrl} />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          className="pres-carousel__arrow pres-carousel__arrow--left no-print"
          onClick={prev}
          disabled={currentSlide === 0}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          className="pres-carousel__arrow pres-carousel__arrow--right no-print"
          onClick={next}
          disabled={currentSlide === total - 1}
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Slide indicators */}
        <div className="pres-carousel__dots no-print">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`pres-carousel__dot ${i === currentSlide ? 'pres-carousel__dot--active' : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pres-footer no-print">
        <p>© {new Date().getFullYear()} Onsite Affiliate. Confidential & Proprietary.</p>
      </div>
    </div>
  );
}
