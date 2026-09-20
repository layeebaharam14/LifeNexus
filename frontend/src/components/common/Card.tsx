import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: string | number;
  highlight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = '24px',
  highlight = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      style={{
        padding,
        background: highlight ? 'var(--color-peach-light)' : 'var(--color-cream-surface)',
        border: highlight ? '1px solid var(--color-apricot)' : '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        ...style,
      }}
      className={`nexus-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
