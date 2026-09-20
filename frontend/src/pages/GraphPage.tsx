import React, { useState } from 'react';
import { Network, Filter, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export const GraphPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('ASUS Vivobook 15');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
            Life Graph
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
            Interactive visual network of your connected life entities, documents, and relationships.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant="orange">124 Entities</Badge>
          <Badge variant="peach">67 Discovered Edges</Badge>
        </div>
      </div>

      {/* Graph Visualizer Canvas & Detail Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', minHeight: '560px' }}>
        {/* Interactive Canvas */}
        <Card
          style={{
            position: 'relative',
            backgroundColor: '#1E1917',
            color: '#FFFFFF',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px',
          }}
        >
          {/* Top Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="neutral" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: 'none' }}>
                All Categories
              </Badge>
              <Badge variant="neutral" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: 'none' }}>
                Assets
              </Badge>
              <Badge variant="neutral" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', border: 'none' }}>
                Documents
              </Badge>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#FFF' }}>
                <ZoomIn size={16} />
              </button>
              <button style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '6px', color: '#FFF' }}>
                <ZoomOut size={16} />
              </button>
            </div>
          </div>

          {/* Canvas Illustration */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }}>
            {/* Center Node */}
            <div
              onClick={() => setSelectedNode('ASUS Vivobook 15')}
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                background: 'var(--gradient-brand)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 35px rgba(244, 122, 69, 0.5)',
                cursor: 'pointer',
                textAlign: 'center',
                padding: '10px',
                zIndex: 5,
              }}
            >
              <Network size={28} color="#FFFFFF" />
              <span style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>ASUS Vivobook</span>
              <span style={{ fontSize: '10px', opacity: 0.9 }}>Asset Node</span>
            </div>

            {/* Satellite Connected Nodes */}
            <div
              onClick={() => setSelectedNode('Croma Invoice')}
              style={{
                position: 'absolute',
                top: '60px',
                left: '120px',
                padding: '10px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 176, 124, 0.25)',
                border: '1px solid var(--color-apricot)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              📄 Invoice (₹68,000)
            </div>

            <div
              onClick={() => setSelectedNode('Warranty Protection')}
              style={{
                position: 'absolute',
                bottom: '80px',
                left: '100px',
                padding: '10px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 176, 124, 0.25)',
                border: '1px solid var(--color-apricot)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              🛡️ Asus Premium Care (2028)
            </div>

            <div
              onClick={() => setSelectedNode('Repair Job')}
              style={{
                position: 'absolute',
                top: '120px',
                right: '120px',
                padding: '10px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 176, 124, 0.25)',
                border: '1px solid var(--color-apricot)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              🔧 F1 Service Center (July 2026)
            </div>
          </div>

          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
            Click on any node to view connected memories and source documents.
          </div>
        </Card>

        {/* Selected Node Details Drawer */}
        <Card style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <Badge variant="orange" style={{ marginBottom: '8px' }}>Entity Details</Badge>
            <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{selectedNode}</h3>
            <p style={{ fontSize: '12px', color: 'var(--color-muted-brown)' }}>Type: Primary Physical Asset</p>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>ATTRIBUTES</span>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>Serial:</strong> NX8821-ASUS-2026</div>
              <div><strong>Purchase Price:</strong> ₹68,000.00</div>
              <div><strong>Status:</strong> Active / Covered</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>CONNECTED DOCUMENTS (3)</span>
            <ul style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>• laptop_invoice.txt</li>
              <li>• laptop_warranty.txt</li>
              <li>• laptop_repair_receipt.txt</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};
