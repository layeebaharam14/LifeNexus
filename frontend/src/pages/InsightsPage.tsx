import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  Clock,
  DollarSign,
  Layers,
  Network,
  Award,
  FileText,
  ExternalLink,
  Calendar,
  X,
  Filter,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { getInsights, GroundedInsight, InsightsResponse } from '../services/insightsService.js';

const PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: 'orange' | 'peach' | 'neutral' | 'warning' | 'error'; icon: any; border: string; bg: string }
> = {
  attention: {
    label: 'ATTENTION',
    variant: 'orange',
    icon: AlertTriangle,
    border: 'rgba(244, 122, 69, 0.4)',
    bg: 'rgba(244, 122, 69, 0.05)',
  },
  notable: {
    label: 'NOTABLE',
    variant: 'peach',
    icon: Sparkles,
    border: 'rgba(255, 176, 124, 0.4)',
    bg: '#FFFFFF',
  },
  informational: {
    label: 'INFORMATIONAL',
    variant: 'neutral',
    icon: Info,
    border: 'var(--color-border)',
    bg: '#FFFFFF',
  },
};

const CATEGORY_ICON_CONFIG: Record<string, any> = {
  Expiration: Clock,
  Financial: DollarSign,
  Pattern: Network,
  Milestone: Award,
  'Action Item': AlertTriangle,
};

export const InsightsPage: React.FC = () => {
  const navigate = useNavigate();

  // Data states
  const [insights, setInsights] = useState<GroundedInsight[]>([]);
  const [summary, setSummary] = useState<{ total: number; attention: number; notable: number; informational: number }>({
    total: 0,
    attention: 0,
    notable: 0,
    informational: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedInsight, setSelectedInsight] = useState<GroundedInsight | null>(null);

  // Load insights
  const loadInsights = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getInsights();
      if (response.success && response.data) {
        setInsights(response.data.insights || []);
        setSummary(response.data.summary || { total: 0, attention: 0, notable: 0, informational: 0 });
      } else {
        setError(response.error || 'Failed to surface insights.');
      }
    } catch (err: any) {
      setError(err?.message || 'Insight generation failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Distinct categories in the current insight set
  const categories = useMemo(() => {
    const set = new Set<string>();
    insights.forEach((i) => set.add(i.category));
    return Array.from(set).sort();
  }, [insights]);

  // Filtered insights list
  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      const priorityMatch = priorityFilter === 'ALL' || i.priority.toLowerCase() === priorityFilter.toLowerCase();
      const categoryMatch = categoryFilter === 'ALL' || i.category.toLowerCase() === categoryFilter.toLowerCase();
      return priorityMatch && categoryMatch;
    });
  }, [insights, priorityFilter, categoryFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'var(--gradient-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-deep-cocoa)',
              }}
            >
              Life Insights
            </h2>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-muted-brown)',
              marginTop: '6px',
              maxWidth: '650px',
            }}
          >
            Useful observations, proactive expiration notices, spending summaries, and pattern
            discoveries surfaced strictly from your verified documents and memory graph.
          </p>
        </div>

        {/* Real Summary Metrics Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {summary.attention > 0 && (
            <Badge variant="orange">
              <AlertTriangle size={13} style={{ marginRight: '4px' }} />
              {summary.attention} Attention Needed
            </Badge>
          )}
          <Badge variant="peach">
            <Sparkles size={13} style={{ marginRight: '4px' }} />
            {summary.total} Total Insights
          </Badge>
          <button
            onClick={loadInsights}
            title="Refresh insights"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-cream-surface)',
              color: 'var(--color-muted-brown)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      {insights.length > 0 && (
        <Card style={{ padding: '14px 18px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Priority Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)', marginRight: '4px' }}>
                Priority:
              </span>
              {[
                { id: 'ALL', label: 'All Insights', count: summary.total },
                { id: 'attention', label: 'Attention Needed', count: summary.attention },
                { id: 'notable', label: 'Notable', count: summary.notable },
                { id: 'informational', label: 'Informational', count: summary.informational },
              ].map((p) => {
                const isCur = priorityFilter.toLowerCase() === p.id.toLowerCase();
                return (
                  <button
                    key={p.id}
                    onClick={() => setPriorityFilter(p.id)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '12px',
                      fontWeight: isCur ? 700 : 500,
                      background: isCur ? 'var(--color-nexus-orange)' : 'var(--color-warm-cream)',
                      color: isCur ? '#FFFFFF' : 'var(--color-deep-cocoa)',
                      border: '1px solid',
                      borderColor: isCur ? 'var(--color-nexus-orange)' : 'var(--color-border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {p.label} ({p.count})
                  </button>
                );
              })}
            </div>

            {/* Category Filter Pills (if multiple categories) */}
            {categories.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-muted-brown)', marginRight: '4px' }}>
                  Category:
                </span>
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  style={{
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: categoryFilter === 'ALL' ? 700 : 500,
                    background: categoryFilter === 'ALL' ? 'var(--color-peach-light)' : 'transparent',
                    color: 'var(--color-deep-cocoa)',
                    border: '1px solid var(--color-border-subtle)',
                    cursor: 'pointer',
                  }}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: categoryFilter === cat ? 700 : 500,
                      background: categoryFilter === cat ? 'var(--color-peach-light)' : 'transparent',
                      color: 'var(--color-deep-cocoa)',
                      border: '1px solid var(--color-border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && insights.length === 0 ? (
        <Card
          style={{
            minHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid var(--color-peach-light)',
              borderTopColor: 'var(--color-nexus-orange)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
            Analyzing connected memory store...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
            Surfacing deterministic attention items, expirations, and patterns
          </p>
        </Card>
      ) : insights.length === 0 ? (
        /* Empty State: No insights yet */
        <EmptyState
          icon={<Sparkles size={32} />}
          title="Your insights are still forming."
          description="Connect more documents and memories to surface useful patterns, important dates and things that may need attention."
          actionText="Add Documents"
          onAction={() => navigate('/app/documents')}
        />
      ) : filteredInsights.length === 0 ? (
        /* Empty Filter State */
        <EmptyState
          icon={<Filter size={32} />}
          title="No insights match the selected filter."
          description="Try selecting a different priority or category filter."
          actionText="Clear Filters"
          onAction={() => {
            setPriorityFilter('ALL');
            setCategoryFilter('ALL');
          }}
        />
      ) : (
        /* Insights Grid Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {filteredInsights.map((insight) => {
            const pConfig = PRIORITY_CONFIG[insight.priority] || PRIORITY_CONFIG.informational;
            const CategoryIcon = CATEGORY_ICON_CONFIG[insight.category] || Sparkles;

            return (
              <Card
                key={insight.id}
                onClick={() => setSelectedInsight(insight)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: pConfig.bg,
                  borderColor: pConfig.border,
                  borderWidth: insight.priority === 'attention' ? '2px' : '1px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  padding: '22px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: insight.priority === 'attention' ? '0 4px 14px rgba(244, 122, 69, 0.12)' : 'var(--shadow-sm)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <div>
                  {/* Top Badges: Category & Priority */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CategoryIcon size={14} color="var(--color-nexus-orange)" />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                        {insight.category}
                      </span>
                    </div>

                    <Badge variant={pConfig.variant} style={{ fontSize: '10px' }}>
                      {pConfig.label}
                    </Badge>
                  </div>

                  {/* Insight Title */}
                  <h3
                    style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'var(--color-deep-cocoa)',
                      lineHeight: '1.3',
                      marginBottom: '8px',
                    }}
                  >
                    {insight.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'var(--color-muted-brown)',
                      lineHeight: '1.5',
                      marginBottom: '12px',
                    }}
                  >
                    {insight.description}
                  </p>
                </div>

                {/* Bottom Provenance & Link Row */}
                <div>
                  {/* Evidence Snippet Callout (if available) */}
                  {insight.evidence && insight.evidence.length > 0 && (
                    <div
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderLeft: '2px solid var(--color-nexus-orange)',
                        fontSize: '11px',
                        color: 'var(--color-muted-brown)',
                        marginBottom: '12px',
                        fontStyle: 'italic',
                      }}
                    >
                      "{insight.evidence[0]}"
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '10px',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-muted-brown)' }}>
                      <FileText size={13} color="var(--color-nexus-orange)" />
                      <span>
                        {insight.sourceDocuments && insight.sourceDocuments.length > 0
                          ? insight.sourceDocuments[0].name
                          : 'Grounded Memory'}
                      </span>
                    </div>

                    <span
                      style={{
                        color: 'var(--color-nexus-orange)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                      }}
                    >
                      Details &rarr;
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Insight Details Inspection Modal */}
      {selectedInsight && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 19, 17, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setSelectedInsight(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Badge variant="peach">{selectedInsight.category}</Badge>
                  <Badge variant={PRIORITY_CONFIG[selectedInsight.priority]?.variant || 'neutral'}>
                    {selectedInsight.priority.toUpperCase()}
                  </Badge>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-deep-cocoa)',
                    lineHeight: '1.3',
                  }}
                >
                  {selectedInsight.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInsight(null)}
                style={{
                  background: 'var(--color-warm-cream)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  color: 'var(--color-muted-brown)',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Description Box */}
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: 'var(--color-deep-cocoa)',
              }}
            >
              {selectedInsight.description}
            </div>

            {/* Supporting Evidence Quotes */}
            {selectedInsight.evidence && selectedInsight.evidence.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-muted-brown)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Grounded Evidence
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {selectedInsight.evidence.map((ev, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF',
                        border: '1px solid var(--color-border-subtle)',
                        fontSize: '13px',
                        color: 'var(--color-deep-cocoa)',
                        fontStyle: 'italic',
                      }}
                    >
                      "{ev}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Documents Provenance */}
            {selectedInsight.sourceDocuments && selectedInsight.sourceDocuments.length > 0 && (
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--color-muted-brown)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Source Document Provenance
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  {selectedInsight.sourceDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedInsight(null);
                        navigate('/app/documents');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-warm-cream)',
                        border: '1px solid var(--color-border-subtle)',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={15} color="var(--color-nexus-orange)" />
                        <span style={{ fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
                          {doc.name}
                        </span>
                        <Badge variant="neutral" style={{ fontSize: '10px' }}>
                          {doc.type || 'Document'}
                        </Badge>
                      </div>
                      <ExternalLink size={13} color="var(--color-muted-brown)" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cross-Link Actions to Life Graph / Timeline */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                borderTop: '1px solid var(--color-border-subtle)',
                paddingTop: '14px',
              }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedInsight(null);
                  navigate('/app/graph');
                }}
                style={{ flex: 1 }}
              >
                <Network size={15} style={{ marginRight: '6px' }} /> View in Life Graph
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setSelectedInsight(null);
                  navigate('/app/timeline');
                }}
                style={{ flex: 1 }}
              >
                <Clock size={15} style={{ marginRight: '6px' }} /> View in Timeline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
