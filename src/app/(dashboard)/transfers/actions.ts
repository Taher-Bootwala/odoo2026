'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function createTransferRequest(formData: {
  asset_id: string
  to_employee_id: string
  reason?: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // Fetch asset details to find who currently holds it
  const { data: asset } = await supabase
    .from('assets')
    .select('current_holder_id, name')
    .eq('id', formData.asset_id)
    .single()

  if (!asset) throw new Error('Asset not found')
  if (!asset.current_holder_id) {
    throw new Error('This asset is not currently allocated to anyone, allocate it directly instead.')
  }

  // Create transfer request
  const { error } = await supabase
    .from('asset_transfers')
    .insert({
      asset_id: formData.asset_id,
      from_employee_id: asset.current_holder_id,
      to_employee_id: formData.to_employee_id,
      requested_by: user.id,
      reason: formData.reason || null,
      status: 'requested'
    })

  if (error) throw new Error(error.message)

  // Notify recipient
  await supabase.from('notifications').insert({
    user_id: formData.to_employee_id,
    title: 'Asset Transfer Requested',
    message: `A transfer request for "${asset.name}" has been raised. Please check your Transfers board.`,
    type: 'transfer_request'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'TRANSFER_REQUESTED',
    module: 'TRANSFERS',
    description: `Transfer requested for "${asset.name}".`,
  })

  revalidatePath('/transfers')
}

export async function approveTransfer(transferId: string) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // 1. Fetch transfer details
  const { data: transfer } = await supabase
    .from('asset_transfers')
    .select('*, assets(name)')
    .eq('id', transferId)
    .single()

  if (!transfer) throw new Error('Transfer record not found')

  // 2. Validate current holder of the asset matches transfer initiator
  const { data: asset } = await supabase
    .from('assets')
    .select('current_holder_id')
    .eq('id', transfer.asset_id)
    .single()

  if (!asset || asset.current_holder_id !== transfer.from_employee_id) {
    throw new Error('Asset holder state changed, cannot process transfer.')
  }

  const todayStr = new Date().toISOString()

  // 3. Close the old holder's active allocation record
  await supabase
    .from('asset_allocations')
    .update({
      actual_return_date: todayStr,
      status: 'returned',
      return_remarks: 'Transferred to another employee'
    })
    .eq('asset_id', transfer.asset_id)
    .eq('employee_id', transfer.from_employee_id)
    .eq('status', 'active')

  // 4. Create new holder allocation record
  await supabase
    .from('asset_allocations')
    .insert({
      asset_id: transfer.asset_id,
      employee_id: transfer.to_employee_id,
      allocated_by: user.id,
      status: 'active',
      remarks: 'Allocated via Transfer approval'
    })

  // 5. Update holder info in Assets table
  await supabase
    .from('assets')
    .update({
      current_holder_id: transfer.to_employee_id
    })
    .eq('id', transfer.asset_id)

  // 6. Complete transfer status
  const { error } = await supabase
    .from('asset_transfers')
    .update({
      status: 'completed',
      asset_manager_approved_by: user.id
    })
    .eq('id', transferId)

  if (error) throw new Error(error.message)

  // Notify new holder
  await supabase.from('notifications').insert({
    user_id: transfer.to_employee_id,
    title: 'Transfer Approved',
    message: `Asset "${transfer.assets?.name}" transfer approved. It is now allocated to you.`,
    type: 'transfer_approved'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'TRANSFER_APPROVED',
    module: 'TRANSFERS',
    description: `Transfer approved for "${transfer.assets?.name}".`,
  })

  revalidatePath('/transfers')
  revalidatePath('/allocations')
}

export async function rejectTransfer(transferId: string, remarks?: string) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  const { data: transfer } = await supabase
    .from('asset_transfers')
    .select('*, assets(name)')
    .eq('id', transferId)
    .single()

  if (!transfer) throw new Error('Transfer record not found')

  const { error } = await supabase
    .from('asset_transfers')
    .update({
      status: 'rejected',
      remarks: remarks || 'Rejected by Admin/Manager'
    })
    .eq('id', transferId)

  if (error) throw new Error(error.message)

  // Notify requester
  await supabase.from('notifications').insert({
    user_id: transfer.from_employee_id,
    title: 'Transfer Rejected',
    message: `Transfer request for "${transfer.assets?.name}" was rejected.`,
    type: 'transfer_rejected'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'TRANSFER_REJECTED',
    module: 'TRANSFERS',
    description: `Transfer rejected for "${transfer.assets?.name}".`,
  })

  revalidatePath('/transfers')
}
