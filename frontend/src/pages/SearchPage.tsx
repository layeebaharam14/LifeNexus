import React, { useState } from 'react';
import { Search, Sparkles, FileText, ArrowRight, Network } from 'lucide-react';
import { Card } from '../components/common/Card.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';

export const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('Tell me everything about my laptop');
  const [searched, setSearched] = useState(true);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontFamily: 'var(--font-family-display)', fontSize: '28px', fontWeight: 800 }}>
          Life Search
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-muted-brown)' }}>
          Natural language personal recall grounded strictly in your verified documents.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--color-cream-surface)',
            border: '2px solid var(--color-apricot)',
            borderRadius: 'var(--radius-xl)',
            padding: '8px 16px',
            boxShadow: 'var(--shadow-md)',
            gap: '12px',
          }}
        >
          <Search size={22} color="var(--color-nexus-orange)" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your life memory... (e.g. 'When did I start AI?' or 'Laptop warranty')"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              backgroundColor: 'transparent',
              color: 'var(--color-deep-cocoa)',
            }}
          />
          <Button type="submit" variant="primary" size="md">
            Ask Memory
          </Button>
        </div>
      </form>

      {/* Preset Query Chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          'Tell me everything about my laptop',
          'What certificates did I receive in 2025?',
          'When does my health insurance expire?',
          'Show my travel and flights',
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(chip);
              setSearched(true);
            }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-peach-light)',
              border: '1px solid var(--color-soft-peach)',
              color: 'var(--color-deep-cocoa)',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Grounded Answer Card */}
      {searched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card highlight style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Badge variant="orange" icon={<Sparkles size={14} />}>
                Grounded Memory Synthesis (Confidence: 98%)
              </Badge>
              <Badge variant="success">3 Verified Sources</Badge>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              ASUS Vivobook 15 OLED (M1505YA-OLED)
            </h3>

            <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'var(--color-deep-cocoa)', marginBottom: '20px' }}>
              You purchased your <strong>ASUS Vivobook 15 OLED</strong> on <strong>March 14, 2026</strong> from Croma Electronics (Indiranagar, Bangalore) for <strong>₹68,000.00</strong> using UPI via HDFC Bank.
              The device is registered with serial number <code>NX8821-ASUS-2026</code>.
              It is covered by <strong>Asus Premium Care</strong> through <strong>March 14, 2028</strong> (Extended 2-Year Protection).
              On <strong>July 22, 2026</strong>, you serviced the device at F1 Info Solutions for an OLED display cable replacement, which was fully covered (₹0.00) under your warranty.
            </p>

            {/* Clickable Sources */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted-brown)' }}>
                VERIFIED SOURCE DOCUMENTS:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream-surface)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 500 }}>
                  <FileText size={14} color="var(--color-nexus-orange)" /> laptop_invoice.txt (Page 1)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream-surface)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 500 }}>
                  <FileText size={14} color="var(--color-nexus-orange)" /> laptop_warranty.txt (Cert #APC-2026-991827)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--color-cream-surface)', border: '1px solid var(--color-border)', fontSize: '13px', fontWeight: 500 }}>
                  <FileText size={14} color="var(--color-nexus-orange)" /> laptop_repair_receipt.txt (Job #SR-ASUS-0741)
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
