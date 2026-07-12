'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { allocateAsset, returnAsset } from './actions'

export default function AllocationsClient({ initialAllocations, assets, employees }: { initialAllocations: any[], assets: any[], employees: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [returnAssetId, setReturnAssetId] = useState<string | null>(null)

  const handleAllocateSubmit = async (formData: FormData) => {
    const res = await allocateAsset(formData)
    if (res.success) {
      setIsModalOpen(false)
    } else {
      alert(res.error)
    }
  }

  const handleReturnSubmit = async (formData: FormData) => {
    const res = await returnAsset(formData)
    if (res.success) {
      setReturnAssetId(null)
    } else {
      alert(res.error)
    }
  }

  const formInputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)',
    color: 'var(--color-text)', marginBottom: '16px'
  }

  return (
    <>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Allocate Asset">
        <form action={handleAllocateSubmit}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Asset</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="asset_id" required defaultValue="" style={{...formInputStyle, marginBottom: 0}}>
              <option value="" disabled>Select an available asset...</option>
              {assets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Assign To Employee</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="employee_id" required defaultValue="" style={{...formInputStyle, marginBottom: 0}}>
              <option value="" disabled>Select employee...</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Expected Return Date</label>
          <input type="date" name="expected_return_date" style={formInputStyle} />

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Purpose</label>
          <input name="purpose" required placeholder="e.g. Remote work hardware" style={formInputStyle} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Allocate</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!returnAssetId} onClose={() => setReturnAssetId(null)} title="Return Asset">
        <form action={handleReturnSubmit}>
          <input type="hidden" name="allocation_id" value={returnAssetId || ''} />
          
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Return Condition</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="return_condition" required defaultValue="good" style={{...formInputStyle, marginBottom: 0}}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="damaged">Damaged</option>
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Return Remarks</label>
          <input name="return_remarks" placeholder="Optional notes on return..." style={formInputStyle} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setReturnAssetId(null)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Confirm Return</button>
          </div>
        </form>
      </Modal>

      <div className="content-header" id="content-header">
        <div className="page-title-row">
          <h1 className="page-title">Asset Allocations</h1>
          <div className="header-actions">
            <button className="action-btn action-btn-primary" onClick={() => setIsModalOpen(true)}>
              Allocate Asset
            </button>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '24px 28px' }}>
        <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--color-border-light)',
        padding: '20px',
        marginTop: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--color-text)', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border-light)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Asset</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Employee</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Allocated Date</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialAllocations?.map((alloc) => (
              <tr key={alloc.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {alloc.assets?.name || 'Unknown Asset'}
                </td>
                <td style={{ padding: '16px' }}>{alloc.users?.full_name || 'Unknown User'}</td>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {new Date(alloc.allocated_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: alloc.status === 'active' ? '#E3F1F4' : 'var(--blue-50)',
                    color: alloc.status === 'active' ? '#3B82A0' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    fontWeight: 500
                  }}>
                    {alloc.status}
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {alloc.status === 'active' && (
                    <button 
                      onClick={() => setReturnAssetId(alloc.id)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                        borderRadius: 'var(--border-radius-sm)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.color = '#fff' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)' }}
                    >
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {(!initialAllocations || initialAllocations.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No allocations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </>
  )
}
