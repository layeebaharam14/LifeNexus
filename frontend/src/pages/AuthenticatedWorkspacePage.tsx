import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, ShieldCheck, User, Mail, Key, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const AuthenticatedWorkspacePage: React.FC = () => {
  const { user, token, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-warm-cream)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        color: 'var(--color-deep-cocoa)',
      }}
    >
      <div style={{ maxWidth: '640px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Workspace Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px',
            }}
          >
            <Network size={32} color="#FFFFFF" />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-1px',
              marginBottom: '6px',
            }}
          >
            LIFENEXUS
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-muted-brown)' }}>
            Welcome, <strong>{user?.name || 'Explorer'}</strong>
          </p>
        </div>

        {/* Authenticated Verification Card */}
        <Card style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '18px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <ShieldCheck size={22} color="var(--color-success)" />
              Authenticated Workspace
            </h2>

            <Badge variant="success" icon={<CheckCircle2 size={12} />}>
              JWT Session Verified
            </Badge>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <User size={18} color="var(--color-nexus-orange)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-muted-brown)', textTransform: 'uppercase', fontWeight: 600 }}>User Name</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name}</p>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Mail size={18} color="var(--color-nexus-orange)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-muted-brown)', textTransform: 'uppercase', fontWeight: 600 }}>Email Address</span>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>{user?.email}</p>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Key size={18} color="var(--color-nexus-orange)" />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '11px', color: 'var(--color-muted-brown)', textTransform: 'uppercase', fontWeight: 600 }}>User Scoped ID</span>
                <p style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-deep-cocoa)' }}>{user?.id}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
              Session Token: {token ? `${token.substring(0, 16)}...` : 'None'}
            </span>

            <Button variant="danger" icon={<LogOut size={16} />} onClick={handleLogout}>
              Log Out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
