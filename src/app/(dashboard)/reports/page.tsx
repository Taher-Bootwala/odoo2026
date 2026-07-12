import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportsClient from './ReportsClient'

export const revalidate = 0 // Always fetch fresh metrics

export default async function ReportsPage() {
  const supabase = await createClient()

  // 1. Authenticate check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Gather data for Chart 1: Asset statuses
  const { data: statusRes } = await supabase
    .from('assets')
    .select('status')
  
  const statusCounts: Record<string, number> = {}
  statusRes?.forEach(a => {
    statusCounts[a.status] = (statusCounts[a.status] || 0) + 1
  })
  
  const utilizationData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: count
  }))

  // 3. Gather data for Chart 2: Maintenance tickets per category
  const { data: maintRes } = await supabase
    .from('maintenance_requests')
    .select('assets(categories(name))')

  const categoryCounts: Record<string, number> = {}
  maintRes?.forEach((r: any) => {
    const catName = r.assets?.categories?.name || 'Unassigned'
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
  })

  const maintenanceData = Object.entries(categoryCounts).map(([catName, count]) => ({
    name: catName,
    tickets: count
  }))

  // 4. Gather data for Chart 3: Department holdings
  const { data: deptRes } = await supabase
    .from('assets')
    .select('departments(name)')

  const deptCounts: Record<string, number> = {}
  deptRes?.forEach((a: any) => {
    const deptName = a.departments?.name || 'Stock Inventory'
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1
  })

  const departmentData = Object.entries(deptCounts).map(([deptName, count]) => ({
    name: deptName,
    assets: count
  }))

  return (
    <ReportsClient 
      utilizationData={utilizationData}
      maintenanceData={maintenanceData}
      departmentData={departmentData}
    />
  )
}
