import React from 'react';
import { FileText, Image as ImageIcon, FileCode, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '../common/Badge.js';

interface FilePreviewItemProps {
  file: File;
  onRemove?: () => void;
  disabled?: boolean;
  error?: string;
  isDuplicate?: boolean;
  status?: 'staged' | 'uploading' | 'processed' | 'failed';
}

export const FilePreviewItem: React.FC<FilePreviewItemProps> = ({
  file,
  onRemove,
  disabled = false,
  error,
  isDuplicate = false,
  status = 'staged',
}) => {
  const getFileIcon = () => {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (ext === 'pdf') {
      return <FileText size={20} color="var(--color-nexus-orange)" />;
    }
    if (['png', 'jpg', 'jpeg'].includes(ext)) {
      return <ImageIcon size={20} color="var(--color-sage-accent)" />;
    }
    return <FileCode size={20} color="var(--color-terracotta)" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: error
          ? '#FEF2F2'
          : isDuplicate
          ? '#FFFBEB'
          : 'var(--color-warm-cream)',
        border: `1px solid ${
          error
            ? '#FCA5A5'
            : isDuplicate
            ? '#FDE68A'
            : 'var(--color-border)'
        }`,
        transition: 'all var(--transition-fast)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--color-cream-surface)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          {getFileIcon()}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-deep-cocoa)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.name}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
              {formatFileSize(file.size)}
            </span>
            {error && (
              <span style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
                • {error}
              </span>
            )}
            {isDuplicate && (
              <span style={{ fontSize: '12px', color: '#B45309', fontWeight: 500 }}>
                • Duplicate file detected (previously ingested)
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '12px' }}>
        {status === 'processed' && (
          <Badge variant="success" icon={<CheckCircle size={12} />}>
            Extracted
          </Badge>
        )}
        {status === 'failed' && (
          <Badge variant="orange" icon={<AlertTriangle size={12} />}>
            Failed
          </Badge>
        )}
        {status === 'uploading' && (
          <Badge variant="peach">Ingesting...</Badge>
        )}

        {onRemove && !disabled && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove file"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-light-brown)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-light-brown)')}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
