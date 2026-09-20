import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Trash2,
  Eye,
  RefreshCw,
  UploadCloud,
  AlertCircle,
  Copy,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Brain,
  Tag,
  Calendar,
  DollarSign,
  Layers,
  Link2,
  Hash,
  Clock,
  ChevronRight,
  Info,
  Network,
  Zap,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import {
  getDocuments,
  getDocumentContent,
  deleteDocument,
  understandDocument,
  getDocumentUnderstanding,
  DocumentContentResult,
} from '../services/documentService.js';
import { buildMemoryForDocument, BuildMemoryResult } from '../services/memoryService.js';
import { DocumentRecord, DocumentUnderstandingRecord } from '../types/index.js';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detail / Content Modal State
  const [selectedDocContent, setSelectedDocContent] = useState<DocumentContentResult | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // AI Understanding State
  const [selectedUnderstanding, setSelectedUnderstanding] = useState<{
    docName: string;
    data: DocumentUnderstandingRecord;
    cached?: boolean;
  } | null>(null);
  const [understandingDocId, setUnderstandingDocId] = useState<string | null>(null);
  const [understandingError, setUnderstandingError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'entities' | 'dates' | 'amounts' | 'events' | 'relationships'>('overview');

  // Phase 4B: Build Memory State
  const [buildingMemoryDocId, setBuildingMemoryDocId] = useState<string | null>(null);
  const [memoryResult, setMemoryResult] = useState<{ docName: string; result: BuildMemoryResult } | null>(null);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await getDocuments();
      if (res.success && res.data?.documents) {
        setDocuments(res.data.documents);
      } else {
        setErrorMessage(res.error || 'Failed to load user documents.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while fetching documents.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleViewContent = async (docId: string) => {
    setIsLoadingContent(true);
    try {
      const res = await getDocumentContent(docId);
      if (res.success && res.data?.content) {
        setSelectedDocContent(res.data.content);
      } else {
        alert(res.error || 'Failed to retrieve extracted content.');
      }
    } catch (err: any) {
      alert(err.message || 'Error loading document content.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"? This will remove the file and its extracted text.`)) {
      return;
    }

    setDeletingId(docId);
    try {
      const res = await deleteDocument(docId);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== docId));
        if (selectedDocContent?.documentId === docId) {
          setSelectedDocContent(null);
        }
      } else {
        alert(res.error || 'Failed to delete document.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting document.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUnderstand = async (docId: string, docName: string, reprocess: boolean = false) => {
    setUnderstandingDocId(docId);
    setUnderstandingError(null);
    try {
      const res = await understandDocument(docId, reprocess);
      if (res.success && res.data?.understanding) {
        setSelectedUnderstanding({
          docName,
          data: res.data.understanding,
          cached: res.data.cached,
        });
        setActiveTab('overview');
      } else {
        setUnderstandingError(res.error || 'Failed to analyze document with AI.');
        alert(res.error || 'Failed to understand document.');
      }
    } catch (err: any) {
      const msg = err.message || 'Error executing AI document understanding.';
      setUnderstandingError(msg);
      alert(msg);
    } finally {
      setUnderstandingDocId(null);
    }
  };

  const handleViewExistingUnderstanding = async (docId: string, docName: string) => {
    setUnderstandingDocId(docId);
    setUnderstandingError(null);
    try {
      const res = await getDocumentUnderstanding(docId);
      if (res.success && res.data?.understanding) {
        setSelectedUnderstanding({
          docName,
          data: res.data.understanding,
        });
        setActiveTab('overview');
      } else {
        // If not analyzed yet, run AI understanding
        await handleUnderstand(docId, docName);
      }
    } catch (err: any) {
      alert(err.message || 'Error fetching document understanding.');
    } finally {
      setUnderstandingDocId(null);
    }
  };

  // Phase 4B: Build Memory Handler
  const handleBuildMemory = async (docId: string, docName: string) => {
    setBuildingMemoryDocId(docId);
    setMemoryResult(null);
    try {
      const res = await buildMemoryForDocument(docId);
      if (res.success && res.data?.result) {
        setMemoryResult({ docName, result: res.data.result });
      } else {
        alert(res.error || 'Memory construction failed. Make sure AI Understanding has been run first.');
      }
    } catch (err: any) {
      alert(err.message || 'Error building memory for document.');
    } finally {
      setBuildingMemoryDocId(null);
    }
  };

  const handleCopyText = () => {
    if (selectedDocContent?.extractedText) {
      navigator.clipboard.writeText(selectedDocContent.extractedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

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

  const formatConfidence = (conf: number): string => {
    return `${Math.round(conf * 100)}%`;
  };

  const getFileIcon = (mimeType: string, filename: string) => {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    if (mimeType.includes('pdf') || ext === 'pdf') {
      return <FileText size={18} color="var(--color-nexus-orange)" />;
    }
    if (mimeType.includes('image') || ['png', 'jpg', 'jpeg'].includes(ext)) {
      return <ImageIcon size={18} color="var(--color-sage-accent)" />;
    }
    return <FileCode size={18} color="var(--color-terracotta)" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
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
          <h2
            style={{
              fontFamily: 'var(--font-family-display)',
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--color-deep-cocoa)',
              marginBottom: '6px',
            }}
          >
            Source Documents Repository
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
            All ingested files acting as ground-truth evidence anchors for your Life Knowledge Graph.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />}
            onClick={fetchDocuments}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UploadCloud size={14} />}
            onClick={() => navigate('/app/import')}
          >
            Import Document
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
          }}
        >
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <Card style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', color: 'var(--color-nexus-orange)' }}>
            <RefreshCw size={24} className="animate-spin" />
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Loading documents from secure sandbox...</span>
          </div>
        </Card>
      ) : documents.length === 0 ? (
        /* Empty State */
        <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-peach-light)',
              color: 'var(--color-nexus-orange)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <FileText size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            No documents ingested yet
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-muted-brown)',
              maxWidth: '420px',
              margin: '0 auto 20px auto',
            }}
          >
            Import your receipts, warranties, flight tickets, certificates, or notes to start building your personal memory graph.
          </p>
          <Button variant="primary" icon={<UploadCloud size={16} />} onClick={() => navigate('/app/import')}>
            Import Your First Document
          </Button>
        </Card>
      ) : (
        /* Documents Table Card */
        <Card style={{ padding: '0px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '14px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: 'var(--color-peach-light)',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Document Name</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Extraction</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Size</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr
                    key={doc.id}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {getFileIcon(doc.mimeType, doc.originalName)}
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--color-deep-cocoa)' }}>
                            {doc.originalName}
                          </span>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '11px',
                              color: 'var(--color-light-brown)',
                              fontFamily: 'monospace',
                            }}
                          >
                            ID: {doc.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <Badge variant="peach">{doc.documentType || 'Document'}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--color-muted-brown)',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        {doc.extractionMethod || (doc.hasExtractedText ? 'text' : 'none')}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-muted-brown)' }}>
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td style={{ padding: '14px 20px', color: 'var(--color-muted-brown)' }}>
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      {doc.processingStatus === 'PROCESSED' ? (
                        <Badge variant="success">PROCESSED</Badge>
                      ) : doc.processingStatus === 'FAILED' ? (
                        <Badge variant="orange">FAILED</Badge>
                      ) : (
                        <Badge variant="neutral">{doc.processingStatus}</Badge>
                      )}
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          title="Extract structured semantic memory with Gemini AI"
                          disabled={understandingDocId === doc.id}
                          onClick={() => handleUnderstand(doc.id, doc.originalName)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'var(--color-peach-light)',
                            border: '1px solid var(--color-terracotta)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            color: 'var(--color-nexus-orange)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <Sparkles
                            size={14}
                            className={understandingDocId === doc.id ? 'animate-spin' : ''}
                            color="var(--color-nexus-orange)"
                          />
                          <span>
                            {understandingDocId === doc.id ? 'Analyzing...' : 'Understand AI'}
                          </span>
                        </button>

                        {/* Phase 4B: Build Memory Button */}
                        <button
                          id={`build-memory-btn-${doc.id}`}
                          title="Build Memory Records from AI Understanding"
                          disabled={buildingMemoryDocId === doc.id}
                          onClick={() => handleBuildMemory(doc.id, doc.originalName)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: buildingMemoryDocId === doc.id ? '#e8f5e9' : '#EDE7F6',
                            border: '1px solid #9C27B0',
                            borderRadius: 'var(--radius-sm)',
                            cursor: buildingMemoryDocId === doc.id ? 'not-allowed' : 'pointer',
                            color: '#6A1B9A',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 700,
                            transition: 'all var(--transition-fast)',
                            opacity: buildingMemoryDocId === doc.id ? 0.7 : 1,
                          }}
                        >
                          <Network
                            size={14}
                            className={buildingMemoryDocId === doc.id ? 'animate-spin' : ''}
                            color="#6A1B9A"
                          />
                          <span>
                            {buildingMemoryDocId === doc.id ? 'Building...' : 'Build Memory'}
                          </span>
                        </button>

                        <button
                          title="View Extracted Text"
                          onClick={() => handleViewContent(doc.id)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: 'var(--color-warm-cream)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            color: 'var(--color-deep-cocoa)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            transition: 'all var(--transition-fast)',
                          }}
                        >
                          <Eye size={14} color="var(--color-nexus-orange)" />
                          <span>View</span>
                        </button>

                        <button
                          title="Delete Document"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDelete(doc.id, doc.originalName)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: 'transparent',
                            border: '1px solid var(--color-border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            color: 'var(--color-error)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            opacity: deletingId === doc.id ? 0.5 : 1,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Phase 4B: Memory Build Result Panel */}
      {memoryResult && (
        <div
          id="memory-result-panel"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '32px',
            zIndex: 2000,
            maxWidth: '480px',
            width: '100%',
            background: 'linear-gradient(135deg, #F3E5F5 0%, #EDE7F6 100%)',
            border: '1.5px solid #9C27B0',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 32px rgba(106, 27, 154, 0.2)',
            padding: '20px 24px',
            animation: 'slideInUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#9C27B0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Network size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '15px', color: '#4A148C' }}>
                  Memory Built!
                </div>
                <div style={{ fontSize: '12px', color: '#6A1B9A', opacity: 0.8 }}>
                  {memoryResult.docName}
                </div>
              </div>
            </div>
            <button
              onClick={() => setMemoryResult(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6A1B9A', padding: '2px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A148C' }}>
                {memoryResult.result.entitiesCreated + memoryResult.result.entitiesReused}
              </div>
              <div style={{ fontSize: '12px', color: '#6A1B9A', fontWeight: 600 }}>
                Entities ({memoryResult.result.entitiesCreated} new · {memoryResult.result.entitiesReused} reused)
              </div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A148C' }}>
                {memoryResult.result.relationshipsCreated}
              </div>
              <div style={{ fontSize: '12px', color: '#6A1B9A', fontWeight: 600 }}>Relationships Created</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A148C' }}>
                {memoryResult.result.memoriesCreated}
              </div>
              <div style={{ fontSize: '12px', color: '#6A1B9A', fontWeight: 600 }}>Memory Records</div>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#4A148C' }}>
                {memoryResult.result.timelineEventsCreated}
              </div>
              <div style={{ fontSize: '12px', color: '#6A1B9A', fontWeight: 600 }}>Timeline Events</div>
            </div>
          </div>

          {/* Status */}
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: memoryResult.result.status === 'SUCCESS' ? '#E8F5E9' : '#FFF3E0',
            color: memoryResult.result.status === 'SUCCESS' ? '#1B5E20' : '#E65100',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Check size={13} />
            {memoryResult.result.status === 'SUCCESS'
              ? 'Memory successfully persisted to the Personal Knowledge Graph.'
              : 'Memory partially built — some records may be missing.'}
          </div>
        </div>
      )}

      {/* Extracted Text Content Modal */}
      {selectedDocContent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 29, 21, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000,
          }}
          onClick={() => setSelectedDocContent(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-cream-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '720px',
              width: '100%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-peach-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={22} color="var(--color-nexus-orange)" />
                <div>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 700,
                      color: 'var(--color-deep-cocoa)',
                    }}
                  >
                    {selectedDocContent.originalName}
                  </h3>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: 'var(--color-muted-brown)' }}>
                    <span>Parser: <strong>{selectedDocContent.extractionMethod}</strong></span>
                    <span>•</span>
                    <span>Size: <strong>{formatFileSize(selectedDocContent.fileSize)}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopyText}
                  title="Copy extracted text"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-cream-surface)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--color-deep-cocoa)',
                  }}
                >
                  {isCopied ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => setSelectedDocContent(null)}
                  style={{
                    padding: '6px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-muted-brown)',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body - Extracted Content */}
            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-muted-brown)', textTransform: 'uppercase' }}>
                  Raw Deterministic Extracted Text (Ground-Truth Source)
                </span>
                <Badge variant="success" icon={<ShieldCheck size={12} />}>
                  Ready for AI Pipeline
                </Badge>
              </div>

              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--color-warm-cream)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: 'var(--color-deep-cocoa)',
                  minHeight: '180px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}
              >
                {selectedDocContent.extractedText || (
                  <span style={{ fontStyle: 'italic', color: 'var(--color-light-brown)' }}>
                    No extractable text found in this file.
                  </span>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-warm-cream)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles size={14} />}
                disabled={understandingDocId === selectedDocContent.documentId || !selectedDocContent.extractedText}
                onClick={() => {
                  const docId = selectedDocContent.documentId;
                  const docName = selectedDocContent.originalName;
                  setSelectedDocContent(null);
                  handleUnderstand(docId, docName);
                }}
              >
                Understand Document with AI
              </Button>

              <Button variant="secondary" size="sm" onClick={() => setSelectedDocContent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Structured Understanding Modal */}
      {selectedUnderstanding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(43, 29, 21, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 1000,
          }}
          onClick={() => setSelectedUnderstanding(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-cream-surface)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '840px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* AI Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'var(--color-peach-light)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-nexus-orange)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Brain size={20} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        color: 'var(--color-deep-cocoa)',
                      }}
                    >
                      {selectedUnderstanding.docName}
                    </h3>
                    <Badge variant="orange">
                      {selectedUnderstanding.data.documentClassification?.type?.toUpperCase() || 'DOCUMENT'} (
                      {formatConfidence(selectedUnderstanding.data.documentClassification?.confidence || 0.9)})
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '2px' }}>
                    <span>Model: <strong>{selectedUnderstanding.data.aiModel || 'Gemini 1.5'}</strong></span>
                    <span>•</span>
                    <span>Prompt: <strong>{selectedUnderstanding.data.promptVersion || '4a.v1'}</strong></span>
                    {selectedUnderstanding.cached && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--color-sage-accent)', fontWeight: 600 }}>Cached Understanding</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUnderstanding(null)}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-muted-brown)',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Privacy Notice Banner */}
            <div
              style={{
                padding: '10px 24px',
                backgroundColor: '#FFFBEB',
                borderBottom: '1px solid #FDE68A',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#92400E',
              }}
            >
              <Info size={15} />
              <span>
                <strong>Privacy Notice:</strong> AI understanding uses Gemini to analyze extracted document text. Private documents are never uploaded to external storage.
              </span>
            </div>

            {/* AI Summary Banner */}
            {selectedUnderstanding.data.summary && (
              <div
                style={{
                  padding: '14px 24px',
                  backgroundColor: 'var(--color-warm-cream)',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '13px',
                  color: 'var(--color-deep-cocoa)',
                  lineHeight: '1.5',
                }}
              >
                <strong>Summary: </strong>
                <span>{selectedUnderstanding.data.summary}</span>
              </div>
            )}

            {/* Tab Navigation */}
            <div
              style={{
                display: 'flex',
                gap: '4px',
                padding: '8px 24px 0 24px',
                backgroundColor: 'var(--color-cream-surface)',
                borderBottom: '1px solid var(--color-border)',
                overflowX: 'auto',
              }}
            >
              {[
                { id: 'overview', label: 'Overview', count: null },
                { id: 'entities', label: 'Entities', count: selectedUnderstanding.data.entities?.length || 0 },
                { id: 'dates', label: 'Dates', count: selectedUnderstanding.data.dates?.length || 0 },
                { id: 'amounts', label: 'Amounts', count: selectedUnderstanding.data.amounts?.length || 0 },
                { id: 'events', label: 'Events', count: selectedUnderstanding.data.events?.length || 0 },
                { id: 'relationships', label: 'Relationships', count: selectedUnderstanding.data.relationships?.length || 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 14px',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--color-nexus-orange)' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === tab.id ? 'var(--color-nexus-orange)' : 'var(--color-muted-brown)',
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: activeTab === tab.id ? 'var(--color-peach-light)' : 'var(--color-warm-cream)',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content Body */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Semantic Fact Counts Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <Layers size={18} color="var(--color-nexus-orange)" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.entities?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Entities
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <Calendar size={18} color="var(--color-sage-accent)" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.dates?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Temporal Dates
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <DollarSign size={18} color="var(--color-terracotta)" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.amounts?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Amounts
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <Clock size={18} color="#D97706" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.events?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Events
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <Link2 size={18} color="#2563EB" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.relationships?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Relationships
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '14px',
                        backgroundColor: 'var(--color-warm-cream)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        textAlign: 'center',
                      }}
                    >
                      <Hash size={18} color="#7C3AED" style={{ margin: '0 auto 6px auto' }} />
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                        {selectedUnderstanding.data.identifiers?.length || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-muted-brown)', fontWeight: 600 }}>
                        Identifiers
                      </div>
                    </div>
                  </div>

                  {/* Highlights section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                      Semantic Highlights
                    </h4>

                    {selectedUnderstanding.data.entities?.slice(0, 3).map((ent, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-warm-cream)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-deep-cocoa)' }}>
                            {ent.name}
                          </div>
                          {ent.evidence && (
                            <div style={{ fontSize: '12px', color: 'var(--color-muted-brown)', fontStyle: 'italic', marginTop: '2px' }}>
                              “{ent.evidence}”
                            </div>
                          )}
                        </div>
                        <Badge variant="peach">{ent.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities Tab */}
              {activeTab === 'entities' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!selectedUnderstanding.data.entities || selectedUnderstanding.data.entities.length === 0) ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)' }}>
                      No entities extracted for this document.
                    </div>
                  ) : (
                    selectedUnderstanding.data.entities.map((ent, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: 'var(--color-warm-cream)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                            {ent.name}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Badge variant="peach">{ent.type}</Badge>
                            <span style={{ fontSize: '11px', color: 'var(--color-sage-accent)', fontWeight: 700 }}>
                              {formatConfidence(ent.confidence)}
                            </span>
                          </div>
                        </div>

                        {ent.normalizedName && ent.normalizedName !== ent.name && (
                          <div style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                            Normalized: <code>{ent.normalizedName}</code>
                          </div>
                        )}

                        {ent.evidence && (
                          <div
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--color-cream-surface)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--color-nexus-orange)',
                              color: 'var(--color-deep-cocoa)',
                              fontStyle: 'italic',
                            }}
                          >
                            <strong>Evidence: </strong>"{ent.evidence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Dates Tab */}
              {activeTab === 'dates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!selectedUnderstanding.data.dates || selectedUnderstanding.data.dates.length === 0) ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)' }}>
                      No temporal dates extracted for this document.
                    </div>
                  ) : (
                    selectedUnderstanding.data.dates.map((dateItem, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: 'var(--color-warm-cream)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Calendar size={16} color="var(--color-nexus-orange)" />
                            <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-cocoa)', fontFamily: 'monospace' }}>
                              {dateItem.value}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Badge variant="orange">{dateItem.type}</Badge>
                            <Badge variant="neutral">{dateItem.precision}</Badge>
                            <span style={{ fontSize: '11px', color: 'var(--color-sage-accent)', fontWeight: 700 }}>
                              {formatConfidence(dateItem.confidence)}
                            </span>
                          </div>
                        </div>

                        {dateItem.evidence && (
                          <div
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--color-cream-surface)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--color-nexus-orange)',
                              color: 'var(--color-deep-cocoa)',
                              fontStyle: 'italic',
                            }}
                          >
                            <strong>Evidence: </strong>"{dateItem.evidence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Amounts Tab */}
              {activeTab === 'amounts' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!selectedUnderstanding.data.amounts || selectedUnderstanding.data.amounts.length === 0) ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)' }}>
                      No financial amounts extracted for this document.
                    </div>
                  ) : (
                    selectedUnderstanding.data.amounts.map((amt, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: 'var(--color-warm-cream)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <DollarSign size={16} color="var(--color-terracotta)" />
                            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                              {amt.currency} {amt.value.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <Badge variant="peach">{amt.type}</Badge>
                            <span style={{ fontSize: '11px', color: 'var(--color-sage-accent)', fontWeight: 700 }}>
                              {formatConfidence(amt.confidence)}
                            </span>
                          </div>
                        </div>

                        {amt.evidence && (
                          <div
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--color-cream-surface)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--color-terracotta)',
                              color: 'var(--color-deep-cocoa)',
                              fontStyle: 'italic',
                            }}
                          >
                            <strong>Evidence: </strong>"{amt.evidence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Events Tab */}
              {activeTab === 'events' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!selectedUnderstanding.data.events || selectedUnderstanding.data.events.length === 0) ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)' }}>
                      No timeline events extracted for this document.
                    </div>
                  ) : (
                    selectedUnderstanding.data.events.map((evt, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: 'var(--color-warm-cream)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                            {evt.title}
                          </span>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {evt.date && (
                              <Badge variant="orange">
                                <Calendar size={11} style={{ marginRight: '4px' }} />
                                {evt.date}
                              </Badge>
                            )}
                            <span style={{ fontSize: '11px', color: 'var(--color-sage-accent)', fontWeight: 700 }}>
                              {formatConfidence(evt.confidence)}
                            </span>
                          </div>
                        </div>

                        {evt.description && (
                          <div style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
                            {evt.description}
                          </div>
                        )}

                        {evt.evidence && (
                          <div
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--color-cream-surface)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--color-nexus-orange)',
                              color: 'var(--color-deep-cocoa)',
                              fontStyle: 'italic',
                            }}
                          >
                            <strong>Evidence: </strong>"{evt.evidence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Relationships Tab */}
              {activeTab === 'relationships' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(!selectedUnderstanding.data.relationships || selectedUnderstanding.data.relationships.length === 0) ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-brown)' }}>
                      No entity relationships extracted for this document.
                    </div>
                  ) : (
                    selectedUnderstanding.data.relationships.map((rel, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: 'var(--color-warm-cream)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                              {rel.from}
                            </span>
                            <Badge variant="peach">{rel.relationship}</Badge>
                            <span style={{ fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                              {rel.to}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--color-sage-accent)', fontWeight: 700 }}>
                            {formatConfidence(rel.confidence)}
                          </span>
                        </div>

                        {rel.evidence && (
                          <div
                            style={{
                              fontSize: '12px',
                              backgroundColor: 'var(--color-cream-surface)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              borderLeft: '3px solid var(--color-nexus-orange)',
                              color: 'var(--color-deep-cocoa)',
                              fontStyle: 'italic',
                            }}
                          >
                            <strong>Evidence: </strong>"{rel.evidence}"
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* AI Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-warm-cream)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Button
                variant="secondary"
                size="sm"
                icon={<RefreshCw size={14} className={understandingDocId === selectedUnderstanding.data.documentId ? 'animate-spin' : ''} />}
                disabled={understandingDocId === selectedUnderstanding.data.documentId}
                onClick={() => {
                  handleUnderstand(selectedUnderstanding.data.documentId, selectedUnderstanding.docName, true);
                }}
              >
                Re-Analyze with Gemini
              </Button>

              <Button variant="primary" size="sm" onClick={() => setSelectedUnderstanding(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
