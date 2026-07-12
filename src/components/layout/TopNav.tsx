'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="top-nav" id="top-nav">
      <div className="nav-left">
        <button className="menu-toggle" id="menu-toggle" aria-label="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="brand" id="brand">
          <svg className="brand-icon" width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#brand-grad)" />
            <path d="M10 22V14L16 10L22 14V22L16 18L10 22Z" fill="white" opacity="0.9" />
            <path d="M16 10V18" stroke="white" strokeWidth="1.5" opacity="0.6" />
            <defs>
              <linearGradient id="brand-grad" x1="2" y1="2" x2="30" y2="30">
                <stop stopColor="#5B7C99" />
                <stop offset="1" stopColor="#3D5A80" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-name">AssetHub</span>
        </div>
        <div className="nav-links" id="nav-links">
          <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Home</Link>
          <Link href="/activities" className={`nav-link ${pathname === '/activities' ? 'active' : ''}`}>Activities</Link>
          <Link href="/maintenance" className={`nav-link ${pathname === '/maintenance' ? 'active' : ''}`}>Requests</Link>
          <Link href="/transfers" className={`nav-link ${pathname === '/transfers' ? 'active' : ''}`}>Changes</Link>
          <Link href="/bookings" className={`nav-link ${pathname === '/bookings' ? 'active' : ''}`}>Projects</Link>
          <Link href="/assets" className={`nav-link ${pathname?.startsWith('/assets') ? 'active' : ''}`}>Assets</Link>
          <Link href="/reports" className={`nav-link ${pathname === '/reports' ? 'active' : ''}`}>Reports</Link>
        </div>
      </div>
      <div className="nav-right">
        <button className="nav-icon-btn" id="search-btn" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button className="nav-icon-btn" id="notifications-btn" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notification-badge">3</span>
        </button>
        <button className="nav-icon-btn" id="settings-btn" aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
        <div className="user-avatar" id="user-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
