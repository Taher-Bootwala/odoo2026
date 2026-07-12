import { createClient } from '@/lib/supabase/server'

export default async function BookingsPage() {
  const supabase = await createClient()

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, assets(name)')
    .order('start_time', { ascending: false })

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">Resource Bookings</h1>
        <div className="header-actions">
          <button className="action-btn action-btn-primary">
            New Booking
          </button>
        </div>
      </div>
      
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        padding: '20px',
        marginTop: '20px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Resource</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Booked By</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Start Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>End Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings?.map((booking) => (
              <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', fontWeight: '500' }}>
                  {booking.assets?.name || 'Unknown Resource'}
                </td>
                <td style={{ padding: '16px' }}>{booking.user_id}</td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  {new Date(booking.start_time).toLocaleString()}
                </td>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  {new Date(booking.end_time).toLocaleString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-darker)',
                    color: booking.status === 'confirmed' ? '#10b981' : 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
