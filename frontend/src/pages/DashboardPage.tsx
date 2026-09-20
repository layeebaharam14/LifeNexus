import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Network,
  Clock,
  Search,
  UploadCloud,
  FileText,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Top Banner with Search Bar */}
      <div
        style={{
          background: 'var(--gradient-brand)',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 36px',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '650px' }}>
          <Badge variant="peach" style={{ marginBottom: '16px', background: 'rgba(255, 255, 255, 0.25)', color: '#FFFFFF', border: 'none' }}>
            <Sparkles size={14} /> Personal Memory Core Active
          </Badge>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: '1.2',
              marginBottom: '12px',
            }}
          >
            What would you like to remember today?
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '24px' }}>
            Search across your invoices, warranties, certificates, trips, and milestones with grounded provenance.
          </p>

          <div
            onClick={() => navigate('/app/search')}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '12px 18px',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              color: 'var(--color-muted-brown)',
              gap: '12px',
            }}
          >
            <Search size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '15px', flex: 1 }}>
              Try "Tell me everything about my laptop" or "When does insurance expire?"
            </span>
            <Button variant="primary" size="sm">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <Card onClick={() => navigate('/app/graph')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>Connected Items</span>
            <Network size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>124</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Entities mapped in Life Graph
          </p>
        </Card>

        <Card onClick={() => navigate('/app/timeline')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>Life Milestones</span>
            <Clock size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>18</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Chronological events detected
          </p>
        </Card>

        <Card onClick={() => navigate('/app/graph')} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>Discovered Links</span>
            <Sparkles size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>67</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Cross-document connections
          </p>
        </Card>

        <Card onClick={() => navigate('/app/insights')} style={{ cursor: 'pointer', background: 'var(--color-warning-bg)', borderColor: 'rgba(215, 149, 50, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-warning)' }}>Attention Needed</span>
            <AlertTriangle size={20} color="var(--color-warning)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-warning)' }}>3</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Upcoming warranty & renewal alerts
          </p>
        </Card>
      </div>

      {/* Two Column Layout: Recent Files & Attention Items */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Ingested Files */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Recently Ingested Documents</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/documents')}>
              View All <ArrowRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { name: 'laptop_invoice.txt', type: 'Invoice', date: 'March 14, 2026', entities: '5 Entities' },
              { name: 'laptop_warranty.txt', type: 'Warranty', date: 'March 14, 2026', entities: '4 Entities' },
              { name: 'laptop_repair_receipt.txt', type: 'Repair Slip', date: 'July 22, 2026', entities: '3 Entities' },
              { name: 'ai_internship_certificate.txt', type: 'Certificate', date: 'August 31, 2025', entities: '4 Entities' },
            ].map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warm-cream)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="var(--color-nexus-orange)" />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>{file.date}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Badge variant="peach">{file.type}</Badge>
                  <Badge variant="neutral">{file.entities}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Actionable Insights Preview */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Proactive Expiration Insights</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/insights')}>
              Explore All <ArrowRight size={14} />
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(215, 149, 50, 0.3)',
                background: 'var(--color-warning-bg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                  Health Shield Insurance Policy
                </h4>
                <Badge variant="warning">Due in 24 Days</Badge>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
                Expires on October 14, 2026. Premium: ₹13,216.
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-light-brown)', marginTop: '6px' }}>
                Source: health_insurance_renewal.txt
              </p>
            </div>

            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-warm-cream)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                  ASUS Vivobook Extended Care
                </h4>
                <Badge variant="success">Active (18 Mos Left)</Badge>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
                Valid until March 14, 2028. Serial: NX8821-ASUS-2026.
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-light-brown)', marginTop: '6px' }}>
                Source: laptop_warranty.txt
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
