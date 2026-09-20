import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, FileText, AlertCircle } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const ImportPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessed(true);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
          Universal Import
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          Drop in receipts, warranties, flight tickets, certificates, or personal notes to expand your knowledge graph.
        </p>
      </div>

      {/* Drag & Drop Card */}
      <Card style={{ padding: '48px 24px', textAlign: 'center' }}>
        <input
          type="file"
          id="file-input"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="file-input"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-peach-light)',
              color: 'var(--color-nexus-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <UploadCloud size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            Click to upload or drag and drop
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginBottom: '16px' }}>
            Supports PDF, PNG, JPG, JPEG, and TXT (up to 15MB per file)
          </p>
          <Button variant="secondary" size="md">
            Select Files From Device
          </Button>
        </label>
      </Card>

      {/* Staged Files and Progress */}
      {files.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Staged Files ({files.length})</h3>
            {!processed && (
              <Button
                variant="primary"
                size="md"
                onClick={startProcessing}
                isLoading={isProcessing}
                icon={<UploadCloud size={16} />}
              >
                Process & Connect Memories
              </Button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {files.map((file, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-warm-cream)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} color="var(--color-nexus-orange)" />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{file.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {isProcessing ? (
                  <Badge variant="peach" icon={<Loader2 size={12} className="animate-spin" />}>
                    Extracting Knowledge...
                  </Badge>
                ) : processed ? (
                  <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                    Connected to Graph
                  </Badge>
                ) : (
                  <Badge variant="neutral">Ready</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
