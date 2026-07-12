'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addAsset(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category_id = formData.get('category_id') as string
  const status = formData.get('status') as string
  const location = formData.get('location') as string
  const condition = formData.get('condition') as string

  // Schema-aligned optional columns
  const serial_number = formData.get('serial_number') as string || null
  const manufacturer = formData.get('manufacturer') as string || null
  const model = formData.get('model') as string || null
  
  const purchase_date = formData.get('purchase_date') as string || null
  const warranty_expiry = formData.get('warranty_expiry') as string || null
  
  const purchase_cost_raw = formData.get('purchase_cost') as string
  const purchase_cost = purchase_cost_raw ? parseFloat(purchase_cost_raw) : null

  const is_shared_resource = formData.get('is_shared_resource') === 'true'
  const resource_type = is_shared_resource ? (formData.get('resource_type') as string || null) : null
  const description = formData.get('description') as string || null

  // Insert the asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert([{
      name,
      category_id,
      status,
      location,
      condition,
      serial_number,
      manufacturer,
      model,
      purchase_date,
      warranty_expiry,
      purchase_cost,
      is_shared_resource,
      resource_type,
      description
    }])
    .select()
    .single()

  if (assetError) {
    console.error('Failed to add asset', assetError)
    return { error: assetError.message }
  }

  // Create an activity log
  await supabase.from('activity_logs').insert([{
    action: 'CREATE',
    module: 'assets',
    metadata: { asset_id: asset.id },
    description: `Added new asset: ${name} (${asset.asset_id})`
  }])

  revalidatePath('/assets')
  revalidatePath('/activities')
  
  return { success: true }
}
