'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function allocateAsset(formData: FormData) {
  const supabase = await createClient()

  const asset_id = formData.get('asset_id') as string
  const employee_id = formData.get('employee_id') as string
  const expected_return_date = formData.get('expected_return_date') as string
  const purpose = formData.get('purpose') as string

  // Get current user (the person allocating)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  // Get employee's department
  const { data: empData } = await supabase
    .from('users')
    .select('department_id')
    .eq('id', employee_id)
    .single()

  const department_id = empData?.department_id || null

  // Insert allocation record
  const { error: allocError } = await supabase
    .from('asset_allocations')
    .insert([{
      asset_id,
      employee_id,
      department_id,
      allocated_by: user.id,
      expected_return_date: expected_return_date || null,
      purpose,
      status: 'active'
    }])

  if (allocError) {
    console.error('Failed to allocate asset', allocError)
    return { error: allocError.message }
  }

  // Update asset status
  await supabase.from('assets').update({
    status: 'allocated',
    current_holder_id: employee_id
  }).eq('id', asset_id)

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'allocations',
    metadata: { asset_id, employee_id },
    description: `Allocated asset to employee`
  }])

  revalidatePath('/allocations')
  revalidatePath('/assets')
  revalidatePath('/activities')
  
  return { success: true }
}

export async function returnAsset(formData: FormData) {
  const supabase = await createClient()

  const allocation_id = formData.get('allocation_id') as string
  const return_condition = formData.get('return_condition') as string
  const return_remarks = formData.get('return_remarks') as string

  // Get allocation to find asset_id
  const { data: allocation, error: fetchError } = await supabase
    .from('asset_allocations')
    .select('asset_id')
    .eq('id', allocation_id)
    .single()

  if (fetchError || !allocation) {
    return { error: 'Allocation not found' }
  }

  // Update allocation
  const { error: allocError } = await supabase
    .from('asset_allocations')
    .update({
      status: 'returned',
      actual_return_date: new Date().toISOString().split('T')[0],
      return_condition,
      return_remarks
    })
    .eq('id', allocation_id)

  if (allocError) {
    return { error: allocError.message }
  }

  // Update asset status back to available
  await supabase.from('assets').update({
    status: 'available',
    current_holder_id: null,
    condition: return_condition
  }).eq('id', allocation.asset_id)

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'UPDATE',
    module: 'allocations',
    metadata: { allocation_id, asset_id: allocation.asset_id },
    description: `Asset returned in ${return_condition} condition`
  }])

  revalidatePath('/allocations')
  revalidatePath('/assets')
  revalidatePath('/activities')
  
  return { success: true }
}
