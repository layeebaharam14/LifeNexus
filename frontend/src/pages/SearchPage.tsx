import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  FileText,
  Sparkles,
  Network,
  Clock,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Layers,
  Tag,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  MapPin,
  CheckCircle2,
  HelpCircle,
  Building,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { EmptyState } from '../components/common/EmptyState.js';
import { executeSearch, SearchResultItem } from '../services/searchService.js';

const SAMPLE_QUERIES = [
  'Where did I buy my laptop?',
  'Show my laptop documents',
  'What was the laptop purchase amount?',
  'When did I purchase my laptop?',
  'Find documents related to Dell',
  'Show my warranty information',
];

const TYPE_BADGE_CONFIG: Record<
  string,
  { label: string; variant: 'orange' | 'peach' | 'success' | 'warning' | 'error' | 'neutral'; icon: any }
> = {
  document: { label: 'Document', variant: 'peach', icon: FileText },
  entity: { label: 'Entity', variant: 'orange', icon: Layers },
  memory: { label: 'Memory', variant: 'warning', icon: Sparkles },
  relationship: { label: 'Relationship', variant: 'success', icon: Network },
  timeline: { label: 'Timeline Event', variant: 'neutral', icon: Clock },
};

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState<string>(initialQuery);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedDetailsId, setExpandedDetailsId] = useState<string | null>(null);

  // Perform search
  const performSearch = useCallback(
    async (searchQuery: string, filterType: string = 'all') => {
      const trimmed = searchQuery.trim();
      if (!trimmed) {
        setResults([]);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await executeSearch(trimmed, filterType);
        if (response.success && response.data) {
          setResults(response.data.results || []);
        } else {
          setError(response.error || 'Search failed to return results.');
          setResults([]);
        }
      } catch (err: any) {
        setError(err?.message || 'Search execution failed.');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim(), activeFilter);
    }
  };

  // Handle chip click
  const handleChipClick = (chipQuery: string) => {
    setQuery(chipQuery);
    setSearchParams({ q: chipQuery });
    performSearch(chipQuery, activeFilter);
  };

  // Run on mount if initial query in URL
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, activeFilter);
    }
  }, [initialQuery, performSearch]);

  // Handle filter change
  const handleFilterChange = (newFilter: string) => {
    setActiveFilter(newFilter);
    if (query.trim()) {
      performSearch(query.trim(), newFilter);
    }
  };

  // Calculate counts per result type
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: results.length,
      document: 0,
      entity: 0,
      memory: 0,
      relationship: 0,
      timeline: 0,
    };
    results.forEach((r) => {
      if (c[r.type] !== undefined) c[r.type]++;
    });
    return c;
  }, [results]);

  // Filtered results for view
  const displayedResults = useMemo(() => {
    if (activeFilter === 'all') return results;
    return results.filter((r) => r.type === activeFilter);
  }, [results, activeFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
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
            <Search size={20} color="#FFFFFF" />
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-deep-cocoa)',
            }}
          >
            Life Search
          </h2>
        </div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-muted-brown)',
            marginTop: '6px',
          }}
        >
          Ask natural-language questions or search keywords across your documents, entities,
          memories, and relationships. Every result is grounded with verified source provenance.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-cream-surface)',
            border: '2px solid var(--color-apricot)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 16px',
            boxShadow: 'var(--shadow-md)',
            gap: '12px',
          }}
        >
          <Search size={22} color="var(--color-nexus-orange)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your life... (e.g. 'Where did I buy my laptop?', 'Dell invoice', 'Warranty expiration')"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'var(--color-deep-cocoa)',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setHasSearched(false);
                setSearchParams({});
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-muted-brown)',
                padding: '4px',
              }}
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <Button type="submit" variant="primary" size="md" disabled={isLoading || !query.trim()}>
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Suggested Query Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
          Suggested:
        </span>
        {SAMPLE_QUERIES.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-peach-light)',
              border: '1px solid var(--color-soft-peach)',
              color: 'var(--color-deep-cocoa)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Filter Tabs (when results exist) */}
      {hasSearched && results.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          {[
            { id: 'all', label: 'All Results', count: counts.all },
            { id: 'document', label: 'Documents', count: counts.document },
            { id: 'entity', label: 'Entities', count: counts.entity },
            { id: 'memory', label: 'Memories', count: counts.memory },
            { id: 'relationship', label: 'Relationships', count: counts.relationship },
            { id: 'timeline', label: 'Timeline', count: counts.timeline },
          ]
            .filter((tab) => tab.id === 'all' || tab.count > 0)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  fontWeight: activeFilter === tab.id ? 700 : 500,
                  background: activeFilter === tab.id ? 'var(--color-nexus-orange)' : 'var(--color-cream-surface)',
                  color: activeFilter === tab.id ? '#FFFFFF' : 'var(--color-deep-cocoa)',
                  border: '1px solid',
                  borderColor: activeFilter === tab.id ? 'var(--color-nexus-orange)' : 'var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
        </div>
      )}

      {/* Main Results Area */}
      {isLoading ? (
        <Card
          style={{
            padding: '48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '3px solid var(--color-peach-light)',
              borderTopColor: 'var(--color-nexus-orange)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
            Searching across documents & memory engine...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
            Grounded recall matching entities, evidence, and connections
          </p>
        </Card>
      ) : !hasSearched ? (
        /* Empty State: Initial state before search */
        <EmptyState
          icon={<Search size={32} />}
          title="Search your life."
          description="Find documents, people, places, purchases, events and connections across everything you've connected to LIFENEXUS."
        />
      ) : displayedResults.length === 0 ? (
        /* Empty State: No matches found */
        <EmptyState
          icon={<HelpCircle size={32} />}
          title="No memories found."
          description={`No records matched "${query}". Try another query phrase or import additional documents in Documents.`}
          actionText="Go to Documents"
          onAction={() => navigate('/app/documents')}
        />
      ) : (
        /* Render Search Results List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Found {displayedResults.length} {displayedResults.length === 1 ? 'match' : 'matches'} for "{query}"
            </span>
            <Badge variant="success">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} />
              100% Grounded in User Data
            </Badge>
          </div>

          {displayedResults.map((item) => {
            const typeConfig = TYPE_BADGE_CONFIG[item.type] || TYPE_BADGE_CONFIG.document;
            const TypeIcon = typeConfig.icon;
            const isExpanded = expandedDetailsId === item.id;

            return (
              <Card
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  transition: 'box-shadow var(--transition-fast)',
                }}
              >
                {/* Top Row: Type Badge + Title + Subtitle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: 'var(--color-peach-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <TypeIcon size={18} color="var(--color-nexus-orange)" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                        {item.matchedFields?.length > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--color-muted-brown)' }}>
                            Matched in: {item.matchedFields.join(', ')}
                          </span>
                        )}
                      </div>
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: 700,
                          color: 'var(--color-deep-cocoa)',
                          lineHeight: '1.3',
                        }}
                      >
                        {item.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '2px' }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Toggle Button */}
                  <button
                    onClick={() => setExpandedDetailsId(isExpanded ? null : item.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-muted-brown)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      padding: '4px 8px',
                    }}
                  >
                    {isExpanded ? 'Less' : 'Details'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {/* Evidence / Snippet Callout */}
                {item.snippet && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-warm-cream)',
                      borderLeft: '3px solid var(--color-nexus-orange)',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: 'var(--color-deep-cocoa)',
                    }}
                  >
                    "{item.snippet}"
                  </div>
                )}

                {/* Provenance Row: Verified Source Document */}
                {item.sourceDocument && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid var(--color-border-subtle)',
                      paddingTop: '10px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--color-nexus-orange)" />
                      <span style={{ color: 'var(--color-muted-brown)' }}>Source:</span>
                      <strong style={{ color: 'var(--color-deep-cocoa)' }}>
                        {item.sourceDocument.name}
                      </strong>
                      <Badge variant="neutral" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.sourceDocument.type || 'Document'}
                      </Badge>
                    </div>

                    <button
                      onClick={() => navigate('/app/documents')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-nexus-orange)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      View Document <ExternalLink size={12} />
                    </button>
                  </div>
                )}

                {/* Expandable Details Drawer */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-cream-surface)',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '12px',
                    }}
                  >
                    <span style={{ fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                      Extended Metadata
                    </span>

                    {/* Entity Attributes */}
                    {item.type === 'entity' && item.details.attributes && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Object.entries(item.details.attributes).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: 'var(--color-muted-brown)' }}>{k}:</span>
                            <strong style={{ color: 'var(--color-deep-cocoa)' }}>{String(v)}</strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Relationship Details */}
                    {item.type === 'relationship' && item.details && (
                      <div>
                        <div><strong>From:</strong> {item.details.from?.name} ({item.details.from?.type})</div>
                        <div><strong>Relation:</strong> {item.details.relationType}</div>
                        <div><strong>To:</strong> {item.details.to?.name} ({item.details.to?.type})</div>
                        <div><strong>Confidence:</strong> {Math.round((item.details.confidence || 0.8) * 100)}%</div>
                      </div>
                    )}

                    {/* Timeline Event Details */}
                    {item.type === 'timeline' && item.details && (
                      <div>
                        <div><strong>Date:</strong> {item.details.date}</div>
                        <div><strong>Precision:</strong> {item.details.datePrecision}</div>
                        <div><strong>Category:</strong> {item.details.category}</div>
                      </div>
                    )}

                    {/* Document Details */}
                    {item.type === 'document' && item.details && (
                      <div>
                        <div><strong>MIME Type:</strong> {item.details.mimeType}</div>
                        <div><strong>File Size:</strong> {(item.details.fileSize / 1024).toFixed(1)} KB</div>
                        <div><strong>Has Extracted Text:</strong> {item.details.hasExtractedText ? 'Yes' : 'No'}</div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
