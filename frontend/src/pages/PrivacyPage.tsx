import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Trash2,
  Download,
  Database,
  HardDrive,
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  X,
  FileText,
  Network,
} from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import {
  getPrivacyStats,
  exportWorkspace,
  purgeWorkspace,
  PrivacyStats,
} from '../services/privacyService.js';

export const PrivacyPage: React.FC = () => {
  const [stats, setStats] = useState<PrivacyStats>({
    totalDocs: 0,
    totalSizeBytes: 0,
    totalEntities: 0,
    totalRelationships: 0,
    totalMemories: 0,
    totalTimelineEvents: 0,
    totalKnowledgeRecords: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [showPurgeModal, setShowPurgeModal] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getPrivacyStats();
      if (res.success && res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (_err) {
      // Failed to load stats
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const formatStorageSize = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle JSON export and trigger browser download
  const handleExport = async () => {
    setIsExporting(true);
    setActionMessage(null);
    try {
      const res = await exportWorkspace();
      if (res.success && res.data?.exportData) {
        const dataStr = JSON.stringify(res.data.exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateTag = new Date().toISOString().split('T')[0];
        a.download = `lifenexus-memory-export-${dateTag}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setActionMessage({
          type: 'success',
          text: `Workspace export generated successfully (${res.data.exportData.summary.totalDocuments} documents, ${res.data.exportData.summary.totalEntities} entities).`,
        });
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Failed to export workspace data.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Export failed.' });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Clear Workspace (Purge)
  const handleConfirmPurge = async () => {
    setIsPurging(true);
    setActionMessage(null);
    try {
      const res = await purgeWorkspace();
      if (res.success) {
        setShowPurgeModal(false);
        setActionMessage({
          type: 'success',
          text: 'Workspace completely purged. All documents, files, and derived memory records have been deleted.',
        });
        await fetchStats();
      } else {
        setActionMessage({ type: 'error', text: res.error || 'Failed to purge workspace.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err?.message || 'Purge failed.' });
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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

        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={14} className={isLoading ? 'spin' : ''} />}
          onClick={fetchStats}
          disabled={isLoading}
        >
          Refresh Stats
        </Button>
      </div>

      {/* Notification Toast */}
      {actionMessage && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: actionMessage.type === 'success' ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${actionMessage.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            color: actionMessage.type === 'success' ? '#166534' : '#991B1B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Live Storage & Knowledge Breakdown Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* File Storage */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <HardDrive size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              File Storage
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            {isLoading ? '...' : `${stats.totalDocs} File${stats.totalDocs !== 1 ? 's' : ''} (${formatStorageSize(stats.totalSizeBytes)})`}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '6px' }}>
            Stored in private user-scoped storage
          </p>
        </Card>

        {/* Live Knowledge Records */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Knowledge Records
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            {isLoading ? '...' : `${stats.totalKnowledgeRecords} Records`}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '6px' }}>
            {isLoading
              ? 'Loading...'
              : `${stats.totalEntities} entities • ${stats.totalRelationships} relations • ${stats.totalTimelineEvents} milestones • ${stats.totalMemories} memories`}
          </p>
        </Card>

        {/* Access Security */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Key size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
              Access Security
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
            JWT Cryptographic
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '6px' }}>
            Multi-tenant user boundary • Zero third-party telemetry
          </p>
        </Card>
      </div>

      {/* Data Sovereignty Actions */}
      <Card>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-deep-cocoa)' }}>
          Data Sovereignty & Local Control
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginBottom: '20px', lineHeight: '1.5' }}>
          Your uploaded documents, extracted text, and AI-derived memory graphs remain strictly within your account. You can download an offline JSON backup of your memory at any time, or permanently purge your workspace.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            icon={<Download size={16} />}
            onClick={handleExport}
            disabled={isExporting || isLoading}
          >
            {isExporting ? 'Generating JSON Export...' : 'Export Workspace Index (JSON)'}
          </Button>
        </div>
      </Card>

      {/* Danger Zone: Clear Workspace */}
      <Card style={{ border: '1px solid #FECACA', backgroundColor: '#FFFDFD' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Trash2 size={20} color="#DC2626" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>
              Clear Entire Workspace
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginBottom: '16px', lineHeight: '1.5' }}>
              Permanently delete all your uploaded files, extracted texts, document understandings, memory records, knowledge graph connections, and life timeline events. This action cannot be reversed.
            </p>
            <Button
              variant="danger"
              icon={<Trash2 size={16} />}
              onClick={() => setShowPurgeModal(true)}
              disabled={isPurging || isLoading}
            >
              Clear Entire Workspace
            </Button>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal for Workspace Purge */}
      {showPurgeModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(42, 33, 29, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => !isPurging && setShowPurgeModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-xl)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} color="#DC2626" />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                  Purge Entire Workspace?
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)' }}>
                  This action is permanent and irreversible.
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '14px',
                backgroundColor: 'var(--color-warm-cream)',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                color: 'var(--color-deep-cocoa)',
                lineHeight: '1.6',
                marginBottom: '20px',
                border: '1px solid var(--color-border-subtle)',
              }}
            >
              <p style={{ marginBottom: '8px', fontWeight: 600 }}>The following data will be permanently deleted:</p>
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>{stats.totalDocs}</strong> uploaded source files & extracted texts</li>
                <li><strong>{stats.totalEntities}</strong> normalized personal entities</li>
                <li><strong>{stats.totalRelationships}</strong> discovered relationships</li>
                <li><strong>{stats.totalTimelineEvents}</strong> chronological life events</li>
                <li><strong>{stats.totalMemories}</strong> episodic memory records</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Trash2 size={16} />}
                onClick={handleConfirmPurge}
                disabled={isPurging}
              >
                {isPurging ? 'Purging Workspace...' : 'Yes, Delete Everything'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
