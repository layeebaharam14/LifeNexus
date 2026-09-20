import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Network, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/common/Button.js';
import { Card } from '../components/common/Card.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please fill in both email and password.');
      setIsSubmitting(false);
      return;
    }

    const res = await loginUser(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/app');
    } else {
      setError(res.error || 'Login failed. Please check your credentials.');
    }
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
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '16px',
            }}
          >
            <Network size={30} color="#FFFFFF" />
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

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid rgba(198, 90, 85, 0.3)',
              color: 'var(--color-error)',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--color-light-brown)" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-warm-cream)',
                  fontSize: '14px',
                  color: 'var(--color-deep-cocoa)',
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-warm-cream)',
                  fontSize: '14px',
                  color: 'var(--color-deep-cocoa)',
                }}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} icon={<ArrowRight size={18} />}>
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
