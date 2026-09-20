import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@lifenexus.io');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Initial mock login (Phase 1 structure ready for API)
    setTimeout(() => {
      login('mock_jwt_token_alex_morgan', {
        id: 'usr_alex_morgan_001',
        name: 'Alex Morgan',
        email: email,
      });
      setLoading(false);
      navigate('/app/dashboard');
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-warm-cream)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <Card style={{ maxWidth: '440px', width: '100%', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px',
            }}
          >
            <Network size={28} color="#FFFFFF" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-deep-cocoa)',
              marginBottom: '6px',
            }}
          >
            Welcome to LIFENEXUS
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
            Sign in to access your personal knowledge workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--color-light-brown)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-warm-cream)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--color-light-brown)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-warm-cream)',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={<ArrowRight size={18} />}>
            Sign In to Workspace
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--color-muted-brown)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-nexus-orange)', fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </Card>
    </div>
  );
};
