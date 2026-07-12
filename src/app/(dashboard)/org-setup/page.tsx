import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DepartmentsTab from '@/components/org-setup/DepartmentsTab'
import CategoriesTab from '@/components/org-setup/CategoriesTab'
import EmployeeDirectoryTab from '@/components/org-setup/EmployeeDirectoryTab'

export const revalidate = 0 // Always fetch fresh data

export default async function OrgSetupPage() {
  const supabase = await createClient()

  // 1. Validate user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Validate user is an Administrator
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard') // Redirect non-admins to dashboard safely
  }

  // 3. Fetch data parallelly
  const [departmentsRes, categoriesRes, employeesRes] = await Promise.all([
    supabase.from('departments').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
    supabase.from('users').select('*').order('full_name')
  ])

  const departments = departmentsRes.data || []
  const categories = categoriesRes.data || []
  const employees = employeesRes.data || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Organization Setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system departments, classifications, and employee access roles.
        </p>
      </div>

      <Tabs defaultValue="employees" className="w-full space-y-4">
        <TabsList className="bg-secondary/50 border border-border">
          <TabsTrigger value="employees" className="data-[state=active]:bg-white data-[state=active]:text-primary">
            Employee Directory
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-white data-[state=active]:text-primary">
            Departments
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white data-[state=active]:text-primary">
            Asset Categories
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="space-y-4 focus-visible:outline-none">
          <EmployeeDirectoryTab employees={employees} departments={departments} />
        </TabsContent>

        <TabsContent value="departments" className="space-y-4 focus-visible:outline-none">
          <DepartmentsTab departments={departments} employees={employees} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4 focus-visible:outline-none">
          <CategoriesTab categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
