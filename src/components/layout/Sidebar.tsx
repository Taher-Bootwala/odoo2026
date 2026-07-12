'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'tree-all-assets': true,
    'tree-assets': true,
  });

  const toggleNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} id="sidebar">
      <div className="sidebar-search">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" placeholder="Search assets..." id="sidebar-search-input" className="search-input" />
      </div>

      <div className="sidebar-section">
        <div className="sidebar-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Favorites</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-tree">
          <Link href="/assets" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={`tree-item ${pathname?.startsWith('/assets') ? 'active' : ''}`} id="tree-all-assets">
              <button className={`tree-toggle ${expandedNodes['tree-all-assets'] ? 'expanded' : ''}`} aria-label="Toggle" onClick={(e) => toggleNode('tree-all-assets', e)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>All Assets</span>
              <span className="tree-expand-link">Expand</span>
            </div>
          </Link>

          {expandedNodes['tree-all-assets'] && (
            <div className="tree-children">
              
              <Link href="/assets" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/assets' ? 'active-item' : ''}`} id="tree-assets">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  <span>Dashboard</span>
                </div>
              </Link>

              <Link href="/activities" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/activities' ? 'active-item' : ''}`} id="tree-history">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Activity Logs</span>
                </div>
              </Link>

              <Link href="/maintenance" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/maintenance' ? 'active-item' : ''}`} id="tree-maintenance">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                  <span>Maintenance</span>
                </div>
              </Link>

              <Link href="/transfers" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/transfers' ? 'active-item' : ''}`} id="tree-transfers">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  <span>Transfers</span>
                </div>
              </Link>

              <Link href="/allocations" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/allocations' ? 'active-item' : ''}`} id="tree-allocations">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Allocations</span>
                </div>
              </Link>

              <Link href="/bookings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={`tree-item ${pathname === '/bookings' ? 'active-item' : ''}`} id="tree-bookings">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Bookings</span>
                </div>
              </Link>

            </div>
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-header">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Groups</span>
          <button className="add-group-btn" id="add-group-btn" aria-label="Add group">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
