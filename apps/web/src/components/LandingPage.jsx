import { useState } from 'react';

const LandingPage = ({ onEnterApp }) => {
  const [email, setEmail] = useState('');
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // API call would go here
      console.log('Waitlist signup:', email);
      setWaitlistSuccess(true);
      setEmail('');
    }
  };

  const features = [
    {
      icon: '🌍',
      title: '3D Globe Visualization',
      description: 'Interactive CesiumJS-powered Earth with smooth orbital tracks. Visualize satellite positions in real-time.'
    },
    {
      icon: '🛰️',
      title: 'Live Satellite Tracking',
      description: 'Track 10,000+ active satellites with fresh TLE data. See position, altitude, and velocity updated in real-time.'
    },
    {
      icon: '🔴',
      title: 'ISS Live Monitor',
      description: 'ISS highlighted with dedicated telemetry card. Click to focus, track orbit, and view live position data.'
    },
    {
      icon: '🪐',
      title: 'Solar System Navigator',
      description: 'Explore our solar system. Fly to any planet, view positions, and calculate live distances from Earth.'
    },
    {
      icon: '📊',
      title: 'SME Metadata Panel',
      description: 'Curated satellite information including owner, mission type, altitude, and detailed telemetry.'
    },
    {
      icon: '🌟',
      title: 'Daily Space Media',
      description: "NASA's Astronomy Picture of the Day integrated into your experience."
    }
  ];

  return (
    <div style={styles.container}>
      {/* Stars Background */}
      <div style={styles.stars}>
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.star,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}></div>
            Cosmic Watch
          </div>
          <nav style={styles.nav}>
            <a href="#features" style={styles.navLink}>Features</a>
            <a href="#waitlist" style={styles.navLink}>Join Waitlist</a>
            <button onClick={onEnterApp} style={styles.btnPrimary}>
              Launch App
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Real-Time Satellite Tracking</div>
          
          <h1 style={styles.heroTitle}>
            Your Window to<br />
            <span style={styles.gradient}>Near-Earth Orbit</span>
          </h1>
          
          <p style={styles.heroText}>
            Professional-grade digital twin of Earth's satellite constellation. 
            Track the ISS, monitor active satellites, and explore our solar system — all in real-time.
          </p>
          
          <div style={styles.heroButtons}>
            <button onClick={onEnterApp} style={styles.btnPrimary}>
              <PlayIcon />
              Launch Mission Control
            </button>
            <a href="#features" style={styles.btnSecondary}>
              Explore Features
            </a>
          </div>

          {/* Stats */}
          <div style={styles.stats}>
            <div style={styles.stat}>
              <div style={styles.statValue}>10,000+</div>
              <div style={styles.statLabel}>Active Satellites</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>Real-Time</div>
              <div style={styles.statLabel}>Live Tracking</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statValue}>ISS</div>
              <div style={styles.statLabel}>Live Telemetry</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features} id="features">
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Mission Capabilities</h2>
          <p style={styles.sectionText}>
            Everything you need for real-time orbital situational awareness
          </p>
        </div>
        
        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} style={styles.featureCard}>
              <div style={styles.featureIcon}>{feature.icon}</div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureText}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Waitlist */}
      <section style={styles.waitlist} id="waitlist">
        <div style={styles.waitlistCard}>
          <h2 style={styles.waitlistTitle}>Join the Mission</h2>
          <p style={styles.waitlistText}>
            Be among the first to access Cosmic Watch. Early adopters get exclusive features and direct feedback.
          </p>
          
          {!waitlistSuccess ? (
            <form onSubmit={handleWaitlistSubmit} style={styles.form}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
              <button type="submit" style={styles.btnPrimary}>
                Join Waitlist
              </button>
            </form>
          ) : (
            <div style={styles.successMessage}>
              ✨ You're on the list! We'll notify you when we launch.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Cosmic Watch. Built with ❤️ for space enthusiasts.</p>
      </footer>
    </div>
  );
};

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10,8 16,12 10,16" fill="currentColor"/>
  </svg>
);

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#fff',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: 'relative',
    overflow: 'hidden'
  },
  stars: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 0
  },
  star: {
    position: 'absolute',
    background: '#fff',
    borderRadius: '50%',
    animation: 'twinkle 3s infinite ease-in-out'
  },
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '1rem 2rem',
    background: 'rgba(10, 10, 15, 0.9)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    border: '2px solid #00d4ff',
    borderRadius: '50%',
    position: 'relative',
    WebkitTextFillColor: 'initial'
  },
  nav: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center'
  },
  navLink: {
    color: '#a1a1aa',
    textDecoration: 'none',
    fontSize: '0.9rem',
    transition: 'color 0.2s'
  },
  btnPrimary: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.9rem',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #00d4ff, #8b5cf6)',
    color: '#fff',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  btnSecondary: {
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: 500,
    fontSize: '0.9rem',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center'
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8rem 2rem 4rem',
    position: 'relative',
    zIndex: 1
  },
  heroContent: {
    maxWidth: '900px',
    textAlign: 'center'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 1rem',
    background: 'rgba(0, 212, 255, 0.1)',
    border: '1px solid rgba(0, 212, 255, 0.3)',
    borderRadius: '100px',
    fontSize: '0.8rem',
    color: '#00d4ff',
    marginBottom: '1.5rem'
  },
  heroTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 700,
    lineHeight: 1.2,
    marginBottom: '1.5rem'
  },
  gradient: {
    background: 'linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #f59e0b 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroText: {
    fontSize: '1.1rem',
    color: '#a1a1aa',
    maxWidth: '550px',
    margin: '0 auto 2.5rem'
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '3rem'
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
  },
  stat: {
    textAlign: 'center'
  },
  statValue: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#00d4ff'
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#71717a',
    marginTop: '0.25rem'
  },
  features: {
    padding: '6rem 2rem',
    background: '#12121a',
    position: 'relative',
    zIndex: 1
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 4rem'
  },
  sectionTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  sectionText: {
    color: '#a1a1aa'
  },
  featuresGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem'
  },
  featureCard: {
    background: '#1a1a25',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '2rem',
    transition: 'all 0.3s'
  },
  featureIcon: {
    fontSize: '2rem',
    marginBottom: '1rem'
  },
  featureTitle: {
    fontSize: '1.2rem',
    marginBottom: '0.75rem'
  },
  featureText: {
    color: '#a1a1aa',
    fontSize: '0.95rem',
    lineHeight: 1.6
  },
  waitlist: {
    padding: '6rem 2rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  },
  waitlistCard: {
    maxWidth: '550px',
    margin: '0 auto',
    background: '#12121a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    padding: '3rem'
  },
  waitlistTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontSize: '1.75rem',
    marginBottom: '1rem'
  },
  waitlistText: {
    color: '#a1a1aa',
    marginBottom: '2rem'
  },
  form: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  input: {
    padding: '0.8rem 1.2rem',
    background: '#1a1a25',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    minWidth: '250px',
    outline: 'none'
  },
  successMessage: {
    color: '#00d4ff',
    marginTop: '1rem'
  },
  footer: {
    padding: '3rem 2rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    color: '#71717a',
    fontSize: '0.9rem',
    position: 'relative',
    zIndex: 1
  }
};

export default LandingPage;
