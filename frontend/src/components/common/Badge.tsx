import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'peach' | 'success' | 'warning' | 'error' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  icon,
  className = '',
  style,
}) => {
  const getBadgeStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'orange':
        return { background: 'rgba(244, 122, 69, 0.12)', color: 'var(--color-nexus-orange)', border: '1px solid rgba(244, 122, 69, 0.25)' };
      case 'peach':
        return { background: 'var(--color-peach-light)', color: 'var(--color-deep-cocoa)', border: '1px solid var(--color-soft-peach)' };
      case 'success':
        return { background: 'var(--color-success-bg)', color: 'var(--color-success)', border: '1px solid rgba(61, 139, 104, 0.25)' };
      case 'warning':
        return { background: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: '1px solid rgba(215, 149, 50, 0.25)' };
      case 'error':
        return { background: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid rgba(198, 90, 85, 0.25)' };
      case 'neutral':
        return { background: 'var(--color-border-subtle)', color: 'var(--color-muted-brown)', border: '1px solid var(--color-border)' };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '12px',
        fontWeight: 500,
        ...getBadgeStyles(),
        ...style,
      }}
      className={`nexus-badge ${className}`}
    >
      {icon}
      {children}
    </span>
  );
};
