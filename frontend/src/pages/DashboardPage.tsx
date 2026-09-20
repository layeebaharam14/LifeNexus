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
import { getMemoryStats, MemoryStats } from '../services/memoryService.js';
import { getInsights, GroundedInsight } from '../services/insightsService.js';
import { DocumentRecord } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState<DocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);
  const [memStats, setMemStats] = useState<MemoryStats>({ memories: 0, entities: 0, relationships: 0, timelineEvents: 0 });
  const [attentionCount, setAttentionCount] = useState<number>(0);
  const [topInsights, setTopInsights] = useState<GroundedInsight[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

    const fetchMemStats = async () => {
      try {
        const res = await getMemoryStats();
        if (res.success && res.data?.stats) {
          setMemStats(res.data.stats);
        }
      } catch (_err) {
        // Stats remain zero if unavailable
      }
    };

    const fetchInsightsData = async () => {
      try {
        const res = await getInsights();
        if (res.success && res.data) {
          setAttentionCount(res.data.summary.attention);
          setTopInsights(res.data.insights.slice(0, 3));
        }
      } catch (_err) {
        // Handled gracefully
      }
    };

    fetchRecentDocs();
    fetchMemStats();
    fetchInsightsData();
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
            <Sparkles size={14} /> Personal Memory Engine Active
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
            Everything you've done. Connected.
          </h2>
          <p style={{ fontSize: '15px', opacity: 0.95, marginBottom: '24px' }}>
            Natural-language search, connected entity graph, life timeline, and proactive personal insights across your personal documents.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '6px 12px 6px 16px',
              boxShadow: 'var(--shadow-md)',
              gap: '10px',
            }}
          >
            <Search size={20} color="var(--color-nexus-orange)" />
            <input
              type="text"
              placeholder="What would you like to remember? (e.g. laptop, warranty, flights)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your memory"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                color: 'var(--color-deep-cocoa)',
                padding: '8px 0',
                backgroundColor: 'transparent',
              }}
            />
            <Button variant="primary" size="sm" type="submit">
              Ask Memory
            </Button>
          </form>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', opacity: 0.9 }}>
            <span>Or add new records:</span>
            <button
              onClick={() => navigate('/app/import')}
              style={{
                color: '#FFFFFF',
                textDecoration: 'underline',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Import Documents &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
        }}
      >
        <Card
          onClick={() => navigate('/app/graph')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
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
            {memStats.entities}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-nexus-orange)', marginTop: '4px', fontWeight: 500 }}>
            View Life Graph &rarr;
          </p>
        </Card>

        <Card
          onClick={() => navigate('/app/timeline')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
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
            {memStats.timelineEvents}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-nexus-orange)', marginTop: '4px', fontWeight: 500 }}>
            View Life Timeline &rarr;
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
            {memStats.relationships}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Cross-document connections
          </p>
        </Card>

        <Card
          onClick={() => navigate('/app/insights')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
        >
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
            <AlertTriangle size={20} color={attentionCount > 0 ? 'var(--color-nexus-orange)' : 'var(--color-muted-brown)'} />
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: attentionCount > 0 ? 'var(--color-nexus-orange)' : 'var(--color-deep-cocoa)' }}>
            {attentionCount}
          </div>
          <p style={{ fontSize: '12px', color: attentionCount > 0 ? 'var(--color-nexus-orange)' : 'var(--color-muted-brown)', marginTop: '4px', fontWeight: 500 }}>
            {attentionCount > 0 ? `${attentionCount} item(s) require action →` : 'No upcoming alerts'}
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

        {/* Proactive Life Insights Card */}
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
              Proactive Life Insights
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/insights')}>
              View All <ArrowRight size={14} />
            </Button>
          </div>

          {topInsights.length === 0 ? (
            <div
              style={{
                padding: '32px 16px',
                textAlign: 'center',
                backgroundColor: 'var(--color-warm-cream)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <Sparkles size={28} color="var(--color-muted-brown)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-deep-cocoa)', marginBottom: '4px' }}>
                Your insights are forming
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                Import documents and run AI understanding to surface grounded attention items and patterns.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topInsights.map((ins) => (
                <div
                  key={ins.id}
                  onClick={() => navigate('/app/insights')}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: ins.priority === 'attention' ? 'rgba(244, 122, 69, 0.08)' : 'var(--color-warm-cream)',
                    border: '1px solid',
                    borderColor: ins.priority === 'attention' ? 'rgba(244, 122, 69, 0.3)' : 'var(--color-border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                      {ins.title}
                    </span>
                    <Badge variant={ins.priority === 'attention' ? 'orange' : 'peach'} style={{ fontSize: '10px' }}>
                      {ins.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', lineHeight: '1.4' }}>
                    {ins.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
