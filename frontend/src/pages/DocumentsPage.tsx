import React from 'react';
import { FileText, Trash2, Eye, ExternalLink } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';
import { Button } from '../components/common/Button.js';

export const DocumentsPage: React.FC = () => {
  const docs = [
    { name: 'laptop_invoice.txt', size: '1.2 KB', type: 'Invoice', date: 'March 14, 2026', entities: 5, status: 'PROCESSED' },
    { name: 'laptop_warranty.txt', size: '1.4 KB', type: 'Warranty', date: 'March 14, 2026', entities: 4, status: 'PROCESSED' },
    { name: 'laptop_repair_receipt.txt', size: '1.1 KB', type: 'Repair Slip', date: 'July 22, 2026', entities: 3, status: 'PROCESSED' },
    { name: 'ai_internship_certificate.txt', size: '1.3 KB', type: 'Certificate', date: 'August 31, 2025', entities: 4, status: 'PROCESSED' },
    { name: 'hackathon_winner_certificate.txt', size: '1.2 KB', type: 'Certificate', date: 'December 14, 2025', entities: 4, status: 'PROCESSED' },
    { name: 'flight_ticket.txt', size: '1.4 KB', type: 'Ticket', date: 'December 10, 2025', entities: 5, status: 'PROCESSED' },
    { name: 'cloud_subscription_invoice.txt', size: '1.0 KB', type: 'Subscription', date: 'August 1, 2026', entities: 3, status: 'PROCESSED' },
    { name: 'health_insurance_renewal.txt', size: '1.2 KB', type: 'Renewal Slip', date: 'October 15, 2025', entities: 4, status: 'PROCESSED' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
            Source Documents Repository
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
            All ingested files acting as ground-truth evidence anchors for your Knowledge Graph.
          </p>
        </div>
        <Badge variant="orange">{docs.length} Stored Documents</Badge>
      </div>

      <Card style={{ padding: '0px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: 'var(--color-peach-light)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Document Name</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Type</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Extracted Entities</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Date</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
              <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={18} color="var(--color-nexus-orange)" />
                  <div>
                    <span style={{ fontWeight: 600 }}>{doc.name}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-light-brown)' }}>{doc.size}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <Badge variant="peach">{doc.type}</Badge>
                </td>
                <td style={{ padding: '14px 20px' }}>{doc.entities} connected</td>
                <td style={{ padding: '14px 20px', color: 'var(--color-muted-brown)' }}>{doc.date}</td>
                <td style={{ padding: '14px 20px' }}>
                  <Badge variant="success">PROCESSED</Badge>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                  <button title="View Source" style={{ padding: '6px', color: 'var(--color-muted-brown)', marginRight: '8px' }}>
                    <Eye size={16} />
                  </button>
                  <button title="Delete Source" style={{ padding: '6px', color: 'var(--color-error)' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
