import React from 'react';
import { CheckCircle2, Loader2, ArrowRight, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import { IngestionStage } from '../../hooks/useUpload.js';

interface IngestionProgressProps {
  stage: IngestionStage;
  progress: number;
  totalFiles: number;
  processedCount?: number;
}

const STEPS = [
  { key: 'uploading', label: 'Uploading Files', desc: 'Secure transfer to private sandbox' },
  { key: 'reading', label: 'Reading Document', desc: 'SHA-256 hash & integrity check' },
  { key: 'extracting', label: 'Extracting Text', desc: 'Local native / OCR text parser' },
  { key: 'complete', label: 'Document Stored', desc: 'Ready for Life Knowledge Engine' },
];

export const IngestionProgress: React.FC<IngestionProgressProps> = ({
  stage,
  progress,
  totalFiles,
}) => {
  const getStepStatus = (index: number) => {
    if (stage === 'complete') return 'completed';
    if (stage === 'error') return index === 0 ? 'completed' : 'error';
    
    if (stage === 'uploading') {
      if (index === 0) return 'active';
      return 'pending';
    }
    
    if (stage === 'extracting') {
      if (index <= 1) return 'completed';
      if (index === 2) return 'active';
      return 'pending';
    }

    return 'pending';
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-cream-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {stage === 'complete' ? (
            <CheckCircle2 size={20} color="var(--color-success)" />
          ) : (
            <Loader2 size={20} color="var(--color-nexus-orange)" className="animate-spin" />
          )}
          <h4
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--color-deep-cocoa)',
            }}
          >
            {stage === 'complete'
              ? `Ingestion Complete (${totalFiles} file${totalFiles > 1 ? 's' : ''} processed)`
              : `Processing ${totalFiles} Document${totalFiles > 1 ? 's' : ''}...`}
          </h4>
        </div>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-nexus-orange)',
          }}
        >
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: 'var(--color-peach-light)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor:
              stage === 'complete'
                ? 'var(--color-success)'
                : 'var(--color-nexus-orange)',
            transition: 'width 400ms ease',
            borderRadius: '4px',
          }}
        />
      </div>

      {/* Honest Phase 3 Ingestion Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
        }}
      >
        {STEPS.map((step, idx) => {
          const status = getStepStatus(idx);
          const isDone = status === 'completed';
          const isActive = status === 'active';

          return (
            <div
              key={step.key}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive
                  ? 'var(--color-peach-light)'
                  : isDone
                  ? 'var(--color-warm-cream)'
                  : 'transparent',
                border: `1px solid ${
                  isActive
                    ? 'var(--color-nexus-orange)'
                    : isDone
                    ? 'var(--color-border)'
                    : 'var(--color-border-subtle)'
                }`,
                opacity: status === 'pending' ? 0.6 : 1,
                transition: 'all var(--transition-fast)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isDone
                      ? 'var(--color-success)'
                      : isActive
                      ? 'var(--color-nexus-orange)'
                      : 'var(--color-border)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: isActive || isDone ? 700 : 600,
                    color: isActive
                      ? 'var(--color-nexus-orange)'
                      : 'var(--color-deep-cocoa)',
                  }}
                >
                  {step.label}
                </span>
              </div>
              <p
                style={{
                  fontSize: '11px',
                  color: 'var(--color-muted-brown)',
                  marginLeft: '28px',
                }}
              >
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
