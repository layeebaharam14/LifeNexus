import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { getDocuments } from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<DocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentDocs = async () => {
      try {
        const res = await getDocuments();
        if (res.success && res.data?.documents) {
          setRecentDocs(res.data.documents.slice(0, 4));
        }
      } catch (_err) {
        // Handle gracefully
      } finally {
        setIsLoadingDocs(false);
      }
    };

    fetchRecentDocs();
  }, []);

  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

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
          <Badge
            variant="peach"
            style={{
              marginBottom: '16px',
              background: 'rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              border: 'none',
            }}
          >
            <ShieldCheck size={14} /> Phase 3 Document Ingestion Active
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
            Universal Document Repository
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.9, marginBottom: '24px' }}>
            Securely import and store your personal invoices, warranties, certificates, tickets, and notes.
          </p>

          <div
            onClick={() => navigate('/app/import')}
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
            <UploadCloud size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '15px', flex: 1, color: 'var(--color-deep-cocoa)' }}>
              Import new documents into your private user-scoped storage
            </span>
            <Button variant="primary" size="sm">
              Import Files
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Row — Honest Phase 3 State (Zero states until Phase 4 AI activation) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Connected Items
            </span>
            <Network size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            0
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Entities mapped in Life Graph
          </p>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Life Milestones
            </span>
            <Clock size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            0
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Chronological events detected
          </p>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Discovered Links
            </span>
            <Sparkles size={20} color="var(--color-nexus-orange)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            0
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Cross-document connections
          </p>
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Attention Needed
            </span>
            <AlertTriangle size={20} color="var(--color-muted-brown)" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            0
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            No upcoming alerts
          </p>
        </Card>
      </div>

      {/* Two Column Layout: Recent Files & Attention Items */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Real User Ingested Files */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
              Recently Ingested Documents
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/documents')}>
              View All <ArrowRight size={14} />
            </Button>
          </div>

          {isLoadingDocs ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)', fontSize: '14px' }}>
              Loading documents...
            </div>
          ) : recentDocs.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                backgroundColor: 'var(--color-warm-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <FileText size={28} color="var(--color-muted-brown)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-cocoa)', marginBottom: '4px' }}>
                No documents uploaded yet
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginBottom: '16px' }}>
                Import your receipts, warranties, or certificates to start.
              </p>
              <Button variant="primary" size="sm" icon={<UploadCloud size={14} />} onClick={() => navigate('/app/import')}>
                Import Documents
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentDocs.map((file) => (
                <div
                  key={file.id}
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
                      <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
                        {file.originalName}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                        {formatDate(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Badge variant="peach">{file.documentType || 'Document'}</Badge>
                    <Badge variant="success">PROCESSED</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Proactive Expiration Insights */}
        <Card>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
              Proactive Expiration Insights
            </h3>
            <Badge variant="peach">Phase 4 Feature</Badge>
          </div>

          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              backgroundColor: 'var(--color-warm-cream)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-subtle)',
            }}
          >
            <Clock size={28} color="var(--color-muted-brown)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-cocoa)', marginBottom: '4px' }}>
              No active expiration alerts
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
              Proactive warranty, subscription, and policy expiration tracking will activate after AI Understanding in Phase 4.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
