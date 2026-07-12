'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkManager(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthenticated')
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin' && profile?.role !== 'asset_manager') {
    throw new Error('Unauthorized: Manager or Admin access required')
  }
  return user.id
}

export async function createAsset(formData: {
  name: string
  serial_number?: string
  category_id: string
  purchase_date?: string
  purchase_cost?: number
  manufacturer?: string
  model?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  location?: string
  department_id?: string | null
  is_shared_resource: boolean
  resource_type?: 'meeting_room' | 'conference_hall' | 'projector' | 'company_vehicle' | null
  description?: string
  image_url?: string
}) {
  const supabase = await createClient()
  const userId = await checkManager(supabase)

  // Calculate default warranty expiry if category has default warranty period
  let warranty_expiry: string | null = null
  if (formData.purchase_date) {
    const { data: category } = await supabase
      .from('categories')
      .select('warranty_period_months')
      .eq('id', formData.category_id)
      .single()

    if (category?.warranty_period_months) {
      const pDate = new Date(formData.purchase_date)
      pDate.setMonth(pDate.getMonth() + category.warranty_period_months)
      warranty_expiry = pDate.toISOString().split('T')[0]
    }
  }

  // Generate randomized Asset ID tag (AST-XXXX)
  const tagSuffix = Math.random().toString(36).substring(2, 8).toUpperCase()
  const asset_id = `AST-${tagSuffix}`

  const { error } = await supabase
    .from('assets')
    .insert({
      asset_id,
      name: formData.name,
      serial_number: formData.serial_number || null,
      category_id: formData.category_id,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost || null,
      manufacturer: formData.manufacturer || null,
      model: formData.model || null,
      warranty_expiry,
      condition: formData.condition,
      location: formData.location || null,
      department_id: formData.department_id || null,
      is_shared_resource: formData.is_shared_resource,
      resource_type: formData.is_shared_resource ? (formData.resource_type || null) : null,
      description: formData.description || null,
      image_url: formData.image_url || null,
      status: 'available'
    })

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'ASSET_REGISTERED',
    module: 'ASSETS',
    description: `Asset registered: ${formData.name} (Tag: ${asset_id})`,
  })

  revalidatePath('/assets')
}

export async function updateAssetDetails(id: string, formData: {
  name: string
  serial_number?: string
  purchase_date?: string
  purchase_cost?: number
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged'
  location?: string
  department_id?: string | null
  description?: string
  status: 'available' | 'allocated' | 'reserved' | 'under_maintenance' | 'lost' | 'retired' | 'disposed'
}) {
  const supabase = await createClient()
  const userId = await checkManager(supabase)

  const { error } = await supabase
    .from('assets')
    .update({
      name: formData.name,
      serial_number: formData.serial_number || null,
      purchase_date: formData.purchase_date || null,
      purchase_cost: formData.purchase_cost || null,
      condition: formData.condition,
      location: formData.location || null,
      department_id: formData.department_id || null,
      description: formData.description || null,
      status: formData.status
    })
    .eq('id', id)

  if (error) throw new Error(error.message)

  // Log activity
  await supabase.from('activity_logs').insert({
    user_id: userId,
    action: 'ASSET_UPDATED',
    module: 'ASSETS',
    description: `Asset updated details: ${formData.name}`,
  })

  revalidatePath('/assets')
}
