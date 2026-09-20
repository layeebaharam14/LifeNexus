import React, { useState, useRef } from 'react';
import { UploadCloud, FileCheck, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button.js';
import { MAX_FILE_SIZE_MB, SUPPORTED_EXTENSIONS } from '../../hooks/useUpload.js';

interface DropzoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        border: `2px dashed ${
          isDragOver ? 'var(--color-nexus-orange)' : 'var(--color-border)'
        }`,
        backgroundColor: isDragOver
          ? 'var(--color-peach-light)'
          : 'var(--color-cream-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '48px 24px',
        textAlign: 'center',
        transition: 'all var(--transition-fast)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: isDragOver ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
        opacity: disabled ? 0.6 : 1,
      }}
      onClick={() => {
        if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.png,.jpg,.jpeg,application/pdf,text/plain,image/png,image/jpeg"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: isDragOver
            ? 'var(--color-nexus-orange)'
            : 'var(--color-peach-light)',
          color: isDragOver ? '#FFFFFF' : 'var(--color-nexus-orange)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          transition: 'all var(--transition-fast)',
        }}
      >
        <UploadCloud size={34} />
      </div>

      <h3
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--color-deep-cocoa)',
          marginBottom: '6px',
        }}
      >
        {isDragOver ? 'Drop files to import' : 'Drag & drop personal files here'}
      </h3>

      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-muted-brown)',
          maxWidth: '460px',
          margin: '0 auto 20px auto',
          lineHeight: '1.5',
        }}
      >
        Universal ingestion for invoices, receipts, warranties, flight tickets, certificates, or personal notes.
      </p>

      <div style={{ display: 'inline-block' }}>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Browse Files from Device
        </Button>
      </div>

      <div
        style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px',
          fontSize: '12px',
          color: 'var(--color-light-brown)',
          flexWrap: 'wrap',
        }}
      >
        <span>
          <strong>Formats:</strong> {SUPPORTED_EXTENSIONS.join(', ').toUpperCase()}
        </span>
        <span>•</span>
        <span>
          <strong>Limit:</strong> Up to {MAX_FILE_SIZE_MB}MB per file
        </span>
        <span>•</span>
        <span>
          <strong>Storage:</strong> Private user-scoped storage
        </span>

      </div>
    </div>
  );
};
