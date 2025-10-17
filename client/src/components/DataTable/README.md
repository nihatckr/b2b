# SimpleDataTable Component

Reusable data table component with sorting functionality.

## Usage

```tsx
import { SimpleDataTable, ColumnDef } from "@/components/DataTable";

// Define your data type
interface MyData {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Define columns
const columns: ColumnDef<MyData>[] = [
  {
    id: 'name',
    header: 'Name',
    accessorKey: 'name',
    sortable: true,
  },
  {
    id: 'email',
    header: 'Email',
    accessorKey: 'email',
    sortable: true,
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (row) => (
      <Button onClick={() => console.log(row.id)}>View</Button>
    ),
  },
];

// Use the component
<SimpleDataTable
  data={myData}
  columns={columns}
  getRowKey={(row) => row.id}
  defaultSortField="createdAt"
  defaultSortDirection="desc"
  emptyMessage="No data found"
/>
```

## Props

- `data`: Array of data objects
- `columns`: Array of column definitions
- `getRowKey`: Function to get unique key from row
- `defaultSortField`: Initial sort field (optional)
- `defaultSortDirection`: 'asc' or 'desc' (default: 'desc')
- `emptyMessage`: Message to show when no data (optional)

## Column Definition

- `id`: Unique column identifier
- `header`: Column header text or React node
- `accessorKey`: Key to access data (for sorting)
- `cell`: Custom cell renderer function
- `sortable`: Enable sorting for this column
- `className`: CSS classes for the column
