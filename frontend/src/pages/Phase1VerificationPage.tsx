import React, { useEffect, useState } from 'react';
import { Network, Server, Globe, CheckCircle2, XCircle, RefreshCw, Layers } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { fetchHealth } from '../services/api.js';
import { ApiResponse } from '../types/index.js';

export const Phase1VerificationPage: React.FC = () => {
  const [healthData, setHealthData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkBackendHealth = async () => {
    setIsLoading(true);
    const result = await fetchHealth();
    setHealthData(result);
    setLastChecked(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const isBackendConnected = healthData?.success && healthData.data?.status === 'healthy';

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
      <div style={{ maxWidth: '720px', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Brand Header */}
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
              fontSize: '36px',
              fontWeight: 800,
              letterSpacing: '-1px',
              marginBottom: '6px',
              color: 'var(--color-deep-cocoa)',
            }}
          >
            LIFENEXUS
          </h1>

          <p
            style={{
              fontSize: '16px',
              fontStyle: 'italic',
              color: 'var(--color-muted-brown)',
              marginBottom: '12px',
            }}
          >
            "Everything you've done. Connected."
          </p>

          <Badge variant="peach" style={{ fontSize: '13px', padding: '4px 14px' }}>
            Phase 1: Application Foundation & System Verification
          </Badge>
        </div>

        {/* System Status Section */}
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
              <Layers size={20} color="var(--color-nexus-orange)" />
              System Status
            </h2>

            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
              onClick={checkBackendHealth}
              disabled={isLoading}
            >
              Refresh Status
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            {/* Frontend Status */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="var(--color-nexus-orange)" />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Frontend</span>
                </div>
                <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                  Running
                </Badge>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                React 18 + Vite + TypeScript Shell
              </p>
            </div>

            {/* Backend Status */}
            <div
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isBackendConnected ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                border: `1px solid ${isBackendConnected ? 'rgba(61, 139, 104, 0.3)' : 'rgba(198, 90, 85, 0.3)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={18} color={isBackendConnected ? 'var(--color-success)' : 'var(--color-error)'} />
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>Backend</span>
                </div>
                {isBackendConnected ? (
                  <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="error" icon={<XCircle size={12} />}>
                    Not Connected
                  </Badge>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                {isBackendConnected ? 'Node.js Express API (Healthy)' : 'Check server on port 5000'}
              </p>
            </div>
          </div>

          {/* Health Endpoint Details */}
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-warm-cream)',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600 }}>Health Check Endpoint (`GET /api/health`):</span>
              <span style={{ color: 'var(--color-muted-brown)', fontSize: '11px' }}>
                Last evaluated: {lastChecked || 'Loading...'}
              </span>
            </div>
            <pre
              style={{
                backgroundColor: '#2A211D',
                color: '#FFF8F3',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                overflowX: 'auto',
                fontFamily: 'monospace',
              }}
            >
              {JSON.stringify(healthData || { status: 'Evaluating endpoint...' }, null, 2)}
            </pre>
          </div>
        </Card>

        {/* Planned Route Architecture */}
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>
            Phase 1 Scaffolded Route Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'var(--color-warm-cream)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <code>/</code> (Active Shell)
            </div>
            <div style={{ padding: '10px', background: 'var(--color-warm-cream)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <code>/login</code> (Phase 2)
            </div>
            <div style={{ padding: '10px', background: 'var(--color-warm-cream)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <code>/register</code> (Phase 2)
            </div>
            <div style={{ padding: '10px', background: 'var(--color-warm-cream)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
              <code>/app</code> (Workspace)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
