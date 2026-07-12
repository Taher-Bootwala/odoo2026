'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createBooking } from './actions'

export default function BookingsClient({ initialBookings, resources }: { initialBookings: any[], resources: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    const res = await createBooking(formData)
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book Resource">
        <form action={handleSubmit}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Resource</label>
          <div className="select-wrapper" style={{ marginBottom: '16px' }}>
            <select name="resource_id" required style={{...formInputStyle, marginBottom: 0}}>
              <option value="" disabled selected>Select a resource...</option>
              {resources.map((res: any) => (
                <option key={res.id} value={res.id}>{res.name}</option>
              ))}
            </select>
            <svg className="select-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Start Time</label>
              <input type="datetime-local" name="start_time" required style={formInputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>End Time</label>
              <input type="datetime-local" name="end_time" required style={formInputStyle} />
            </div>
          </div>

          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Purpose</label>
          <input name="purpose" required placeholder="e.g. Client Meeting" style={formInputStyle} />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Cancel</button>
            <button type="submit" style={{ padding: '10px 16px', background: 'var(--color-primary)', border: 'none', color: '#fff', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', transition: 'all 0.2s ease' }}>Book</button>
          </div>
        </form>
      </Modal>

      <div className="page-title-row">
        <h1 className="page-title">Resource Bookings</h1>
        <div className="header-actions">
          <button className="action-btn action-btn-primary" onClick={() => setIsModalOpen(true)}>
            New Booking
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
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Resource</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Booked By</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Start Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>End Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {initialBookings?.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {booking.assets?.name || 'Unknown Resource'}
                </td>
                <td style={{ padding: '16px' }}>{booking.users?.full_name || booking.booked_by}</td>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {new Date(booking.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {new Date(booking.end_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: booking.status === 'confirmed' ? '#E7F3E8' : 'var(--blue-50)',
                    color: booking.status === 'confirmed' ? 'var(--status-in-store)' : 'var(--color-primary)',
                    border: '1px solid var(--color-border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    fontWeight: 500
                  }}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!initialBookings || initialBookings.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
