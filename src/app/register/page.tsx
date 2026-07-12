import Link from 'next/link'
import { signup } from '../login/actions'

export default async function RegisterPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-light)',
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <svg className="brand-icon" width="48" height="48" viewBox="0 0 32 32" fill="none" style={{ margin: '0 auto 16px' }}>
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#register-brand-grad)" />
            <path d="M10 22V14L16 10L22 14V22L16 18L10 22Z" fill="white" opacity="0.9" />
            <path d="M16 10V18" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="register-brand-grad" x1="2" y1="2" x2="30" y2="30">
                <stop stopColor="#5B7C99" />
                <stop offset="1" stopColor="#3D5A80" />
              </linearGradient>
            </defs>
          </svg>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 8px 0', color: 'var(--blue-800)' }}>Create an Account</h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.85rem' }}>Join AssetHub to manage your resources</p>
        </div>

        {searchParams?.error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--border-radius-sm)',
            marginBottom: '20px',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}>
            {String(searchParams.error)}
          </div>
        )}

        <form action={signup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--color-text)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--color-text)',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
