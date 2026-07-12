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
        background: 'var(--bg-card)',
        borderRadius: '12px',
        border: '1px solid var(--border-light)',
        padding: '20px',
        marginTop: '20px'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Time</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Action</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Entity</th>
              <th style={{ padding: '12px 16px', fontWeight: '500' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {logs?.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'var(--bg-darker)',
                    border: '1px solid var(--border-light)',
                    fontSize: '13px',
                    textTransform: 'capitalize'
                  }}>
                    {log.action}
                  </span>
                </td>
                <td style={{ padding: '16px', fontWeight: '500', color: 'var(--accent-blue)' }}>
                  {log.entity_type} {log.entity_id ? `#${log.entity_id.slice(0,6)}` : ''}
                </td>
                <td style={{ padding: '16px' }}>{log.description}</td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
