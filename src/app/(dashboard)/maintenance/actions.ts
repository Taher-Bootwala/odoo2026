'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  return user
}

export async function createMaintenanceRequest(formData: {
  asset_id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  issue_description: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // Validate asset status
  const { data: asset } = await supabase
    .from('assets')
    .select('name, status')
    .eq('id', formData.asset_id)
    .single()

  if (!asset) throw new Error('Asset not found')
  if (asset.status === 'under_maintenance') {
    throw new Error('This asset is already undergoing active maintenance')
  }

  // Insert request
  const { error } = await supabase
    .from('maintenance_requests')
    .insert({
      asset_id: formData.asset_id,
      reported_by: user.id,
      priority: formData.priority,
      issue_description: formData.issue_description,
      status: 'pending'
    })

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'MAINTENANCE_REQUESTED',
    module: 'MAINTENANCE',
    description: `Raised maintenance request for "${asset.name}".`,
  })

  revalidatePath('/maintenance')
}

export async function approveAndAssignRequest(requestId: string, formData: {
  technician: string
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // 1. Fetch request details
  const { data: request } = await supabase
    .from('maintenance_requests')
    .select('*, assets(name, status)')
    .eq('id', requestId)
    .single()

  if (!request) throw new Error('Request not found')

  // Guard rule 3: asset must be available or allocated to approve maintenance
  const allowedStatuses = ['available', 'allocated']
  if (!allowedStatuses.includes(request.assets?.status || '')) {
    throw new Error(`Cannot approve maintenance: Asset is currently in "${request.assets?.status}" state.`)
  }

  // 2. Approve and transition request to assigned/in_progress
  const { error: requestErr } = await supabase
    .from('maintenance_requests')
    .update({
      approved_by: user.id,
      technician: formData.technician,
      status: 'in_progress'
    })
    .eq('id', requestId)

  if (requestErr) throw new Error(requestErr.message)

  // 3. Side-effect: Flip asset to under_maintenance status
  const { error: assetErr } = await supabase
    .from('assets')
    .update({
      status: 'under_maintenance'
    })
    .eq('id', request.asset_id)

  if (assetErr) throw new Error(assetErr.message)

  // Notify reporter
  await supabase.from('notifications').insert({
    user_id: request.reported_by,
    title: 'Maintenance Request Approved',
    message: `Your maintenance request for "${request.assets?.name}" has been approved. Technician "${formData.technician}" has been assigned.`,
    type: 'maintenance_approved'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'MAINTENANCE_APPROVED',
    module: 'MAINTENANCE',
    description: `Approved maintenance request for "${request.assets?.name}".`,
  })

  revalidatePath('/maintenance')
  revalidatePath('/assets')
  revalidatePath('/dashboard')
}

export async function resolveRequest(requestId: string, formData: {
  resolution_notes: string
  cost?: number
}) {
  const supabase = await createClient()
  const user = await getAuthenticatedUser(supabase)

  // 1. Fetch request details
  const { data: request } = await supabase
    .from('maintenance_requests')
    .select('*, assets(name)')
    .eq('id', requestId)
    .single()

  if (!request) throw new Error('Request not found')

  // 2. Mark request resolved
  const { error: requestErr } = await supabase
    .from('maintenance_requests')
    .update({
      resolution_notes: formData.resolution_notes,
      cost: formData.cost || 0,
      status: 'resolved'
    })
    .eq('id', requestId)

  if (requestErr) throw new Error(requestErr.message)

  // 3. Side-effect: Flip asset back to available status
  const { error: assetErr } = await supabase
    .from('assets')
    .update({
      status: 'available',
      condition: 'good' // assume restored back to good condition
    })
    .eq('id', request.asset_id)

  if (assetErr) throw new Error(assetErr.message)

  // Notify reporter
  await supabase.from('notifications').insert({
    user_id: request.reported_by,
    title: 'Maintenance Resolved',
    message: `Maintenance resolved for "${request.assets?.name}". Notes: ${formData.resolution_notes}`,
    type: 'maintenance_resolved'
  })

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'MAINTENANCE_RESOLVED',
    module: 'MAINTENANCE',
    description: `Resolved maintenance for "${request.assets?.name}".`,
  })

  revalidatePath('/maintenance')
  revalidatePath('/assets')
  revalidatePath('/dashboard')
}
