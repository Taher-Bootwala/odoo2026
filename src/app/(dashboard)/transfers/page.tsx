import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TransferBoard from '@/components/transfers/TransferBoard'

export const revalidate = 0 // Always fetch fresh transfer records

export default async function TransfersPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Fetch User Profile
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const userRole = profile?.role || 'employee'

  // 3. Fetch transfer requests with relations
  const { data: transfers } = await supabase
    .from('asset_transfers')
    .select('*, assets(name, asset_id), from_employee:users!asset_transfers_from_employee_id_fkey(full_name, email), to_employee:users!asset_transfers_to_employee_id_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  return (
    <TransferBoard 
      transfers={transfers || []} 
      userRole={userRole}
      userId={user.id}
    />
  )
}
