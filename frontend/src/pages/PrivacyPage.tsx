import React, { useState, useEffect } from 'react';
import { ShieldCheck, Trash2, Download, Database, HardDrive, Key, RefreshCw } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { getDocuments } from '../services/documentService.js';
import { DocumentRecord } from '../types/index.js';

export const PrivacyPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDocStats = async () => {
      try {
        const res = await getDocuments();
        if (res.success && res.data?.documents) {
          setDocuments(res.data.documents);
        }
      } catch (_e) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocStats();
  }, []);

  const totalFiles = documents.length;
  const totalSizeBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);

  const formatStorageSize = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-family-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: 'var(--color-deep-cocoa)',
            marginBottom: '6px',
          }}
        >
          Privacy Center & Data Sovereignty
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          You have absolute ownership and control over your personal knowledge layer.
        </p>
      </div>

      {/* Storage Breakdown — Derived from actual Phase 3 user data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <HardDrive size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              File Storage
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            {isLoading ? '...' : `${totalFiles} File${totalFiles !== 1 ? 's' : ''} (${formatStorageSize(totalSizeBytes)})`}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Stored in private user-scoped storage
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Graph Nodes & Edges
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            0 Knowledge Records
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Knowledge records will appear after AI understanding is enabled in Phase 4
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Key size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Access Security
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            JWT Scoped
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Zero third-party telemetry
          </p>
        </Card>
      </div>

      {/* Data Sovereignty Actions */}
      <Card>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-deep-cocoa)' }}>
          Data Sovereignty & Local Storage
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginBottom: '24px', lineHeight: '1.5' }}>
          Your uploaded source documents and raw extracted texts are stored in user-isolated directories on your local backend.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={<Download size={16} />} onClick={() => alert('Exporting workspace metadata is available in Phase 4.')}>
            Export Workspace Index (JSON)
          </Button>
        </div>
      </Card>
    </div>
  );
};
