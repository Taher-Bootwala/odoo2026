import { createClient } from '@/lib/supabase/server'
import { ActivityIcons } from '@/components/dashboard/Icons'

export default async function ActivitiesPage() {
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <div className="page-title-row">
        <h1 className="page-title">Activity Logs</h1>
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
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Action</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Module</th>
              <th style={{ padding: '12px 16px', fontWeight: '600' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                <td style={{ padding: '16px', color: 'var(--color-text-muted)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--blue-50)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize',
                    fontWeight: 500
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '16px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
                  <span style={{ textTransform: 'capitalize' }}>{log.module}</span>
                </td>
                <td style={{ padding: '16px' }}>{log.description}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No activity logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
