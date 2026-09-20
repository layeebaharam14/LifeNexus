import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, ArrowRight, RefreshCw, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Dropzone } from '../components/upload/Dropzone.js';
import { FilePreviewItem } from '../components/upload/FilePreviewItem.js';
import { IngestionProgress } from '../components/upload/IngestionProgress.js';
import { useUpload } from '../hooks/useUpload.js';

export const ImportPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    selectedFiles,
    validationErrors,
    stage,
    progress,
    errorMessage,
    uploadedDocuments,
    addFiles,
    removeFile,
    clearFiles,
    upload,
    isProcessing,
  } = useUpload();

  const handleUploadClick = async () => {
    await upload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
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
            Universal Document Ingestion
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
            Import personal documents to extract raw text and build ground-truth knowledge anchors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge variant="peach" icon={<ShieldCheck size={12} />}>
            Local Isolated Storage
          </Badge>
          <Badge variant="neutral">SHA-256 Deduplication</Badge>
        </div>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px' }}>
            <AlertTriangle size={18} />
            Some selected files could not be added:
          </div>
          <ul style={{ margin: 0, paddingLeft: '24px', fontSize: '13px' }}>
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.file.name}</strong>: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ingestion Error Alert */}
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
          <AlertTriangle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Stage: Ingestion Progress */}
      {isProcessing && (
        <IngestionProgress
          stage={stage}
          progress={progress}
          totalFiles={selectedFiles.length}
        />
      )}

      {/* Stage: Success Summary */}
      {stage === 'complete' && uploadedDocuments.length > 0 && (
        <Card style={{ padding: '32px', backgroundColor: 'var(--color-cream-surface)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage-accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-deep-cocoa)' }}>
                Ingestion Completed Successfully
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
                {uploadedDocuments.length} document{uploadedDocuments.length > 1 ? 's' : ''} stored and parsed into raw text representations.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {uploadedDocuments.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-warm-cream)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={18} color="var(--color-nexus-orange)" />
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{doc.originalName}</span>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                      <span>Type: {doc.documentType}</span>
                      <span>•</span>
                      <span>Parser: {doc.extractionMethod || 'native'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {doc.isDuplicate ? (
                    <Badge variant="orange">Existing Duplicate (Preserved)</Badge>
                  ) : (
                    <Badge variant="success">Parsed & Saved</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={clearFiles}>
              Ingest More Files
            </Button>
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/app/documents')}
            >
              View Ingested Documents
            </Button>
          </div>
        </Card>
      )}

      {/* Main Upload Area (when idle or staging) */}
      {stage !== 'complete' && (
        <>
          <Dropzone onFilesSelected={addFiles} disabled={isProcessing} />

          {/* Staged Files List */}
          {selectedFiles.length > 0 && (
            <Card>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-deep-cocoa)' }}>
                    Files Staged for Ingestion ({selectedFiles.length})
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                    Total size:{' '}
                    {(
                      selectedFiles.reduce((acc, f) => acc + f.size, 0) /
                      (1024 * 1024)
                    ).toFixed(2)}{' '}
                    MB
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                    onClick={clearFiles}
                  >
                    Clear All
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={isProcessing}
                    isLoading={isProcessing}
                    icon={<UploadCloud size={16} />}
                    onClick={handleUploadClick}
                  >
                    Start Ingestion Pipeline
                  </Button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedFiles.map((file, idx) => (
                  <FilePreviewItem
                    key={`${file.name}-${idx}`}
                    file={file}
                    onRemove={() => removeFile(idx)}
                    disabled={isProcessing}
                    status={isProcessing ? 'uploading' : 'staged'}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
