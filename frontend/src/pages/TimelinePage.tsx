import React from 'react';
import { Clock, Calendar, FileText, CheckCircle2, Award, Briefcase, ShoppingBag } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Badge } from '../components/common/Badge.js';

export const TimelinePage: React.FC = () => {
  const events = [
    {
      year: '2026',
      month: 'July',
      date: '2026-07-22',
      title: 'Laptop OLED Display Service Completed',
      description: 'Display cable replaced under warranty at F1 Service Center (₹0.00 billed).',
      category: 'Asset',
      icon: ShoppingBag,
      source: 'laptop_repair_receipt.txt',
      precision: 'Exact Date',
    },
    {
      year: '2026',
      month: 'March',
      date: '2026-03-14',
      title: 'Purchased ASUS Vivobook 15 OLED',
      description: 'Bought from Croma Indiranagar for ₹68,000. 2-Year extended care registered.',
      category: 'Asset',
      icon: ShoppingBag,
      source: 'laptop_invoice.txt',
      precision: 'Exact Date',
    },
    {
      year: '2025',
      month: 'December',
      date: '2025-12-14',
      title: 'Won 1st Place at HACKDAY 2025 (Hyderabad)',
      description: 'Awarded ₹1,00,000 cash prize for "BrainMesh" personal memory AI project.',
      category: 'Career',
      icon: Award,
      source: 'hackathon_winner_certificate.txt',
      precision: 'Exact Date',
    },
    {
      year: '2025',
      month: 'August',
      date: '2025-08-31',
      title: 'Completed AI Research Internship at NexusAITech',
      description: '3-month summer internship on Knowledge Graph neuro-symbolic extraction.',
      category: 'Education',
      icon: Briefcase,
      source: 'ai_internship_certificate.txt',
      precision: 'Exact Date',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
          Life Timeline
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          Chronological milestone chronicle automatically reconstructed from your personal records.
        </p>
      </div>

      {/* Timeline Continuous Spine */}
      <div style={{ position: 'relative', paddingLeft: '32px', borderLeft: '3px solid var(--color-nexus-orange)' }}>
        {events.map((evt, idx) => {
          const Icon = evt.icon;
          return (
            <div key={idx} style={{ marginBottom: '32px', position: 'relative' }}>
              {/* Spine Node Dot */}
              <div
                style={{
                  position: 'absolute',
                  left: '-44px',
                  top: '16px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--color-nexus-orange)',
                  border: '4px solid var(--color-warm-cream)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              />

              <Card style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge variant="orange">{evt.month} {evt.year}</Badge>
                    <Badge variant="neutral">{evt.precision}</Badge>
                  </div>
                  <Badge variant="peach">{evt.category}</Badge>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>{evt.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)', lineHeight: '1.5', marginBottom: '14px' }}>
                  {evt.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-light-brown)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                  <FileText size={14} color="var(--color-nexus-orange)" />
                  <span>Source: {evt.source}</span>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
