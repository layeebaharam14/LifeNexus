import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Network,
  Clock,
  Lightbulb,
  FileText,
  UploadCloud,
  ShieldCheck,
} from 'lucide-react';

const ACTIVE_NAV_ITEMS = [
  { name: 'Overview', path: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Import Documents', path: '/app/import', icon: UploadCloud },
  { name: 'Documents', path: '/app/documents', icon: FileText },
  { name: 'Privacy Sandbox', path: '/app/privacy', icon: ShieldCheck },
];

const UPCOMING_NAV_ITEMS = [
  { name: 'Life Search', path: '/app/search', icon: Search, badge: 'Phase 4' },
  { name: 'Life Graph', path: '/app/graph', icon: Network, badge: 'Phase 4' },
  { name: 'Life Timeline', path: '/app/timeline', icon: Clock, badge: 'Phase 4' },
  { name: 'Life Insights', path: '/app/insights', icon: Lightbulb, badge: 'Phase 4' },
];


export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--color-cream-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        flexShrink: 0,
      }}
    >
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px 28px 12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <Network size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--color-deep-cocoa)',
              lineHeight: '1.2',
            }}
          >
            LIFENEXUS
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--color-muted-brown)' }}>Memory Engine</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-light-brown)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '4px 14px',
            marginBottom: '4px',
          }}
        >
          Phase 3 Core
        </span>

        {ACTIVE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-nexus-orange)' : 'var(--color-muted-brown)',
                backgroundColor: isActive ? 'var(--color-peach-light)' : 'transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        <div style={{ height: '1px', backgroundColor: 'var(--color-border-subtle)', margin: '12px 14px' }} />

        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-light-brown)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '4px 14px',
            marginBottom: '4px',
          }}
        >
          AI Pipeline (Upcoming)
        </span>

        {UPCOMING_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--color-light-brown)',
                cursor: 'not-allowed',
                opacity: 0.7,
              }}
              title="Available in Phase 4: AI Document Intelligence"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={17} />
                <span>{item.name}</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-peach-light)',
                  color: 'var(--color-nexus-orange)',
                  fontWeight: 600,
                }}
              >
                {item.badge}
              </span>
            </div>
          );
        })}
      </nav>


      {/* Bottom Tagline info */}
      <div
        style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-warm-cream)',
          border: '1px solid var(--color-border-subtle)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontStyle: 'italic' }}>
          "Everything you've done. Connected."
        </p>
      </div>
    </aside>
  );
};
