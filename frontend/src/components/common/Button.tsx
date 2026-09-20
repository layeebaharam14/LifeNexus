import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--color-nexus-orange)',
          color: '#FFFFFF',
          boxShadow: 'var(--shadow-sm)',
        };
      case 'secondary':
        return {
          background: 'var(--color-peach-light)',
          color: 'var(--color-deep-cocoa)',
          border: '1px solid var(--color-soft-peach)',
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--color-deep-cocoa)',
          border: '1px solid var(--color-border)',
        };
      case 'danger':
        return {
          background: 'var(--color-error-bg)',
          color: 'var(--color-error)',
          border: '1px solid rgba(198, 90, 85, 0.2)',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--color-muted-brown)',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return { padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)' };
      case 'md':
        return { padding: '10px 18px', fontSize: '14px', borderRadius: 'var(--radius-md)' };
      case 'lg':
        return { padding: '14px 24px', fontSize: '16px', borderRadius: 'var(--radius-md)' };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
        opacity: disabled || isLoading ? 0.6 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`nexus-btn ${className}`}
      {...props}
    >
      {isLoading ? (
        <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
};
