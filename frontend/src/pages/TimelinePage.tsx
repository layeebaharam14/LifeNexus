import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  FileText,
  Sparkles,
  ShoppingBag,
  Award,
  Briefcase,
  DollarSign,
  Plane,
  ShieldCheck,
  User,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Search,
  X,
  Layers,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import {
  getTimeline,
  getEntities,
  TimelineEventRecord,
  EntityRecord,
} from '../services/memoryService.js';
import { getDocuments } from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

// Category Configuration (LIFENEXUS Warm Theme)
const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    variant: 'orange' | 'peach' | 'success' | 'warning' | 'error' | 'neutral';
    icon: any;
    color: string;
  }
> = {
  Asset: { label: 'Asset', variant: 'orange', icon: ShoppingBag, color: '#F47A45' },
  Career: { label: 'Career', variant: 'peach', icon: Briefcase, color: '#EA580C' },
  Education: { label: 'Education', variant: 'warning', icon: Award, color: '#F59E0B' },
  Financial: { label: 'Financial', variant: 'warning', icon: DollarSign, color: '#D97706' },
  Travel: { label: 'Travel', variant: 'success', icon: Plane, color: '#10B981' },
  Administrative: { label: 'Administrative', variant: 'neutral', icon: ShieldCheck, color: '#78716C' },
  Personal: { label: 'Personal', variant: 'neutral', icon: User, color: '#8D7B75' },
};

function getCategoryConfig(category: string) {
  return (
    CATEGORY_CONFIG[category] ||
    CATEGORY_CONFIG[category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase()] ||
    CATEGORY_CONFIG.Personal
  );
}

/**
 * Formats event date strictly respecting its stored date precision
 */
function formatEventDate(
  dateStr: string,
  precision: string
): { formatted: string; year: string; monthYear: string } {
  if (!dateStr) {
    return { formatted: 'Date unknown', year: 'Unknown', monthYear: 'Unknown' };
  }

  try {
    const parts = dateStr.split('-');
    const year = parts[0] || dateStr;

    if (precision === 'year') {
      return { formatted: year, year, monthYear: year };
    }

    if (precision === 'month' && parts.length >= 2) {
      const monthIndex = parseInt(parts[1], 10) - 1;
      const monthName = new Date(parseInt(year, 10), monthIndex, 1).toLocaleString(undefined, {
        month: 'long',
      });
      const monthYear = `${monthName} ${year}`;
      return { formatted: monthYear, year, monthYear };
    }

    if (precision === 'range') {
      return { formatted: dateStr, year, monthYear: dateStr };
    }

    // Exact date precision
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const formatted = parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const monthYear = parsed.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      });
      return { formatted, year, monthYear };
    }
  } catch {
    // Graceful fallback
  }

  return { formatted: dateStr, year: dateStr.substring(0, 4), monthYear: dateStr };
}

export const TimelinePage: React.FC = () => {
  const navigate = useNavigate();

  // Data states
  const [events, setEvents] = useState<TimelineEventRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & interaction states
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default chronological: Oldest First
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventRecord | null>(null);

  // Load real data from Phase 4B memory endpoint & documents
  const loadTimelineData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [timelineRes, docsRes, entitiesRes] = await Promise.allSettled([
        getTimeline(),
        getDocuments(),
        getEntities(),
      ]);

      if (timelineRes.status === 'fulfilled' && timelineRes.value.success && timelineRes.value.data) {
        setEvents(timelineRes.value.data.events || []);
      }
      if (docsRes.status === 'fulfilled' && docsRes.value.success && docsRes.value.data) {
        setDocuments(docsRes.value.data.documents || []);
      }
      if (entitiesRes.status === 'fulfilled' && entitiesRes.value.success && entitiesRes.value.data) {
        setEntities(entitiesRes.value.data.entities || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load timeline records.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTimelineData();
  }, [loadTimelineData]);

  // Lookup maps for fast provenance resolution
  const docMap = useMemo(() => {
    const map = new Map<string, DocumentRecord>();
    documents.forEach((d) => {
      map.set(d.id, d);
      if ((d as any)._id) map.set((d as any)._id.toString(), d);
    });
    return map;
  }, [documents]);

  const entityMap = useMemo(() => {
    const map = new Map<string, EntityRecord>();
    entities.forEach((e) => {
      map.set(e.id, e);
      if ((e as any)._id) map.set((e as any)._id.toString(), e);
    });
    return map;
  }, [entities]);

  // Sorted and filtered events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Filter by category
    if (selectedCategory !== 'ALL') {
      result = result.filter(
        (e) => (e.category || '').toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => {
        const titleMatch = (e.title || '').toLowerCase().includes(q);
        const descMatch = (e.description || '').toLowerCase().includes(q);
        const catMatch = (e.category || '').toLowerCase().includes(q);
        const dateMatch = (e.date || '').toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch || dateMatch;
      });
    }

    // Chronological sorting: 'asc' = oldest first (default), 'desc' = newest first
    result.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      if (sortOrder === 'asc') {
        return dateA.localeCompare(dateB);
      } else {
        return dateB.localeCompare(dateA);
      }
    });

    return result;
  }, [events, selectedCategory, searchQuery, sortOrder]);

  // Available categories with counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: events.length };
    events.forEach((e) => {
      const cat = e.category || 'Personal';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [events]);

  // Earliest and latest event dates
  const timelineSummary = useMemo(() => {
    if (events.length === 0) return null;
    const sorted = [...events].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    const earliest = sorted[0];
    const latest = sorted[sorted.length - 1];

    return {
      total: events.length,
      earliestFormatted: formatEventDate(earliest.date, earliest.datePrecision).formatted,
      latestFormatted: formatEventDate(latest.date, latest.datePrecision).formatted,
    };
  }, [events]);

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
              <Clock size={20} color="#FFFFFF" />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-deep-cocoa)',
              }}
            >
              Life Timeline
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
            Chronological milestone chronicle automatically reconstructed from your verified
            documents, warranties, purchases, and credentials.
          </p>
        </div>

        {/* Real Summary Metrics Badges */}
        {timelineSummary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Badge variant="orange">
              <Calendar size={13} style={{ marginRight: '4px' }} />
              {timelineSummary.total} {timelineSummary.total === 1 ? 'Milestone' : 'Milestones'}
            </Badge>
            <Badge variant="peach">
              {timelineSummary.earliestFormatted} &rarr; {timelineSummary.latestFormatted}
            </Badge>
            <button
              onClick={loadTimelineData}
              title="Refresh timeline data"
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
        )}
      </div>

      {/* Control Bar: Filter Pills + Search + Sort Order Toggle */}
      {events.length > 0 && (
        <Card style={{ padding: '14px 18px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)', marginRight: '4px' }}>
                Category:
              </span>
              {Object.keys(categoryCounts).map((cat) => {
                const isCur = selectedCategory.toLowerCase() === cat.toLowerCase();
                const count = categoryCounts[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
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
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {cat === 'ALL' ? 'All Events' : cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Right Controls: Search + Sort Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Search in Timeline */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--color-warm-cream)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '4px 10px',
                  gap: '6px',
                }}
              >
                <Search size={14} color="var(--color-muted-brown)" />
                <input
                  type="text"
                  placeholder="Filter events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '12px',
                    width: '130px',
                    color: 'var(--color-deep-cocoa)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={12} color="var(--color-muted-brown)" />
                  </button>
                )}
              </div>

              {/* Chronological Sort Toggle (Oldest First / Newest First) */}
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-warm-cream)',
                  color: 'var(--color-deep-cocoa)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Toggle chronological sorting"
              >
                <ArrowUpDown size={13} color="var(--color-nexus-orange)" />
                <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && events.length === 0 ? (
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
            Loading your life milestones...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
            Retrieving chronological event records from memory store
          </p>
        </Card>
      ) : events.length === 0 ? (
        /* Empty State: No events recorded yet */
        <EmptyState
          icon={<Clock size={32} />}
          title="Your timeline is still forming."
          description="Build memory from your documents to turn important moments into a chronological view of your life."
          actionText="Go to Documents"
          onAction={() => navigate('/app/documents')}
        />
      ) : filteredEvents.length === 0 ? (
        /* Empty Filter State */
        <EmptyState
          icon={<Filter size={32} />}
          title="No events match your filter."
          description="Try selecting a different category or clearing your search term."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory('ALL');
            setSearchQuery('');
          }}
        />
      ) : (
        /* Continuous Chronological Timeline Spine */
        <div style={{ position: 'relative', paddingLeft: '36px', maxWidth: '850px' }}>
          {/* Vertical Continuous Spine Line */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '16px',
              bottom: '16px',
              width: '3px',
              background: 'linear-gradient(180deg, var(--color-nexus-orange) 0%, var(--color-apricot) 100%)',
              borderRadius: '2px',
            }}
          />

          {filteredEvents.map((event, idx) => {
            const catConfig = getCategoryConfig(event.category);
            const CatIcon = catConfig.icon;
            const { formatted, year } = formatEventDate(event.date, event.datePrecision);

            // Check if we should display a year marker header
            const prevEvent = idx > 0 ? filteredEvents[idx - 1] : null;
            const prevYear = prevEvent
              ? formatEventDate(prevEvent.date, prevEvent.datePrecision).year
              : null;
            const showYearHeader = idx === 0 || year !== prevYear;

            // Resolve source document names
            const sourceDocNames = (event.sourceDocIds || [])
              .map((id) => docMap.get(id)?.originalName)
              .filter(Boolean) as string[];

            return (
              <div key={event.id} style={{ marginBottom: '28px', position: 'relative' }}>
                {/* Year Marker Header */}
                {showYearHeader && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                      padding: '4px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-peach-light)',
                      border: '1px solid var(--color-soft-peach)',
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--color-nexus-orange)',
                    }}
                  >
                    <Calendar size={13} />
                    {year}
                  </div>
                )}

                {/* Spine Node Marker Dot */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-31px',
                    top: showYearHeader ? '50px' : '18px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: catConfig.color,
                    border: '3px solid var(--color-warm-cream)',
                    boxShadow: '0 0 0 2px ' + catConfig.color,
                    zIndex: 2,
                  }}
                />

                {/* Event Card */}
                <Card
                  onClick={() => setSelectedEvent(event)}
                  style={{
                    padding: '20px 24px',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {/* Top Row: Date + Category Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--color-deep-cocoa)',
                        }}
                      >
                        {formatted}
                      </span>
                      <Badge variant="neutral" style={{ fontSize: '11px', textTransform: 'capitalize' }}>
                        {event.datePrecision} date
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CatIcon size={14} color={catConfig.color} />
                      <Badge variant={catConfig.variant}>{catConfig.label}</Badge>
                    </div>
                  </div>

                  {/* Event Title */}
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: 'var(--color-deep-cocoa)',
                      lineHeight: '1.3',
                      marginBottom: '6px',
                    }}
                  >
                    {event.title}
                  </h3>

                  {/* Event Description */}
                  {event.description && (
                    <p
                      style={{
                        fontSize: '14px',
                        color: 'var(--color-muted-brown)',
                        lineHeight: '1.6',
                        marginBottom: '14px',
                      }}
                    >
                      {event.description}
                    </p>
                  )}

                  {/* Bottom Provenance Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-muted-brown)' }}>
                      <FileText size={14} color="var(--color-nexus-orange)" />
                      <span>
                        Source:{' '}
                        {sourceDocNames.length > 0
                          ? sourceDocNames.join(', ')
                          : `Document (${(event.sourceDocIds || []).length})`}
                      </span>
                    </div>

                    <span
                      style={{
                        color: 'var(--color-nexus-orange)',
                        fontWeight: 600,
                        fontSize: '11px',
                      }}
                    >
                      Inspect Details &rarr;
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Details Inspection Modal / Drawer */}
      {selectedEvent && (
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
          onClick={() => setSelectedEvent(null)}
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Badge variant={getCategoryConfig(selectedEvent.category).variant}>
                    {selectedEvent.category}
                  </Badge>
                  <Badge variant="neutral">{selectedEvent.datePrecision} precision</Badge>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-deep-cocoa)',
                    lineHeight: '1.3',
                  }}
                >
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
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

            {/* Date Details Box */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warm-cream)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <Calendar size={20} color="var(--color-nexus-orange)" />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-muted-brown)' }}>
                  CHRONOLOGICAL DATE
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                  {formatEventDate(selectedEvent.date, selectedEvent.datePrecision).formatted}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)' }}>
                  Raw value: <code>{selectedEvent.date}</code>
                </div>
              </div>
            </div>

            {/* Description / Evidence */}
            {selectedEvent.description && (
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
                  Event Evidence & Description
                </span>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'var(--color-deep-cocoa)',
                    lineHeight: '1.6',
                    marginTop: '4px',
                  }}
                >
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Associated Entities */}
            {selectedEvent.entityIds && selectedEvent.entityIds.length > 0 && (
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
                  Associated Entities
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {selectedEvent.entityIds.map((eId) => {
                    const ent = entityMap.get(eId);
                    return (
                      <span
                        key={eId}
                        style={{
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-warm-cream)',
                          border: '1px solid var(--color-border)',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--color-deep-cocoa)',
                        }}
                      >
                        {ent?.name || `Entity #${eId.slice(-4)}`}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Source Documents */}
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
                Grounded Provenance Documents
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                {(selectedEvent.sourceDocIds || []).map((docId) => {
                  const docRecord = docMap.get(docId);
                  const docName = docRecord?.originalName || `Document #${docId.slice(-6)}`;
                  return (
                    <div
                      key={docId}
                      onClick={() => {
                        setSelectedEvent(null);
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
                          {docName}
                        </span>
                        {docRecord?.documentType && (
                          <Badge variant="neutral" style={{ fontSize: '10px' }}>
                            {docRecord.documentType}
                          </Badge>
                        )}
                      </div>
                      <ExternalLink size={13} color="var(--color-muted-brown)" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setSelectedEvent(null)}
              style={{ width: '100%', marginTop: '8px' }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
