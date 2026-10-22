import HealthStatus from "@/components/layout/HealthStatus";
import LandingIcon from "@/components/ui/LandingIcon";
import AuthLinks from "@/components/auth/AuthLinks";

const features = [
  {
    icon: <LandingIcon name="fileSearch" />,
    title: "Understand your CV",
    description: "Turn your experience into a clear picture of your strengths and opportunities.",
  },
  {
    icon: <LandingIcon name="bulb" />,
    title: "Find your next step",
    description: "Get practical guidance to help you focus your career search.",
  },
  {
    icon: <LandingIcon name="safety" />,
    title: "Stay in control",
    description: "Your career journey is personal. Your information should be handled with care.",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#home" aria-label="AI Career Assistant home">
          <span className="brand-mark"><LandingIcon name="star" /></span>
          <span>career<span className="brand-light">mate</span></span>
        </a>
        <nav className="topbar-nav" aria-label="Main navigation">
          <a href="#features">How it works</a>
          <a href="#about">About</a>
        </nav>
        <div className="topbar-auth"><AuthLinks /></div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1>Make your next career move <span>with confidence.</span></h1>
          <p className="hero-description">
            A thoughtful assistant for understanding your experience, exploring opportunities,
            and finding a direction that fits you.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="/auth/signup">Get started <LandingIcon name="arrow" /></a>
            <a className="hero-secondary-link" href="#features">Explore what you can do</a>
            <span className="hero-note">A clearer path, one step at a time.</span>
          </div>
          <div className="hero-proof">
            <div className="proof-avatars" aria-hidden="true"><span>A</span><span>M</span><span>S</span></div>
            <p>Built to help you move forward<br /><strong>at your own pace</strong></p>
          </div>
        </div>

        <div className="hero-visual" aria-label="Career progress illustration">
          <div className="visual-orbit orbit-one" />
          <div className="visual-orbit orbit-two" />
          <div className="visual-card main-card">
            <div className="visual-card-top"><span className="mini-icon"><LandingIcon name="star" /></span><span>YOUR CAREER SNAPSHOT</span><span className="live-dot" /></div>
            <div className="snapshot-title">A little more clarity.<br /><strong>A lot more possibility.</strong></div>
            <div className="snapshot-rule"><span /></div>
            <div className="snapshot-meta"><span>Experience</span><span>Growing</span></div>
            <div className="snapshot-bars"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
            <div className="snapshot-bottom"><span>Explore your strengths</span><LandingIcon name="arrow" /></div>
          </div>
          <div className="float-card float-card-top"><span className="float-icon"><LandingIcon name="bulb" /></span><span><strong>Find your focus</strong><small>One step at a time</small></span></div>
          <div className="float-card float-card-bottom"><span className="float-check">✓</span><span><strong>Made for your journey</strong><small>Guidance that moves with you</small></span></div>
          <span className="visual-sparkle sparkle-one">✦</span><span className="visual-sparkle sparkle-two">✧</span>
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <span className="section-kicker">A LITTLE HELP GOES A LONG WAY</span>
          <h2>Your career, with a clearer view.</h2>
          <p>Start with what you know. We’ll help you see where it could take you.</p>
        </div>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <span className={`feature-icon feature-icon-${index + 1}`}>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href="#about" aria-label={`Learn more: ${feature.title}`}><LandingIcon name="arrow" /></a>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer" id="about">
        <a className="brand footer-brand" href="#home"><span className="brand-mark"><LandingIcon name="star" /></span><span>career<span className="brand-light">mate</span></span></a>
        <span>Thoughtful tools for wherever you’re headed.</span>
        <span className="footer-status"><HealthStatus /></span>
      </footer>
    </main>
  );
}
