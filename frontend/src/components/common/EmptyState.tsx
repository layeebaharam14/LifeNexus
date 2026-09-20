import React from 'react';
import { Button } from './Button.js';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        background: 'var(--color-cream-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '560px',
        margin: '32px auto',
      }}
    >
      {icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-peach-light)',
            color: 'var(--color-nexus-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontFamily: 'var(--font-family-display)',
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-deep-cocoa)',
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: 'var(--color-muted-brown)',
          maxWidth: '400px',
          lineHeight: '1.6',
          marginBottom: actionText ? '24px' : '0',
        }}
      >
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
