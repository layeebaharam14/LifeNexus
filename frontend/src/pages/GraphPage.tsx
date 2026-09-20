import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Search,
  FileText,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  RefreshCw,
  X,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import { EmptyState } from '../components/common/EmptyState.js';
import {
  getEntities,
  getRelationships,
  getMemoryStats,
  EntityRecord,
  RelationshipRecord,
  MemoryStats,
} from '../services/memoryService.js';
import { getDocuments } from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

// Entity Type Color Palette (LIFENEXUS Warm Theme)
const ENTITY_TYPE_CONFIG: Record<
  string,
  { color: string; label: string; glow: string; bg: string }
> = {
  Asset: { color: '#F47A45', label: 'Asset', glow: 'rgba(244, 122, 69, 0.4)', bg: '#FFF2EB' },
  Product: { color: '#F47A45', label: 'Asset', glow: 'rgba(244, 122, 69, 0.4)', bg: '#FFF2EB' },
  Person: { color: '#F59E0B', label: 'Person', glow: 'rgba(245, 158, 11, 0.4)', bg: '#FEF3C7' },
  Organization: { color: '#EA580C', label: 'Organization', glow: 'rgba(234, 88, 12, 0.4)', bg: '#FFEDD5' },
  Location: { color: '#10B981', label: 'Location', glow: 'rgba(16, 185, 129, 0.4)', bg: '#D1FAE5' },
  Place: { color: '#10B981', label: 'Location', glow: 'rgba(16, 185, 129, 0.4)', bg: '#D1FAE5' },
  Financial: { color: '#D97706', label: 'Financial', glow: 'rgba(217, 119, 6, 0.4)', bg: '#FEF3C7' },
  Certificate: { color: '#8B5CF6', label: 'Certificate', glow: 'rgba(139, 92, 246, 0.4)', bg: '#EDE9FE' },
  Document: { color: '#78716C', label: 'Document', glow: 'rgba(120, 113, 108, 0.4)', bg: '#F5F5F4' },
  Event: { color: '#F43F5E', label: 'Event', glow: 'rgba(244, 63, 94, 0.4)', bg: '#FFE4E6' },
  Other: { color: '#A8A29E', label: 'Entity', glow: 'rgba(168, 162, 158, 0.4)', bg: '#F5F5F4' },
};

function getEntityConfig(type: string) {
  return (
    ENTITY_TYPE_CONFIG[type] ||
    ENTITY_TYPE_CONFIG[type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase()] ||
    ENTITY_TYPE_CONFIG.Other
  );
}

// Graph Node representation
interface GraphNode {
  id: string;
  name: string;
  type: string;
  aliases: string[];
  attributes: Record<string, any>;
  sourceDocIds: string[];
  createdAt: string;
  degree: number;
  color: string;
  val: number;
  x?: number;
  y?: number;
}

// Graph Edge representation
interface GraphLink {
  id: string;
  source: string | any;
  target: string | any;
  relationType: string;
  confidence: number;
  evidenceSnippet: string;
  sourceDocIds: string[];
}

export const GraphPage: React.FC = () => {
  const navigate = useNavigate();
  const fgRef = useRef<ForceGraphMethods<any, any>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // Data states
  const [entities, setEntities] = useState<EntityRecord[]>([]);
  const [relationships, setRelationships] = useState<RelationshipRecord[]>([]);
  const [stats, setStats] = useState<MemoryStats>({
    memories: 0,
    entities: 0,
    relationships: 0,
    timelineEvents: 0,
  });
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 520,
  });

  // Fetch real data from Phase 4B memory endpoints & Phase 3 documents
  const loadGraphData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [entRes, relRes, statRes, docRes] = await Promise.allSettled([
        getEntities(),
        getRelationships(),
        getMemoryStats(),
        getDocuments(),
      ]);

      if (entRes.status === 'fulfilled' && entRes.value.success && entRes.value.data) {
        setEntities(entRes.value.data.entities || []);
      }
      if (relRes.status === 'fulfilled' && relRes.value.success && relRes.value.data) {
        setRelationships(relRes.value.data.relationships || []);
      }
      if (statRes.status === 'fulfilled' && statRes.value.success && statRes.value.data) {
        setStats(statRes.value.data.stats);
      }
      if (docRes.status === 'fulfilled' && docRes.value.success && docRes.value.data) {
        setDocuments(docRes.value.data.documents || []);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load Life Graph data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGraphData();
  }, [loadGraphData]);

  // Handle container resizing cleanly
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', updateSize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Map document IDs to original filenames
  const docMap = useMemo(() => {
    const map = new Map<string, DocumentRecord>();
    documents.forEach((doc) => {
      map.set(doc.id, doc);
      if ((doc as any)._id) map.set((doc as any)._id.toString(), doc);
    });
    return map;
  }, [documents]);

  // Count unique connected documents
  const connectedDocCount = useMemo(() => {
    const docIdSet = new Set<string>();
    entities.forEach((e) => (e.sourceDocIds || []).forEach((id) => docIdSet.add(id)));
    relationships.forEach((r) => (r.sourceDocIds || []).forEach((id) => docIdSet.add(id)));
    return docIdSet.size;
  }, [entities, relationships]);

  // Build graph nodes & links from real Phase 4B records
  const graphData = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const linkMap = new Map<string, GraphLink>();

    // Add all entities as nodes
    entities.forEach((entity) => {
      const config = getEntityConfig(entity.type);
      nodeMap.set(entity.id, {
        id: entity.id,
        name: entity.name,
        type: entity.type,
        aliases: entity.aliases || [],
        attributes: entity.attributes || {},
        sourceDocIds: entity.sourceDocIds || [],
        createdAt: entity.createdAt,
        degree: 0,
        color: config.color,
        val: 8,
      });
    });

    // Add links and ensure source/target nodes exist
    relationships.forEach((rel) => {
      const fromId = rel.from?.id;
      const toId = rel.to?.id;

      if (!fromId || !toId) return;

      // Ensure 'from' node exists
      if (!nodeMap.has(fromId)) {
        const config = getEntityConfig(rel.from.type || 'Other');
        nodeMap.set(fromId, {
          id: fromId,
          name: rel.from.name || 'Unknown',
          type: rel.from.type || 'Other',
          aliases: [],
          attributes: {},
          sourceDocIds: rel.sourceDocIds || [],
          createdAt: rel.createdAt,
          degree: 0,
          color: config.color,
          val: 8,
        });
      }

      // Ensure 'to' node exists
      if (!nodeMap.has(toId)) {
        const config = getEntityConfig(rel.to.type || 'Other');
        nodeMap.set(toId, {
          id: toId,
          name: rel.to.name || 'Unknown',
          type: rel.to.type || 'Other',
          aliases: [],
          attributes: {},
          sourceDocIds: rel.sourceDocIds || [],
          createdAt: rel.createdAt,
          degree: 0,
          color: config.color,
          val: 8,
        });
      }

      // Update degrees
      const sourceNode = nodeMap.get(fromId)!;
      const targetNode = nodeMap.get(toId)!;
      sourceNode.degree += 1;
      targetNode.degree += 1;
      sourceNode.val = Math.min(24, 8 + sourceNode.degree * 3);
      targetNode.val = Math.min(24, 8 + targetNode.degree * 3);

      const linkKey = `${fromId}->${toId}:${rel.relationType}`;
      if (!linkMap.has(linkKey)) {
        linkMap.set(linkKey, {
          id: rel.id || linkKey,
          source: fromId,
          target: toId,
          relationType: rel.relationType,
          confidence: rel.confidence ?? 0.8,
          evidenceSnippet: rel.evidenceSnippet || '',
          sourceDocIds: rel.sourceDocIds || [],
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: Array.from(linkMap.values()),
    };
  }, [entities, relationships]);

  // Available entity types in the current graph
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    graphData.nodes.forEach((n) => types.add(n.type));
    return Array.from(types).sort();
  }, [graphData.nodes]);

  // Filtered graph data based on type filter and search
  const filteredData = useMemo(() => {
    let nodes = graphData.nodes;

    if (typeFilter !== 'ALL') {
      nodes = nodes.filter((n) => n.type.toLowerCase() === typeFilter.toLowerCase());
    }

    const visibleNodeIds = new Set(nodes.map((n) => n.id));

    // Links where both source and target are visible
    const links = graphData.links.filter((l) => {
      const sId = typeof l.source === 'object' ? l.source.id : l.source;
      const tId = typeof l.target === 'object' ? l.target.id : l.target;
      return visibleNodeIds.has(sId) && visibleNodeIds.has(tId);
    });

    return { nodes, links };
  }, [graphData, typeFilter]);

  // Find currently selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graphData.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graphData.nodes]);

  // Find connected relationships for selected node
  const selectedNodeConnections = useMemo(() => {
    if (!selectedNodeId) return [];
    return relationships.filter(
      (r) => r.from?.id === selectedNodeId || r.to?.id === selectedNodeId
    );
  }, [selectedNodeId, relationships]);

  // Find neighbor node IDs for highlighting
  const neighborNodeIds = useMemo(() => {
    const set = new Set<string>();
    if (!selectedNodeId) return set;
    set.add(selectedNodeId);
    selectedNodeConnections.forEach((r) => {
      if (r.from?.id) set.add(r.from.id);
      if (r.to?.id) set.add(r.to.id);
    });
    return set;
  }, [selectedNodeId, selectedNodeConnections]);

  // Search handler: center and select node
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = graphData.nodes.find(
      (n) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.aliases.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (match) {
      setSelectedNodeId(match.id);
      if (fgRef.current && match.x !== undefined && match.y !== undefined) {
        fgRef.current.centerAt(match.x, match.y, 600);
        fgRef.current.zoom(2.2, 600);
      }
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.35, 300);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.35, 300);
    }
  };

  const handleFitView = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 40);
    }
  };

  // Custom node canvas renderer for crisp, beautiful aesthetic
  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = node.id === selectedNodeId;
      const isHovered = node.id === hoveredNodeId;
      const isNeighbor = neighborNodeIds.has(node.id);
      const isDimmed = selectedNodeId !== null && !isNeighbor;

      const baseRadius = Math.max(5, Math.min(16, 5 + (node.degree || 0) * 2));
      const radius = isSelected ? baseRadius + 3 : isHovered ? baseRadius + 2 : baseRadius;
      const config = getEntityConfig(node.type);

      ctx.save();
      ctx.globalAlpha = isDimmed ? 0.25 : 1.0;

      // Glow halo for selected or hovered node
      if (isSelected || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 7, 0, 2 * Math.PI, false);
        ctx.fillStyle = config.glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2.5, 0, 2 * Math.PI, false);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2 / globalScale;
        ctx.stroke();
      }

      // Outer ring for degree > 1
      if ((node.degree || 0) > 1 && !isDimmed) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 2, 0, 2 * Math.PI, false);
        ctx.strokeStyle = config.color;
        ctx.lineWidth = 1 / globalScale;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node body circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = config.color;
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = (isSelected ? 2.5 : 1.5) / globalScale;
      ctx.stroke();

      // Label text
      const label = node.name || 'Entity';
      const fontSize = Math.max(10, Math.min(14, 12 / globalScale));
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;

      const textWidth = ctx.measureText(label).width;
      const labelY = node.y + radius + fontSize + 2;

      // Pill background for readable text
      ctx.fillStyle = isSelected
        ? 'rgba(244, 122, 69, 0.95)'
        : 'rgba(23, 19, 17, 0.85)';
      const padX = 4;
      const padY = 2;
      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - padX,
        labelY - fontSize + 1,
        textWidth + padX * 2,
        fontSize + padY,
        3
      );
      ctx.fill();

      // Text itself
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, node.x, labelY - fontSize / 2 + 2);

      ctx.restore();
    },
    [selectedNodeId, hoveredNodeId, neighborNodeIds]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Title & Real Knowledge Graph Stats */}
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
              <Network size={20} color="#FFFFFF" />
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-family-display)',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-deep-cocoa)',
              }}
            >
              Life Graph
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
            LIFENEXUS connects entities, assets, organizations, and relationships derived from your
            real documents into a unified, interactive personal memory network.
          </p>
        </div>

        {/* Real Backend Statistics Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Badge variant="orange">
            <Layers size={13} style={{ marginRight: '4px' }} />
            {entities.length} {entities.length === 1 ? 'Entity' : 'Entities'}
          </Badge>
          <Badge variant="peach">
            <Sparkles size={13} style={{ marginRight: '4px' }} />
            {relationships.length}{' '}
            {relationships.length === 1 ? 'Relationship' : 'Relationships'}
          </Badge>
          <Badge variant="neutral">
            <FileText size={13} style={{ marginRight: '4px' }} />
            {connectedDocCount} {connectedDocCount === 1 ? 'Document' : 'Documents'}
          </Badge>
          <button
            onClick={loadGraphData}
            title="Refresh graph data"
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

      {/* Loading State */}
      {isLoading && entities.length === 0 ? (
        <Card
          style={{
            minHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            backgroundColor: 'var(--color-cream-surface)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: '3px solid var(--color-peach-light)',
              borderTopColor: 'var(--color-nexus-orange)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
            Loading your Life Graph...
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
            Querying user-scoped entities and discovered relationships
          </p>
        </Card>
      ) : entities.length === 0 ? (
        /* Empty State: Prompt user to build memory from documents */
        <EmptyState
          icon={<Network size={32} />}
          title="Your Life Graph is still forming."
          description="Build memory from your documents to discover connections between people, places, organizations, products and events."
          actionText="Go to Documents"
          onAction={() => navigate('/app/documents')}
        />
      ) : (
        /* Main Graph Layout: Graph Canvas + Details Drawer */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '20px',
            minHeight: '580px',
          }}
        >
          {/* Canvas Card */}
          <Card
            style={{
              position: 'relative',
              backgroundColor: '#171311',
              color: '#FFFFFF',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            {/* Top Canvas Toolbar */}
            <div
              style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              {/* Type Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  pointerEvents: 'auto',
                }}
              >
                <button
                  onClick={() => setTypeFilter('ALL')}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 600,
                    border: '1px solid',
                    borderColor:
                      typeFilter === 'ALL'
                        ? 'var(--color-nexus-orange)'
                        : 'rgba(255, 255, 255, 0.15)',
                    background:
                      typeFilter === 'ALL'
                        ? 'var(--color-nexus-orange)'
                        : 'rgba(23, 19, 17, 0.75)',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  All ({graphData.nodes.length})
                </button>

                {availableTypes.map((t) => {
                  const cfg = getEntityConfig(t);
                  const isCur = typeFilter.toLowerCase() === t.toLowerCase();
                  const count = graphData.nodes.filter(
                    (n) => n.type.toLowerCase() === t.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(isCur ? 'ALL' : t)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: '1px solid',
                        borderColor: isCur ? cfg.color : 'rgba(255, 255, 255, 0.15)',
                        background: isCur ? cfg.color : 'rgba(23, 19, 17, 0.75)',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isCur ? '#FFFFFF' : cfg.color,
                          marginRight: '5px',
                        }}
                      />
                      {cfg.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Zoom & Fit Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  gap: '6px',
                  pointerEvents: 'auto',
                }}
              >
                <button
                  onClick={handleZoomIn}
                  title="Zoom in"
                  style={{
                    padding: '8px',
                    background: 'rgba(23, 19, 17, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#FFF',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ZoomIn size={15} />
                </button>
                <button
                  onClick={handleZoomOut}
                  title="Zoom out"
                  style={{
                    padding: '8px',
                    background: 'rgba(23, 19, 17, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#FFF',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <ZoomOut size={15} />
                </button>
                <button
                  onClick={handleFitView}
                  title="Fit view to screen"
                  style={{
                    padding: '8px',
                    background: 'rgba(23, 19, 17, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    color: '#FFF',
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Maximize2 size={15} />
                </button>
              </div>
            </div>

            {/* Force Graph Canvas */}
            <div
              ref={containerRef}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                minHeight: '520px',
                position: 'relative',
              }}
            >
              <ForceGraph2D
                ref={fgRef}
                width={dimensions.width}
                height={dimensions.height}
                graphData={filteredData}
                backgroundColor="#171311"
                nodeCanvasObject={paintNode}
                nodePointerAreaPaint={(node: any, color, ctx) => {
                  ctx.fillStyle = color;
                  const r = Math.max(8, (node.val || 8) + 4);
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fill();
                }}
                nodeLabel={(node: any) =>
                  `<div style="background: rgba(23,19,17,0.92); color: #fff; padding: 6px 10px; border-radius: 6px; font-size: 12px; font-family: Inter, sans-serif; border: 1px solid rgba(244,122,69,0.3);">
                    <strong>${node.name}</strong><br/>
                    <span style="opacity:0.8;">${node.type}</span> &bull; 
                    <span style="color:#FFB07C;">${node.degree || 0} connections</span>
                  </div>`
                }
                linkColor={(link: any) => {
                  const sId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tId = typeof link.target === 'object' ? link.target.id : link.target;
                  if (selectedNodeId && (sId === selectedNodeId || tId === selectedNodeId)) {
                    return '#F47A45';
                  }
                  return 'rgba(255, 176, 124, 0.35)';
                }}
                linkWidth={(link: any) => {
                  const sId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tId = typeof link.target === 'object' ? link.target.id : link.target;
                  if (selectedNodeId && (sId === selectedNodeId || tId === selectedNodeId)) {
                    return 2.5;
                  }
                  return 1.2;
                }}
                linkDirectionalArrowLength={4.5}
                linkDirectionalArrowRelPos={0.9}
                linkDirectionalArrowColor={(link: any) => {
                  const sId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tId = typeof link.target === 'object' ? link.target.id : link.target;
                  if (selectedNodeId && (sId === selectedNodeId || tId === selectedNodeId)) {
                    return '#F47A45';
                  }
                  return 'rgba(255, 176, 124, 0.6)';
                }}
                linkDirectionalParticles={(link: any) => {
                  const sId = typeof link.source === 'object' ? link.source.id : link.source;
                  const tId = typeof link.target === 'object' ? link.target.id : link.target;
                  if (selectedNodeId && (sId === selectedNodeId || tId === selectedNodeId)) {
                    return 2;
                  }
                  return 0;
                }}
                linkDirectionalParticleSpeed={0.006}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => '#F47A45'}
                linkLabel={(link: any) =>
                  `<div style="background: rgba(23,19,17,0.92); color: #FFB07C; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: Inter, sans-serif;">
                    ${link.relationType || 'CONNECTED_TO'} (${Math.round((link.confidence ?? 0.8) * 100)}%)
                  </div>`
                }
                onNodeClick={(node: any) => {
                  setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                }}
                onNodeHover={(node: any) => {
                  setHoveredNodeId(node ? node.id : null);
                }}
                onBackgroundClick={() => {
                  setSelectedNodeId(null);
                }}
                cooldownTicks={100}
                d3VelocityDecay={0.3}
              />
            </div>

            {/* Bottom Canvas Hint Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '16px',
                right: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.55)',
                pointerEvents: 'none',
              }}
            >
              <span>Click a node to inspect &bull; Drag to rearrange &bull; Scroll to zoom</span>
              <span>
                Showing {filteredData.nodes.length} nodes &bull; {filteredData.links.length} links
              </span>
            </div>
          </Card>

          {/* Right Sidebar: Details Panel or Overview Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Entity Search Box */}
            <Card style={{ padding: '14px 16px' }}>
              <form
                onSubmit={handleSearchSubmit}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Search size={16} color="var(--color-muted-brown)" />
                <input
                  type="text"
                  placeholder="Find entity in graph..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    background: 'transparent',
                    color: 'var(--color-deep-cocoa)',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-muted-brown)',
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
            </Card>

            {/* Details Panel for Selected Node */}
            {selectedNode ? (
              <Card
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                {/* Header with Title and Close Button */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: getEntityConfig(selectedNode.type).color,
                        }}
                      />
                      <Badge variant="peach">{selectedNode.type}</Badge>
                    </div>
                    <h3
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: 'var(--color-deep-cocoa)',
                        wordBreak: 'break-word',
                      }}
                    >
                      {selectedNode.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    title="Close details"
                    style={{
                      background: 'var(--color-warm-cream)',
                      border: '1px solid var(--color-border-subtle)',
                      borderRadius: '6px',
                      padding: '4px',
                      cursor: 'pointer',
                      color: 'var(--color-muted-brown)',
                    }}
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Connections Count Metric */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-warm-cream)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
                    TOTAL CONNECTIONS
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-nexus-orange)' }}>
                    {selectedNodeConnections.length}
                  </span>
                </div>

                {/* Attributes Section (if present) */}
                {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 && (
                  <div
                    style={{
                      borderTop: '1px solid var(--color-border)',
                      paddingTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--color-muted-brown)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Attributes
                    </span>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        fontSize: '12px',
                      }}
                    >
                      {Object.entries(selectedNode.attributes).map(([key, val]) => (
                        <div
                          key={key}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'var(--color-warm-cream)',
                            borderRadius: '4px',
                          }}
                        >
                          <span style={{ color: 'var(--color-muted-brown)', fontWeight: 500 }}>
                            {key.replace(/_/g, ' ')}:
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: 'var(--color-deep-cocoa)',
                              maxWidth: '160px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Relationships Section */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-muted-brown)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Connected Relationships ({selectedNodeConnections.length})
                  </span>

                  {selectedNodeConnections.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', fontStyle: 'italic' }}>
                      Isolated entity — no direct relationships detected yet.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                      }}
                    >
                      {selectedNodeConnections.map((rel) => {
                        const isOutgoing = rel.from?.id === selectedNode.id;
                        const otherEntity = isOutgoing ? rel.to : rel.from;
                        return (
                          <div
                            key={rel.id}
                            onClick={() => otherEntity?.id && setSelectedNodeId(otherEntity.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border-subtle)',
                              background: 'var(--color-warm-cream)',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  color: 'var(--color-nexus-orange)',
                                  textTransform: 'uppercase',
                                }}
                              >
                                {isOutgoing ? `→ ${rel.relationType}` : `← ${rel.relationType}`}
                              </span>
                              <span
                                style={{
                                  fontSize: '10px',
                                  color: 'var(--color-muted-brown)',
                                }}
                              >
                                {Math.round((rel.confidence ?? 0.8) * 100)}% conf
                              </span>
                            </div>
                            <span
                              style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--color-deep-cocoa)',
                              }}
                            >
                              {otherEntity?.name || 'Unknown entity'}
                            </span>
                            {rel.evidenceSnippet && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: 'var(--color-muted-brown)',
                                  fontStyle: 'italic',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                "{rel.evidenceSnippet}"
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Source Documents Section */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-muted-brown)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Source Documents ({selectedNode.sourceDocIds?.length || 0})
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    {(selectedNode.sourceDocIds || []).map((docId) => {
                      const docRecord = docMap.get(docId);
                      const displayName = docRecord ? docRecord.originalName : `Document #${docId.slice(-6)}`;
                      return (
                        <div
                          key={docId}
                          onClick={() => navigate('/app/documents')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'var(--color-warm-cream)',
                            border: '1px solid var(--color-border-subtle)',
                            fontSize: '12px',
                            color: 'var(--color-deep-cocoa)',
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={14} color="var(--color-nexus-orange)" />
                          <span
                            style={{
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontWeight: 500,
                            }}
                          >
                            {displayName}
                          </span>
                          <ExternalLink size={12} color="var(--color-muted-brown)" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ) : (
              /* Overview & Legend Card when no node is selected */
              <Card
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                    Graph Guide
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
                    Select any node on the canvas to inspect its properties, connections, and source documents.
                  </p>
                </div>

                {/* Entity Type Legend */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-muted-brown)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Entity Types Legend
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(ENTITY_TYPE_CONFIG)
                      .filter(([key]) => key !== 'Product' && key !== 'Place' && key !== 'Other')
                      .map(([key, config]) => {
                        const count = graphData.nodes.filter(
                          (n) => n.type.toLowerCase() === key.toLowerCase()
                        ).length;
                        return (
                          <div
                            key={key}
                            onClick={() => setTypeFilter(typeFilter === key ? 'ALL' : key)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              background:
                                typeFilter === key
                                  ? 'var(--color-peach-light)'
                                  : 'var(--color-warm-cream)',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span
                                style={{
                                  width: '10px',
                                  height: '10px',
                                  borderRadius: '50%',
                                  backgroundColor: config.color,
                                }}
                              />
                              <span style={{ fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
                                {config.label}
                              </span>
                            </div>
                            <span style={{ color: 'var(--color-muted-brown)', fontSize: '11px' }}>
                              {count} in graph
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Interaction Tips */}
                <div
                  style={{
                    borderTop: '1px solid var(--color-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--color-muted-brown)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} color="var(--color-nexus-orange)" />
                    <span><strong>Node size</strong> indicates connectivity.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} color="var(--color-nexus-orange)" />
                    <span><strong>Arrows</strong> denote relationship flow.</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
