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
  { name: 'Life Search', path: '/app/search', icon: Search },
  { name: 'Life Timeline', path: '/app/timeline', icon: Clock },
  { name: 'Life Insights', path: '/app/insights', icon: Lightbulb },
  { name: 'Life Graph', path: '/app/graph', icon: Network },
  { name: 'Documents', path: '/app/documents', icon: FileText },
  { name: 'Import Documents', path: '/app/import', icon: UploadCloud },
  { name: 'Privacy Center', path: '/app/privacy', icon: ShieldCheck },
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
          Personal Workspace
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
