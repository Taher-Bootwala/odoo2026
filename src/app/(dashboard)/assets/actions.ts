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

  // Insert the asset
  const { data: asset, error: assetError } = await supabase
    .from('assets')
    .insert([{
      name,
      category_id,
      status,
      location,
      condition
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
    metadata: { entity_id: asset.id },
    description: `Added new asset: ${name} at ${location}`
  }])

  revalidatePath('/assets')
  revalidatePath('/activities')
  
  return { success: true }
}
