'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required')
  }
  return user.id
}

// ---- Department Actions ----
export async function createDepartment(formData: {
  name: string
  code: string
  parent_department_id?: string | null
  description?: string
}) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  const { error } = await supabase
    .from('departments')
    .insert({
      name: formData.name,
      code: formData.code.toUpperCase(),
      parent_department_id: formData.parent_department_id || null,
      description: formData.description || null,
      status: 'active'
    })

  if (error) throw new Error(error.message)
  revalidatePath('/org-setup')
}

export async function updateDepartment(id: string, formData: {
  name: string
  code: string
  parent_department_id?: string | null
  description?: string
  status: 'active' | 'inactive'
  head_id?: string | null
}) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  // Avoid circular parent hierarchy simple check
  if (formData.parent_department_id === id) {
    throw new Error("A department cannot be its own parent")
  }

  const { error } = await supabase
    .from('departments')
    .update({
      name: formData.name,
      code: formData.code.toUpperCase(),
      parent_department_id: formData.parent_department_id || null,
      description: formData.description || null,
      status: formData.status,
      head_id: formData.head_id || null
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  
  // If department head is assigned, update user's role to department_head automatically
  if (formData.head_id) {
    await supabase
      .from('users')
      .update({ role: 'department_head' })
      .eq('id', formData.head_id)
      .eq('role', 'employee') // Only promote if they are currently a standard employee
  }

  revalidatePath('/org-setup')
}

// ---- Category Actions ----
export async function createCategory(formData: {
  name: string
  description?: string
  warranty_period_months?: number
}) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  const { error } = await supabase
    .from('categories')
    .insert({
      name: formData.name,
      description: formData.description || null,
      warranty_period_months: formData.warranty_period_months || null,
      status: 'active'
    })

  if (error) throw new Error(error.message)
  revalidatePath('/org-setup')
}

export async function updateCategory(id: string, formData: {
  name: string
  description?: string
  warranty_period_months?: number
  status: 'active' | 'inactive'
}) {
  const supabase = await createClient()
  await checkAdmin(supabase)

  const { error } = await supabase
    .from('categories')
    .update({
      name: formData.name,
      description: formData.description || null,
      warranty_period_months: formData.warranty_period_months || null,
      status: formData.status
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/org-setup')
}

// ---- Employee / User Directory Actions ----
export async function updateEmployeeRoleOrStatus(
  employeeId: string, 
  updates: { role?: 'admin' | 'asset_manager' | 'department_head' | 'employee'; status?: 'active' | 'inactive'; department_id?: string | null }
) {
  const supabase = await createClient()
  const adminId = await checkAdmin(supabase)

  // Prevent self-promotion or self-status mutation to avoid locked admin state
  if (employeeId === adminId) {
    throw new Error('Self promotion or self deactivation is blocked for security.')
  }

  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', employeeId)

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: adminId,
    action: 'USER_ROLE_MUTATED',
    module: 'ORGANIZATION',
    description: `Admin updated employee role/status.`,
    metadata: { target_employee_id: employeeId, updates }
  })

  revalidatePath('/org-setup')
}
