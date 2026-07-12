'use client'

import { useState, useMemo } from 'react'
import { 
  useReactTable, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table'
import { Search, Info, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getStatusColor, formatStatus } from '@/lib/utils'
import AssetRegistrationForm from './AssetRegistrationForm'
import AssetDetailDrawer from './AssetDetailDrawer'

interface AssetDirectoryProps {
  initialAssets: any[]
  categories: any[]
  departments: any[]
  userRole: string
}

export default function AssetDirectory({ initialAssets, categories, departments, userRole }: AssetDirectoryProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const [activeAsset, setActiveAsset] = useState<any | null>(null)
  const [openDrawer, setOpenDrawer] = useState(false)

  const isManagerOrAdmin = userRole === 'admin' || userRole === 'asset_manager'

  // Filter logic combined for TanStack
  const filteredAssets = useMemo(() => {
    return initialAssets.filter(asset => {
      const matchCategory = selectedCategory === 'all' || asset.category_id === selectedCategory
      const matchStatus = selectedStatus === 'all' || asset.status === selectedStatus
      return matchCategory && matchStatus
    })
  }, [initialAssets, selectedCategory, selectedStatus])

  const handleRowClick = (asset: any) => {
    setActiveAsset(asset)
    setOpenDrawer(true)
  }

  // Column helpers for TanStack table
  const columnHelper = createColumnHelper<any>()
  const columns = useMemo(() => [
    columnHelper.accessor('asset_id', {
      header: 'Asset Tag',
      cell: info => <span className="font-bold text-foreground">{info.getValue()}</span>
    }),
    columnHelper.accessor('name', {
      header: 'Asset Name',
      cell: info => <span className="font-semibold text-foreground">{info.getValue()}</span>
    }),
    columnHelper.accessor('categories.name', {
      header: 'Category',
      cell: info => info.getValue() || 'Unclassified'
    }),
    columnHelper.accessor('condition', {
      header: 'Condition',
      cell: info => <span className="capitalize">{info.getValue()}</span>
    }),
    columnHelper.accessor('location', {
      header: 'Location',
      cell: info => info.getValue() || <span className="text-muted-foreground">-</span>
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <Badge variant="outline" className={getStatusColor(info.getValue())}>
          {formatStatus(info.getValue())}
        </Badge>
      )
    }),
    columnHelper.accessor('current_holder_id', {
      header: 'Current Holder',
      cell: props => {
        const holder = props.row.original.current_holder?.full_name
        return holder ? <span className="font-medium">{holder}</span> : <span className="text-muted-foreground text-xs">Org Inventory</span>
      }
    }),
    columnHelper.display({
      id: 'actions',
      cell: props => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => {
          e.stopPropagation()
          handleRowClick(props.row.original)
        }}>
          <Eye className="h-4 w-4" />
        </Button>
      )
    })
  ], [])

  const table = useReactTable({
    data: filteredAssets,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase()
      const name = String(row.getValue('name') || '').toLowerCase()
      const tag = String(row.getValue('asset_id') || '').toLowerCase()
      const serial = String(row.original.serial_number || '').toLowerCase()
      return name.includes(search) || tag.includes(search) || serial.includes(search)
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Asset Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and query organization physical inventory, check condition status, and view transaction history.
          </p>
        </div>
        
        {isManagerOrAdmin && (
          <AssetRegistrationForm categories={categories} departments={departments} />
        )}
      </div>

      {/* Filters Board */}
      <div className="bg-white border border-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-end">
        {/* Search filter */}
        <div className="space-y-1.5 w-full md:flex-1">
          <Label htmlFor="search-input">Search Assets</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              id="search-input"
              value={globalFilter} 
              onChange={e => setGlobalFilter(e.target.value)} 
              placeholder="Query name, tag (AST-XXXX), serial number..." 
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="space-y-1.5 w-full md:w-48">
          <Label htmlFor="category-filter">Category</Label>
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || '')}>
            <SelectTrigger id="category-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status filter */}
        <div className="space-y-1.5 w-full md:w-48">
          <Label htmlFor="status-filter">Status</Label>
          <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || '')}>
            <SelectTrigger id="status-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="allocated">Allocated</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="under_maintenance">Maintenance</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="retired">Retired</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="border border-border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground text-sm">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Info className="h-5 w-5 opacity-40 mb-1" />
                    <p className="font-medium">No assets matched your current search filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id} 
                  className="cursor-pointer hover:bg-slate-50/50"
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-2">
        <div className="text-xs text-muted-foreground">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.previousPage()} 
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-border"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => table.nextPage()} 
            disabled={!table.getCanNextPage()}
            className="h-8 border-border"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Detail Drawer */}
      <AssetDetailDrawer 
        asset={activeAsset} 
        open={openDrawer} 
        onClose={() => setOpenDrawer(false)} 
      />
    </div>
  )
}
