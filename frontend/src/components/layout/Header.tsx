import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { LogOut, User as UserIcon, UploadCloud } from 'lucide-react';
import { Button } from '../common/Button.js';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: 'var(--color-cream-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        flexShrink: 0,
      }}
    >
      {/* Quick contextual greeting */}
      <div>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
          Welcome back, {user?.name || 'Explorer'}
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
          Your personal life knowledge graph is active.
        </p>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          variant="primary"
          size="sm"
          icon={<UploadCloud size={16} />}
          onClick={() => navigate('/app/import')}
        >
          Add Memory
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: '1px solid var(--color-border)' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-peach-light)',
              color: 'var(--color-nexus-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserIcon size={18} />
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title="Log out"
            aria-label="Log out"
            style={{
              padding: '6px',
              color: 'var(--color-muted-brown)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
