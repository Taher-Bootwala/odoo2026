'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function allocateAsset(formData: {
  asset_id: string
  employee_id: string
  expected_return_date?: string
  purpose?: string
  remarks?: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // 1. Fetch asset details & check status (Guard rule 1: must be available)
  const { data: asset, error: assetErr } = await supabase
    .from('assets')
    .select('name, status, current_holder_id, users!assets_current_holder_id_fkey(full_name)')
    .eq('id', formData.asset_id)
    .single()

  if (assetErr || !asset) {
    throw new Error('Asset not found')
  }

  // Conflict state check
  if (asset.status !== 'available') {
    const holderName = (asset.users as any)?.[0]?.full_name || 'another employee'
    // Throw error payload containing holder info so UI can render Transfer Request CTA
    throw new Error(`CONFLICT: Currently held by ${holderName}`)
  }

  // 2. Perform allocation in a transaction/sequentially
  // Start allocation transaction
  const { error: allocErr } = await supabase
    .from('asset_allocations')
    .insert({
      asset_id: formData.asset_id,
      employee_id: formData.employee_id,
      allocated_by: user.id,
      expected_return_date: formData.expected_return_date || null,
      purpose: formData.purpose || null,
      remarks: formData.remarks || null,
      status: 'active'
    })

  if (allocErr) throw new Error(allocErr.message)

  // Update asset status
  const { error: assetUpdateErr } = await supabase
    .from('assets')
    .update({
      status: 'allocated',
      current_holder_id: formData.employee_id
    })
    .eq('id', formData.asset_id)

  if (assetUpdateErr) throw new Error(assetUpdateErr.message)

  // Create notification for employee
  await supabase.from('notifications').insert({
    user_id: formData.employee_id,
    title: 'Asset Allocated',
    message: `You have been checked out asset: ${asset.name}. Expected return date: ${formData.expected_return_date || 'Indefinite'}.`,
    type: 'asset_allocation'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'ASSET_ALLOCATED',
    module: 'ALLOCATIONS',
    description: `Asset "${asset.name}" allocated to employee.`,
  })

  revalidatePath('/allocations')
  revalidatePath('/assets')
  revalidatePath('/dashboard')
}

export async function returnAsset(allocationId: string, formData: {
  return_condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  return_remarks?: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // Fetch allocation details
  const { data: allocation } = await supabase
    .from('asset_allocations')
    .select('*, assets(name)')
    .eq('id', allocationId)
    .single()

  if (!allocation) throw new Error('Allocation record not found')

  const todayStr = new Date().toISOString()

  // 1. Close allocation
  const { error: allocUpdateErr } = await supabase
    .from('asset_allocations')
    .update({
      actual_return_date: todayStr,
      condition_at_check_in: formData.return_condition as any, // mapping custom fields if any
      return_remarks: formData.return_remarks || null,
      status: 'returned'
    })
    .eq('id', allocationId)

  if (allocUpdateErr) throw new Error(allocUpdateErr.message)

  // 2. Revert asset status back to available
  const { error: assetUpdateErr } = await supabase
    .from('assets')
    .update({
      status: 'available',
      condition: formData.return_condition,
      current_holder_id: null
    })
    .eq('id', allocation.asset_id)

  if (assetUpdateErr) throw new Error(assetUpdateErr.message)

  // Notify user
  await supabase.from('notifications').insert({
    user_id: allocation.employee_id,
    title: 'Asset Returned',
    message: `Return processed for: ${allocation.assets?.name}. Condition recorded: ${formData.return_condition}.`,
    type: 'asset_return'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'ASSET_RETURNED',
    module: 'ALLOCATIONS',
    description: `Asset "${allocation.assets?.name}" returned. Condition: ${formData.return_condition}.`,
  })

  revalidatePath('/allocations')
  revalidatePath('/assets')
  revalidatePath('/dashboard')
}
