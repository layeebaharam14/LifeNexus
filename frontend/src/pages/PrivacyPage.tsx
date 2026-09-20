import React from 'react';
import { ShieldCheck, Trash2, Download, Database, HardDrive, Key } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const PrivacyPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
          Privacy Center & Data Sovereignty
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          You have absolute ownership and control over your personal knowledge layer.
        </p>
      </div>

      {/* Storage Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <HardDrive size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>File Storage</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>8 Files (9.8 KB)</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Stored in private local sandbox
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Database size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Graph Nodes & Edges</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>191 Knowledge Records</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Multi-tenant isolated by User ID
          </p>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <Key size={20} color="var(--color-nexus-orange)" />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Access Security</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800 }}>JWT Scoped</div>
          <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)', marginTop: '4px' }}>
            Zero third-party telemetry
          </p>
        </Card>
      </div>

      {/* Data Sovereignty Actions */}
      <Card>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Data Export & Purge Actions
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-muted-brown)', marginBottom: '24px' }}>
          Export your complete personal memory graph in JSON format, or execute an irrevocable hard purge of your entire workspace.
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={<Download size={16} />}>
            Export Knowledge Graph (JSON)
          </Button>
          <Button variant="danger" icon={<Trash2 size={16} />}>
            Purge All Workspace Data
          </Button>
        </div>
      </Card>
    </div>
  );
};
