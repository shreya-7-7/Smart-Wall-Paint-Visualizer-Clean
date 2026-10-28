import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useNavigate } from "react-router-dom"
import '../pages/AdminDashboard.css'

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

const ChevronLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

// Detail drawer component
function ItemDrawer({ item, onClose }) {
  if (!item) return null
  return (
    <>
      <div className="admin-drawer-overlay" onClick={onClose} />
      <div className="admin-drawer">
        <div className="admin-drawer-header">
          <div>
            <h3 className="admin-drawer-title">{item.name}</h3>
            <p className="admin-drawer-sub">{item.category} · Rs. {item.price?.toLocaleString()}</p>
          </div>
          <button className="admin-drawer-close" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="admin-drawer-body">
          {item.imagePath && (
            <img
              src={item.imagePath} alt={item.name}
              className="admin-drawer-img"
              onError={e => { e.target.style.display = 'none' }}
            />
          )}
          {[
            { label: 'Category', value: item.category },
            { label: 'Price', value: `Rs. ${item.price?.toLocaleString()}` },
            item.material && { label: 'Material', value: item.material },
            item.description && { label: 'Description', value: item.description },
            item.dimensions && {
              label: 'Dimensions (cm)',
              value: `W: ${item.dimensions.width} · D: ${item.dimensions.depth} · H: ${item.dimensions.height}`,
            },
          ].filter(Boolean).map(({ label, value }) => (
            <div key={label} className="admin-drawer-field">
              <span className="admin-drawer-field-label">{label}</span>
              <span className="admin-drawer-field-value">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function DataTable({ data: initialData, onDelete }) {
  const navigate = useNavigate()
  const [data, setData] = React.useState([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })
  const [activeItem, setActiveItem] = React.useState(null)

  React.useEffect(() => { setData(initialData || []) }, [initialData])

  const columns = React.useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <button className="admin-table-name-btn" onClick={() => setActiveItem(row.original)}>
          {row.original.name}
        </button>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="admin-cat-badge">{row.original.category}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => (
        <span style={{ fontWeight: 600, color: '#8B7355' }}>
          Rs. {row.original.price?.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'material',
      header: 'Material',
      cell: ({ row }) => (
        <span style={{ color: '#9CA3AF', fontSize: 12 }}>{row.original.material || '—'}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: () => (
        <span className="admin-status-badge">
          <CheckIcon /> Active
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="admin-action-btn edit"
            onClick={() => navigate(`/admin/edit/${row.original._id}`)}
          >
            Edit
          </button>
          <button
            className="admin-action-btn delete"
            onClick={() => {
              if (window.confirm(`Delete "${row.original.name}"?`)) {
                onDelete && onDelete(row.original._id)
              }
            }}
          >
            Delete
          </button>
        </div>
      ),
    },
  ], [navigate, onDelete])

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { pageIndex, pageSize } = table.getState().pagination
  const totalRows = table.getFilteredRowModel().rows.length
  const start = pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)

  return (
    <>
      <div className="admin-table-card">
        <div className="admin-table-header">
          <span className="admin-table-title">Furniture Products</span>
          <div className="admin-table-actions">
            <input
              className="admin-table-search"
              placeholder="Search products…"
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
            />
            <button className="admin-add-btn" onClick={() => navigate('/admin/add')}>
              <PlusIcon /> Add Furniture
            </button>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        typeof header.column.columnDef.header === 'function'
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>
                        {cell.column.columnDef.cell(cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', color: '#9CA3AF', padding: '40px 0' }}>
                    No furniture items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <span className="admin-pagination-info">
            {totalRows > 0 ? `Showing ${start}–${end} of ${totalRows}` : 'No results'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>Rows</span>
              <select
                className="admin-rows-select"
                value={pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
              >
                {[10, 20, 30, 50].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="admin-pagination-btns">
              <button className="admin-page-btn" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                <ChevronLeftIcon />
              </button>
              <span style={{ fontSize: 12, color: '#6B7280', padding: '0 4px' }}>
                {pageIndex + 1} / {table.getPageCount() || 1}
              </span>
              <button className="admin-page-btn" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                <ChevronRightIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeItem && <ItemDrawer item={activeItem} onClose={() => setActiveItem(null)} />}
    </>
  )
}
