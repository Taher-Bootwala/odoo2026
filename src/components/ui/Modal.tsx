'use client';

import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(30, 48, 64, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        borderRadius: 'var(--border-radius-lg)',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
        animation: 'cardFadeIn 0.3s ease both'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border-light)',
          background: 'linear-gradient(to right, var(--ivory-50), var(--color-surface))'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '700', color: 'var(--blue-800)' }}>{title}</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'var(--blue-50)',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--ivory-300)';
              e.currentTarget.style.color = 'var(--blue-700)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--blue-50)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '24px', color: 'var(--color-text)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
