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
  Calendar,
  HardDrive,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';
import {
  getDocuments,
  getDocumentContent,
  deleteDocument,
  DocumentContentResult,
} from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detail / Content Modal State
  const [selectedDocContent, setSelectedDocContent] = useState<DocumentContentResult | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

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
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                Document ID: <code style={{ fontSize: '11px' }}>{selectedDocContent.documentId}</code>
              </span>
              <Button variant="secondary" size="sm" onClick={() => setSelectedDocContent(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
