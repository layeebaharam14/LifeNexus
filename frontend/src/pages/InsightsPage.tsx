import React from 'react';
import { AlertTriangle, Clock, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';

export const InsightsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
          Life Insights & Proactive Intelligence
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          Automated discoveries, expiring commitments, and recurring patterns derived strictly from your data.
        </p>
      </div>

      {/* Expirations Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="var(--color-nexus-orange)" /> Upcoming Expirations & Renewals
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <Card style={{ background: 'var(--color-warning-bg)', borderColor: 'rgba(215, 149, 50, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Badge variant="warning">Expires in 24 Days</Badge>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Health Insurance</span>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Star Health Comprehensive Shield</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
              Policy #P-882190-2026 renewal deadline is October 14, 2026. Premium: ₹13,216.
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-light-brown)' }}>
              Source: health_insurance_renewal.txt
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Badge variant="success">Active (18 Months Left)</Badge>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Hardware Warranty</span>
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 700 }}>ASUS Vivobook Extended Care</h4>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
              2-Year Protection plan valid until March 14, 2028. Serial: NX8821-ASUS-2026.
            </p>
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--color-light-brown)' }}>
              Source: laptop_warranty.txt
            </div>
          </Card>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RefreshCw size={20} color="var(--color-nexus-orange)" /> Recurring Subscriptions
        </h3>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>CloudNexus Pro Developer Tier</h4>
              <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
                ₹1,768.82 / month (Auto-debit on card ending in 4092). Next renewal: Sep 1, 2026.
              </p>
            </div>
            <Badge variant="peach">Monthly Recurring</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
