import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Search, Clock, Lightbulb, Shield, ArrowRight, UploadCloud } from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-warm-cream)' }}>
      {/* Navbar */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 60px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Network size={24} color="#FFFFFF" />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-deep-cocoa)',
              letterSpacing: '-0.5px',
            }}
          >
            LIFENEXUS
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <Button variant="outline" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '80px 24px 60px 24px',
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-peach-light)',
            border: '1px solid var(--color-soft-peach)',
            color: 'var(--color-nexus-orange)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          <Network size={14} /> Personal Knowledge Graph & Memory Engine
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '56px',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: '1.15',
            color: 'var(--color-deep-cocoa)',
            marginBottom: '24px',
          }}
        >
          Everything you've done.{' '}
          <span className="text-gradient">Connected.</span>
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: 'var(--color-muted-brown)',
            lineHeight: '1.6',
            maxWidth: '680px',
            margin: '0 auto 36px auto',
          }}
        >
          Stop losing track of warranties, receipts, certificates, and milestones.
          LIFENEXUS ingests your scattered digital files, builds a connected Personal Knowledge Graph,
          and gives you grounded life search with instant source citations.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate('/register')}
          >
            Launch Your Life Workspace
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={<UploadCloud size={18} />}
            onClick={() => navigate('/login')}
          >
            Explore Demo
          </Button>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '40px auto 100px auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
        }}
      >
        <Card>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-peach-light)', color: 'var(--color-nexus-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Life Search</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)', lineHeight: '1.5' }}>
            Ask natural questions like "Tell me about my laptop" and receive evidence-backed answers with exact source document references.
          </p>
        </Card>

        <Card>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-peach-light)', color: 'var(--color-nexus-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Network size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Life Graph</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)', lineHeight: '1.5' }}>
            Explore an interactive visual network connecting invoices, warranties, repairs, people, and organizations.
          </p>
        </Card>

        <Card>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-peach-light)', color: 'var(--color-nexus-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Clock size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Life Timeline</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)', lineHeight: '1.5' }}>
            Automatically reconstruct your milestones, education, internships, and asset purchases on an interactive chronological spine.
          </p>
        </Card>

        <Card>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-peach-light)', color: 'var(--color-nexus-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <Shield size={24} />
          </div>
          <h3 style={{ fontFamily: 'var(--font-family-display)', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Private & Sovereign</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)', lineHeight: '1.5' }}>
            Your personal data is isolated and protected. Delete documents or purge your workspace anytime with zero remnant footprint.
          </p>
        </Card>
      </section>
    </div>
  );
};
