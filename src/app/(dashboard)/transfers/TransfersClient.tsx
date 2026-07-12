'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { initiateTransfer } from './actions'

export default function TransfersClient({ initialTransfers, assets, departments }: { initialTransfers: any[], assets: any[], departments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const res = await initiateTransfer(formData)
    if (res.success) {
      setIsModalOpen(false)
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Asset Transfer">
        <form action={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Asset to Transfer</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="asset_id" required defaultValue="" style={{...formInputStyle, marginBottom: 0}}>
              <option value="" disabled>Select an asset...</option>
              {assets.map((asset: any) => (
                <option key={asset.id} value={asset.id}>{asset.name}</option>
              ))}
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Target Department</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="to_department_id" required defaultValue="" style={{...formInputStyle, marginBottom: 0}}>
              <option value="" disabled>Select destination...</option>
              {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Reason for Transfer</label>
          <textarea name="reason" required rows={3} placeholder="Provide justification..." style={{...formInputStyle, resize: 'vertical'}} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Initiate Transfer</button>
          </div>
        </form>
      </Modal>

      <div className="page-title-row">
        <h1 className="page-title">Asset Transfers</h1>
        <div className="header-actions">
          <button className="action-btn action-btn-primary" onClick={() => setIsModalOpen(true)}>
            Initiate Transfer
          </button>
        </div>
      </div>
      
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
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Date</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Asset</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>To Department</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Reason</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialTransfers?.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {new Date(t.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {t.assets?.name || 'Unknown Asset'}
                </td>
                <td style={{ padding: '16px' }}>
                  {departments.find((d: any) => d.id === t.to_department_id)?.name || 'N/A'}
                </td>
                <td style={{ padding: '16px' }}>{t.reason}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: t.status === 'completed' ? '#E7F3E8' : 'var(--blue-50)',
                    color: t.status === 'completed' ? 'var(--status-in-store)' : 'var(--color-primary)',
                    border: '1px solid var(--color-border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    fontWeight: 500
                  }}>
                    {t.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
            {(!initialTransfers || initialTransfers.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No transfers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
