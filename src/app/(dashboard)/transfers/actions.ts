'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function initiateTransfer(formData: FormData) {
  const supabase = await createClient()

  const asset_id = formData.get('asset_id') as string
  const to_department_id = formData.get('to_department_id') as string
  const reason = formData.get('reason') as string

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get asset's current department and holder
  const { data: assetData } = await supabase
    .from('assets')
    .select('department_id, current_holder_id')
    .eq('id', asset_id)
    .single()

  const from_department_id = assetData?.department_id || null
  const from_employee_id = assetData?.current_holder_id || null

  // Insert the transfer request
  const { error: requestError } = await supabase
    .from('asset_transfers')
    .insert([{
      asset_id,
      from_department_id,
      from_employee_id,
      to_department_id,
      reason,
      requested_by: user.id,
      status: 'requested'
    }])

  if (requestError) {
    console.error('Failed to initiate transfer', requestError)
    return { error: requestError.message }
  }

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'transfers',
    metadata: { asset_id, to_department_id },
    description: `Initiated transfer for asset to new department`
  }])

  revalidatePath('/transfers')
  revalidatePath('/activities')
  
  return { success: true }
}
