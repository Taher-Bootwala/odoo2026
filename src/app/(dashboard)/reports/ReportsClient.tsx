'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts'
import { BarChart3, TrendingUp, HelpCircle, Wrench, Building } from 'lucide-react'

interface ReportsClientProps {
  utilizationData: any[]
  maintenanceData: any[]
  departmentData: any[]
}

const COLORS = ['#FF9F7C', '#FFD1A9', '#FFE5D9', '#E2E8F0']

export default function ReportsClient({ utilizationData, maintenanceData, departmentData }: ReportsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review utilization rates, repair costs, and department asset allocation summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Asset Status Utilization */}
        <Card className="border-border/80 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-primary" />
              Asset Status Distribution
            </CardTitle>
            <CardDescription className="text-xs">
              Count of assets categorized by their active lifecycle status.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={utilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                >
                  {utilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Maintenance by Category */}
        <Card className="border-border/80 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Wrench className="h-4 w-4 text-primary" />
              Maintenance Requests by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Total number of maintenance tickets generated per asset category.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={maintenanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,159,124,0.05)' }} />
                <Bar dataKey="tickets" fill="#FF9F7C" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Department wise Distribution */}
        <Card className="border-border/80 shadow-sm bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Building className="h-4 w-4 text-primary" />
              Department Allocation Summary
            </CardTitle>
            <CardDescription className="text-xs">
              Total physical asset inventory holdings and checkouts assigned per department.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,159,124,0.05)' }} />
                <Bar dataKey="assets" fill="#FF9F7C" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
