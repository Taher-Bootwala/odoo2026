'use client';

import { useState, useEffect, useRef } from 'react';
import { AssetIcons, ActivityIcons } from '@/components/dashboard/Icons';
// import { ASSET_DATA, ACTIVITY_DATA } from '@/lib/mockData'; // Removed mock data

import Modal from '@/components/ui/Modal';
import { addAsset } from './actions';

const CHART_COLORS = {
  inUse: '#3B82A0',
  inStore: '#5B9A5E',
  inRepair: '#C78B3F',
  others: '#9B7CB5',
};

export default function DashboardClient({ initialAssets, initialActivities, categories }: { initialAssets: any[], initialActivities: any[], categories: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);

  // Group the raw Supabase assets into the category-based structure expected by the UI
  // ... (rest of logic) ...
  const aggregatedAssetsMap = initialAssets.reduce((acc: any, asset: any) => {
    const key = asset.categories?.name || 'Unknown';
    if (!acc[key]) {
      acc[key] = {
        name: key,
        total: 0,
        inUse: 0,
        inStore: 0,
        inRepair: 0,
        others: 0,
        icon: getIconForCategory(key)
      };
    }
    acc[key].total += 1;
    if (asset.status === 'allocated') acc[key].inUse += 1;
    else if (asset.status === 'available') acc[key].inStore += 1;
    else if (asset.status === 'under_maintenance') acc[key].inRepair += 1;
    else acc[key].others += 1;
    return acc;
  }, {});
  
  const liveAssetData = Object.values(aggregatedAssetsMap) as any[];

  // Helper to map DB activity logs to UI format
  const liveActivityData = initialActivities.map((log: any) => {
    // Map log.action to one of the supported UI icons: added, moved, repaired, removed, updated
    let type = 'updated';
    if (log.action.includes('add') || log.action.includes('create')) type = 'added';
    else if (log.action.includes('move') || log.action.includes('transfer') || log.action.includes('allocate')) type = 'moved';
    else if (log.action.includes('repair') || log.action.includes('fix')) type = 'repaired';
    else if (log.action.includes('remove') || log.action.includes('delete') || log.action.includes('decommission') || log.action.includes('dispose')) type = 'removed';

    return {
      type,
      text: log.description,
      time: new Date(log.created_at).toISOString().replace('T', ' ').substring(0, 19)
    };
  });

  // Filter data
  const filteredAssets = liveAssetData.filter((asset: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    if (asset.name.toLowerCase().includes(q)) return true;
    if (q === 'in use' && asset.inUse > 0) return true;
    if (q === 'in store' && asset.inStore > 0) return true;
    if (q === 'in repair' && asset.inRepair > 0) return true;
    if (q === 'empty' && asset.total === 0) return true;
    return false;
  });

  // Helper function to guess icon based on name
  function getIconForCategory(name: string) {
    const n = name.toLowerCase();
    if (n.includes('server')) return 'server';
    if (n.includes('router')) return 'router';
    if (n.includes('switch')) return 'ciscoSwitch';
    if (n.includes('monitor')) return 'monitor';
    if (n.includes('printer')) return 'printer';
    if (n.includes('phone') || n.includes('mobile')) return 'mobile';
    if (n.includes('pad')) return 'ipad';
    if (n.includes('firewall')) return 'firewall';
    if (n.includes('webcam')) return 'webcam';
    if (n.includes('ups') || n.includes('power')) return 'ups';
    if (n.includes('access point')) return 'accessPoint';
    return 'computer';
  }

  // Calculate totals
  const totals = filteredAssets.reduce((acc, asset) => {
    acc.total += asset.total;
    acc.inUse += asset.inUse;
    acc.inStore += asset.inStore;
    acc.inRepair += asset.inRepair;
    acc.others += asset.others;
    return acc;
  }, { total: 0, inUse: 0, inStore: 0, inRepair: 0, others: 0 });

  // Draw chart effect
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawDonutChart = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayW = 240;
      const displayH = 180;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      ctx.scale(dpr, dpr);

      const data = [
        { label: 'In Use', value: totals.inUse, color: CHART_COLORS.inUse },
        { label: 'In Store', value: totals.inStore, color: CHART_COLORS.inStore },
        { label: 'In Repair', value: totals.inRepair, color: CHART_COLORS.inRepair },
        { label: 'Others', value: totals.others, color: CHART_COLORS.others },
      ];

      const total = data.reduce((s, d) => s + d.value, 0);
      if (total === 0) return;

      const cx = displayW / 2;
      const cy = displayH / 2;
      const outerR = 70;
      const innerR = 44;

      let startAngle = -Math.PI / 2;
      data.forEach(segment => {
        const sliceAngle = (segment.value / total) * Math.PI * 2;
        if (segment.value > 0) {
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, startAngle, startAngle + sliceAngle);
          ctx.arc(cx, cy, innerR, startAngle + sliceAngle, startAngle, true);
          ctx.closePath();
          ctx.fillStyle = segment.color;
          ctx.fill();
        }
        startAngle += sliceAngle;
      });

      ctx.fillStyle = '#2E4660';
      ctx.font = '700 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(total.toString(), cx, cy - 6);
      ctx.fillStyle = '#6B96B7';
      ctx.font = '400 10px Inter, sans-serif';
      ctx.fillText('Total', cx, cy + 10);
    };

    const drawBarChart = () => {
      const dpr = window.devicePixelRatio || 1;
      const displayW = 240;
      const displayH = 180;
      canvas.width = displayW * dpr;
      canvas.height = displayH * dpr;
      canvas.style.width = displayW + 'px';
      canvas.style.height = displayH + 'px';
      ctx.scale(dpr, dpr);

      const data = [
        { label: 'In Use', value: totals.inUse, color: CHART_COLORS.inUse },
        { label: 'In Store', value: totals.inStore, color: CHART_COLORS.inStore },
        { label: 'In Repair', value: totals.inRepair, color: CHART_COLORS.inRepair },
        { label: 'Others', value: totals.others, color: CHART_COLORS.others },
      ];

      const maxVal = Math.max(...data.map(d => d.value), 1);
      const barW = 36;
      const gap = 20;
      const totalBars = data.length;
      const chartW = totalBars * barW + (totalBars - 1) * gap;
      const startX = (displayW - chartW) / 2;
      const chartBottom = displayH - 28;
      const chartTop = 16;
      const chartH = chartBottom - chartTop;

      data.forEach((d, i) => {
        const x = startX + i * (barW + gap);
        const barH = (d.value / maxVal) * chartH;
        const y = chartBottom - barH;

        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x, chartBottom);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.arcTo(x + barW, y, x + barW, y + radius, radius);
        ctx.lineTo(x + barW, chartBottom);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        ctx.fillStyle = '#2E4660';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(d.value.toString(), x + barW / 2, y - 6);

        ctx.fillStyle = '#6B96B7';
        ctx.font = '400 9px Inter, sans-serif';
        ctx.fillText(d.label, x + barW / 2, chartBottom + 14);
      });
    };

    if (chartType === 'donut') drawDonutChart();
    else drawBarChart();

  }, [chartType, totals]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleAddSubmit = async (formData: FormData) => {
    const res = await addAsset(formData);
    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      alert(res.error);
    }
  };

  const topCategories = [...liveAssetData]
    .filter(a => a.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxTopCategoryVal = topCategories.length > 0 ? topCategories[0].total : 1;

  const formInputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)', marginBottom: '16px'
  };

  return (
    <>
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Asset">
        <form action={handleAddSubmit} style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: '6px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Asset Name</label>
          <input name="name" required placeholder="e.g. Dell XPS 15" style={formInputStyle} />
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Category</label>
              <div className="select-wrapper" style={{ marginBottom: '16px' }}>
                <select name="category_id" required defaultValue="" style={{...formInputStyle, marginBottom: 0}}>
                  <option value="" disabled>Select category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Serial Number</label>
              <input name="serial_number" placeholder="e.g. SN-98239A" style={formInputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Manufacturer</label>
              <input name="manufacturer" placeholder="e.g. Dell" style={formInputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Model</label>
              <input name="model" placeholder="e.g. XPS 15 9520" style={formInputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Purchase Date</label>
              <input type="date" name="purchase_date" style={formInputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Purchase Cost ($)</label>
              <input type="number" step="0.01" name="purchase_cost" placeholder="0.00" style={formInputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Warranty Expiry</label>
              <input type="date" name="warranty_expiry" style={formInputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Location</label>
              <input name="location" required placeholder="e.g. HQ - Floor 3" style={formInputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Status</label>
              <div className="select-wrapper" style={{ marginBottom: '16px' }}>
                <select name="status" required defaultValue="available" style={{...formInputStyle, marginBottom: 0}}>
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="reserved">Reserved</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="lost">Lost</option>
                  <option value="retired">Retired</option>
                  <option value="disposed">Disposed</option>
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Condition</label>
              <div className="select-wrapper" style={{ marginBottom: '16px' }}>
                <select name="condition" required defaultValue="good" style={{...formInputStyle, marginBottom: 0}}>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="damaged">Damaged</option>
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input 
              type="checkbox" 
              id="is_shared_resource" 
              name="is_shared_resource" 
              value="true" 
              checked={isShared} 
              onChange={(e) => setIsShared(e.target.checked)} 
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="is_shared_resource" style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 500, cursor: 'pointer' }}>
              Is Shared Bookable Resource?
            </label>
          </div>

          {isShared && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Resource Type</label>
              <div className="select-wrapper">
                <select name="resource_type" required defaultValue="meeting_room" style={formInputStyle}>
                  <option value="meeting_room">Meeting Room</option>
                  <option value="conference_hall">Conference Hall</option>
                  <option value="projector">Projector</option>
                  <option value="company_vehicle">Company Vehicle</option>
                </select>
                <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </div>
          )}

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Description</label>
          <textarea name="description" placeholder="Optional notes on the asset..." rows={3} style={{...formInputStyle, resize: 'vertical'}} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.borderColor = 'var(--color-border-light)'; }} onMouseOut={(e) => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--color-primary-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--color-primary)'}>Add Asset</button>
          </div>
        </form>
      </Modal>

      <div className="breadcrumb-row">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="#">All Assets</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <a href="#">Assets</a>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="breadcrumb-current">IT</span>
        </nav>
      </div>

      <div className="page-title-row">
        <h1 className="page-title">IT Assets</h1>
        <div className="header-actions">
          <div className="filter-group">
            <label htmlFor="site-filter">Filter by Site</label>
            <div className="select-wrapper">
              <select id="site-filter">
                <option>All Sites</option>
                <option>Headquarters</option>
                <option>Branch Office</option>
                <option>Data Center</option>
                <option>Remote</option>
              </select>
              <svg className="select-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="toolbar-row" id="toolbar-row">
        <div className="global-search" id="global-search">
          <svg className="global-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search all assets by name, type, or status..." 
            className="global-search-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="search-shortcut">Ctrl+K</kbd>
        </div>
        <div className="quick-actions" id="quick-actions">
          <button className="action-btn action-btn-primary" id="action-add" onClick={() => setIsAddModalOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Asset
          </button>
          <button className="action-btn" id="action-export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>
          <button className="action-btn" id="action-import">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
          <button className="action-btn" id="action-refresh" onClick={handleRefresh}>
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ transition: isRefreshing ? 'transform 0.6s ease' : 'none', transform: isRefreshing ? 'rotate(360deg)' : '' }}
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        </div>
      </div>

      <div className="stats-bar" id="stats-bar">
        <div className="stat-item">
          <div className="stat-icon stat-icon-total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div className="stat-text">
            <span className="stat-value">{totals.total}</span>
            <span className="stat-label">Total Assets</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-use">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-text">
            <span className="stat-value">{totals.inUse}</span>
            <span className="stat-label">In Use</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-store">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="stat-text">
            <span className="stat-value">{totals.inStore}</span>
            <span className="stat-label">In Store</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-repair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <div className="stat-text">
            <span className="stat-value">{totals.inRepair}</span>
            <span className="stat-label">In Repair</span>
          </div>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-item">
          <div className="stat-icon stat-icon-other">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="stat-text">
            <span className="stat-value">{totals.others}</span>
            <span className="stat-label">Others</span>
          </div>
        </div>
      </div>

      <div className="insights-section" id="insights-section">
        <div className="insight-card analytics-card">
          <div className="insight-card-header">
            <h3 className="insight-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              Status Distribution
            </h3>
            <div className="insight-tabs">
              <button className={`insight-tab ${chartType === 'donut' ? 'active' : ''}`} onClick={() => setChartType('donut')}>Donut</button>
              <button className={`insight-tab ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}>Bar</button>
            </div>
          </div>
          <div className="chart-container">
            <canvas ref={chartCanvasRef} id="analytics-chart" width="280" height="200"></canvas>
          </div>
          <div className="chart-legend">
            {[
              { label: 'In Use', value: totals.inUse, color: CHART_COLORS.inUse },
              { label: 'In Store', value: totals.inStore, color: CHART_COLORS.inStore },
              { label: 'In Repair', value: totals.inRepair, color: CHART_COLORS.inRepair },
              { label: 'Others', value: totals.others, color: CHART_COLORS.others },
            ].map(d => (
              <div key={d.label} className="legend-item">
                <span className="legend-dot" style={{ background: d.color }}></span>
                {d.label} <span className="legend-value">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="insight-card categories-card">
          <div className="insight-card-header">
            <h3 className="insight-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              Top Categories
            </h3>
          </div>
          <div className="bar-chart-container">
            {topCategories.map((asset, i) => {
              const pct = (asset.total / maxTopCategoryVal) * 100;
              return (
                <div key={asset.name} className="bar-chart-row" style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="bar-chart-label" title={asset.name}>{asset.name}</span>
                  <div className="bar-chart-track">
                    <div className="bar-chart-fill" style={{ width: `${pct}%` }}>
                      {pct > 25 ? <span>{asset.total}</span> : null}
                    </div>
                  </div>
                  {pct <= 25 ? <span className="bar-chart-value">{asset.total}</span> : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="insight-card activity-card">
          <div className="insight-card-header">
            <h3 className="insight-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Recent Activity
            </h3>
            <a href="#" className="insight-link">View All</a>
          </div>
          <div className="activity-feed">
            {liveActivityData.map((item: any, i: number) => (
              <div key={i} className="activity-item" style={{ animationDelay: `${i * 60}ms` }}>
                <div className={`activity-icon ${item.type}`}>
                  {ActivityIcons[item.type as keyof typeof ActivityIcons]}
                </div>
                <div className="activity-body">
                  <div className="activity-text" dangerouslySetInnerHTML={{ __html: item.text }}></div>
                  <div className="activity-time" suppressHydrationWarning>{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="asset-grid-header">
        <h2 className="section-title">All Categories</h2>
        <span className="section-count">{filteredAssets.length} categories</span>
      </div>
      
      <div className="asset-grid">
        {filteredAssets.map((asset, i) => (
          <div key={asset.name} className="asset-card" style={{ animationDelay: `${i * 40}ms` }}>
            <div className="card-header">
              <div className="card-title">
                {asset.name} <span className="count">( {asset.total} )</span>
              </div>
              <button className="card-add-btn" aria-label={`Add ${asset.name}`} title={`Add new ${asset.name}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <div className="card-body">
              <div className="card-icon">
                {AssetIcons[asset.icon] || AssetIcons.computer}
              </div>
              <div className="card-stats">
                <div className="card-stat-row">
                  <span className="card-stat-label">In Use</span>
                  <span className={`card-stat-value in-use ${asset.inUse === 0 ? 'zero' : ''}`}>{asset.inUse}</span>
                </div>
                <div className="card-stat-row">
                  <span className="card-stat-label">In Store</span>
                  <span className={`card-stat-value in-store ${asset.inStore === 0 ? 'zero' : ''}`}>{asset.inStore}</span>
                </div>
                <div className="card-stat-row">
                  <span className="card-stat-label">In Repair</span>
                  <span className={`card-stat-value in-repair ${asset.inRepair === 0 ? 'zero' : ''}`}>{asset.inRepair}</span>
                </div>
                <div className="card-stat-row">
                  <span className="card-stat-label">Others</span>
                  <span className={`card-stat-value others ${asset.others === 0 ? 'zero' : ''}`}>{asset.others}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="asset-grid-header" style={{ marginTop: '40px' }}>
        <h2 className="section-title">Individual Assets Registry</h2>
        <span className="section-count">{initialAssets.length} assets total</span>
      </div>

      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--color-border-light)',
        padding: '20px',
        marginTop: '20px',
        boxShadow: 'var(--shadow-card)',
        overflowX: 'auto'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text)', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-light)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Asset ID</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Category</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Serial Number</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Location</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Shared?</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Condition</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialAssets
              .filter(asset => {
                if (!searchQuery) return true;
                const q = searchQuery.toLowerCase().trim();
                return asset.name.toLowerCase().includes(q) || 
                       (asset.asset_id && asset.asset_id.toLowerCase().includes(q)) ||
                       (asset.serial_number && asset.serial_number.toLowerCase().includes(q)) ||
                       (asset.location && asset.location.toLowerCase().includes(q)) ||
                       asset.status.toLowerCase().includes(q);
              })
              .map((asset) => (
                <tr key={asset.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: '600', color: 'var(--color-primary)' }}>
                    {asset.asset_id}
                  </td>
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    {asset.name}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {asset.categories?.name || 'Uncategorized'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                    {asset.serial_number || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {asset.location || 'N/A'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {asset.is_shared_resource ? (
                      <span style={{ color: 'var(--status-in-store)', fontWeight: 600 }}>Yes ({asset.resource_type?.replace('_', ' ')})</span>
                    ) : 'No'}
                  </td>
                  <td style={{ padding: '16px', textTransform: 'capitalize' }}>
                    {asset.condition}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: asset.status === 'available' ? '#E7F3E8' : asset.status === 'allocated' ? '#E3F1F4' : '#FDF4E9',
                      color: asset.status === 'available' ? 'var(--status-in-store)' : asset.status === 'allocated' ? '#3B82A0' : '#C78B3F',
                      border: '1px solid var(--color-border-light)',
                      fontSize: '13px',
                      textTransform: 'capitalize',
                      fontWeight: 500
                    }}>
                      {asset.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            {initialAssets.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No assets found. Add your first asset above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
