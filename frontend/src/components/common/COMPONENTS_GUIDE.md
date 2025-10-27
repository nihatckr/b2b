# Common Components - Complete Guide

## 📚 Overview

Bu dokümantasyon, ProtexFlow projesinde tekrar kullanılabilir common component'lerin tam rehberidir. Her component DRY (Don't Repeat Yourself) prensibine göre tasarlanmıştır.

## 🗂️ Component Categories

### 1. Dialog & Modal Components

- **DetailModal** - Detay gösterme modal'ı
- **DeleteDialog** - Silme onay dialog'u
- **ConfirmDialog** - Genel onay dialog'u
- **FormDialog** - Form içeren dialog

### 2. Card Components

- **InfoCard** - Bilgi gösterme kartı
- **InfoGrid** - Grid layout bilgi kartları
- **DataCard** - Veri gösterme kartı
- **StatsCard** - İstatistik kartı
- **StatsGrid** - Grid layout istatistik kartları

### 3. Table Components

- **DataTable** - Generic data table
- **Column** - Table column configuration

### 4. Detail Display Components

- **DetailRow** - Detay satırı (label-value pair)
- **DetailSection** - Detay section wrapper

### 5. State Components

- **LoadingState** - Yükleniyor durumu
- **EmptyState** - Boş durum gösterimi

### 6. Layout Components

- **PageHeader** - Sayfa başlığı
- **FilterBar** - Filtre ve arama çubuğu

### 7. Action Components

- **ActionButtons** - Action button grubu

---

## 📖 Component Documentation

### DetailModal

Detay gösterme için modal component.

**Props:**

```typescript
interface DetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}
```

**Kullanım:**

```tsx
import { DetailModal } from "@/components/common";
import { Package } from "lucide-react";

<DetailModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  title="Product Details"
  icon={Package}
  maxWidth="lg"
>
  <DetailSection title="Basic Info">
    <DetailRow label="Name" value={product.name} />
    <DetailRow label="SKU" value={product.sku} />
  </DetailSection>
</DetailModal>;
```

**Özellikler:**

- ✅ Icon desteği
- ✅ Responsive maxWidth seçenekleri
- ✅ Auto-spacing children
- ✅ Clean header design

---

### DeleteDialog

Silme onayı için alert dialog component.

**Props:**

```typescript
interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  isLoading?: boolean;
}
```

**Kullanım:**

```tsx
import { DeleteDialog } from "@/components/common";

<DeleteDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onConfirm={handleDelete}
  itemName={user.name}
  isLoading={deleting}
/>;
```

**Özellikler:**

- ✅ Auto-generated description with itemName
- ✅ Loading state support
- ✅ Destructive styling
- ✅ Cancel button
- ✅ Custom title/description override

**Default Behavior:**

- Title: "Are you sure?"
- Description: Auto-generated from `itemName` or custom text
- Confirm button: Red/destructive with loading state

---

### DetailRow & DetailSection

Detay bilgilerini göstermek için row ve section component'leri.

**Props:**

```typescript
interface DetailRowProps {
  label: string;
  value?: string | number | null;
  icon?: LucideIcon;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  valueClassName?: string;
  children?: React.ReactNode;
}

interface DetailSectionProps {
  title?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}
```

**Kullanım:**

```tsx
import { DetailSection, DetailRow } from "@/components/common";
import { Package, Calendar } from "lucide-react";

<DetailSection title="Product Information" icon={Package}>
  <DetailRow label="Product Name" value={product.name} />
  <DetailRow label="Status" badge={{ text: "Active", variant: "default" }} />
  <DetailRow label="Created At" icon={Calendar}>
    {formatDate(product.createdAt)}
  </DetailRow>
</DetailSection>;
```

**Özellikler:**

- ✅ Label-value pairs with border separation
- ✅ Icon support per row
- ✅ Badge support
- ✅ Custom children rendering
- ✅ Null/undefined handling (shows "-")
- ✅ Section grouping with optional title

---

### InfoCard & InfoGrid

Bilgi gösterme kartları ve grid layout.

**Props:**

```typescript
interface InfoCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

interface InfoGridProps {
  items: {
    label: string;
    value: string | number | null | undefined;
    icon?: LucideIcon;
    colorClass?: string;
  }[];
  columns?: 1 | 2 | 3 | 4;
}
```

**Kullanım:**

```tsx
import { InfoCard, InfoGrid } from "@/components/common";
import { Package, Calendar } from "lucide-react";

// InfoCard
<InfoCard title="Product Specs" icon={Package}>
  <InfoGrid
    items={[
      { label: "Weight", value: "2.5 kg", icon: Package },
      { label: "Dimensions", value: "10x20x30 cm" },
      { label: "Color", value: "Blue", colorClass: "bg-blue-50" },
    ]}
    columns={3}
  />
</InfoCard>

// InfoGrid Standalone
<InfoGrid
  items={[
    { label: "Season", value: "Summer", colorClass: "bg-orange-50" },
    { label: "Gender", value: "Unisex", colorClass: "bg-purple-50" },
  ]}
  columns={2}
/>
```

**Özellikler:**

- ✅ Responsive grid (1-4 columns)
- ✅ Icon support per item
- ✅ Custom colorClass per item
- ✅ Null/undefined handling
- ✅ Header action support (InfoCard)

---

### ActionButtons

Action button grubu component.

**Props:**

```typescript
interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface ActionButtonsProps {
  buttons: ActionButton[];
  align?: "left" | "center" | "right";
  className?: string;
}
```

**Kullanım:**

```tsx
import { ActionButtons } from "@/components/common";
import { Edit, Trash2, Eye } from "lucide-react";

<ActionButtons
  buttons={[
    {
      label: "View",
      icon: Eye,
      onClick: handleView,
      variant: "ghost",
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: handleEdit,
      variant: "outline",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      variant: "destructive",
      loading: isDeleting,
    },
  ]}
  align="right"
/>;
```

**Özellikler:**

- ✅ Multiple buttons with consistent spacing
- ✅ Loading state per button
- ✅ Icon support
- ✅ Flexible alignment
- ✅ All button variants
- ✅ Disabled state

---

### DataTable

Generic table component (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { DataTable } from "@/components/common";

<DataTable
  data={users}
  columns={[
    { header: "Name", accessorKey: "name" },
    { header: "Status", cell: (row) => <Badge>{row.status}</Badge> },
  ]}
  emptyMessage="No users found"
/>;
```

---

### StatsCard & StatsGrid

İstatistik kartları (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { StatsGrid } from "@/components/common";
import { Users } from "lucide-react";

<StatsGrid
  stats={[
    {
      title: "Total Users",
      value: 245,
      icon: <Users className="h-4 w-4" />,
      description: "Active users",
    },
  ]}
/>;
```

---

### PageHeader

Sayfa başlığı component (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { PageHeader } from "@/components/common";
import { Users, Plus } from "lucide-react";

<PageHeader
  title="User Management"
  description="View and manage all users"
  icon={<Users />}
  action={
    <Button onClick={handleCreate}>
      <Plus className="mr-2 h-4 w-4" />
      New User
    </Button>
  }
/>;
```

---

### FilterBar

Filtre ve arama çubuğu (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { FilterBar } from "@/components/common";

<FilterBar
  title="Filters"
  search={{
    placeholder: "Search users...",
    value: searchTerm,
    onChange: setSearchTerm,
  }}
  filters={[
    {
      placeholder: "Filter by role",
      value: roleFilter,
      options: [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "admin" },
      ],
      onChange: setRoleFilter,
    },
  ]}
/>;
```

---

### LoadingState

Yükleniyor durumu component (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { LoadingState } from "@/components/common";

{
  loading && <LoadingState message="Loading users..." />;
}
```

---

### EmptyState

Boş durum component (zaten dokümante edilmiş).

**Quick Reference:**

```tsx
import { EmptyState } from "@/components/common";
import { Users } from "lucide-react";

{
  users.length === 0 && (
    <EmptyState
      icon={Users}
      title="No Users Found"
      description="Create your first user to get started"
    />
  );
}
```

---

## 🎯 Best Practices

### 1. Component Composition

**❌ BAD:** Tekrar eden kod

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Product Details
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">{/* content */}</div>
  </DialogContent>
</Dialog>
```

**✅ GOOD:** Reusable component

```tsx
<DetailModal
  open={open}
  onOpenChange={setOpen}
  title="Product Details"
  icon={Package}
>
  {/* content */}
</DetailModal>
```

### 2. Delete Confirmations

**❌ BAD:** Her yerde AlertDialog kopyala-yapıştır

```tsx
<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete {user.name}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**✅ GOOD:** Tek satır

```tsx
<DeleteDialog
  open={deleteOpen}
  onOpenChange={setDeleteOpen}
  onConfirm={handleDelete}
  itemName={user.name}
/>
```

### 3. Detail Displays

**❌ BAD:** Manuel div'ler

```tsx
<div className="space-y-2">
  <div className="flex justify-between border-b pb-2">
    <span className="text-sm text-muted-foreground">Name</span>
    <span className="font-medium">{product.name}</span>
  </div>
  <div className="flex justify-between border-b pb-2">
    <span className="text-sm text-muted-foreground">SKU</span>
    <span className="font-medium">{product.sku}</span>
  </div>
</div>
```

**✅ GOOD:** DetailRow component

```tsx
<DetailSection title="Basic Info">
  <DetailRow label="Name" value={product.name} />
  <DetailRow label="SKU" value={product.sku} />
</DetailSection>
```

### 4. Action Buttons

**❌ BAD:** Tekrar eden button'lar

```tsx
<div className="flex gap-2 justify-end">
  <Button variant="ghost" onClick={handleView}>
    <Eye className="h-4 w-4 mr-2" />
    View
  </Button>
  <Button variant="outline" onClick={handleEdit}>
    <Edit className="h-4 w-4 mr-2" />
    Edit
  </Button>
  <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
    {isDeleting ? "Deleting..." : "Delete"}
  </Button>
</div>
```

**✅ GOOD:** ActionButtons component

```tsx
<ActionButtons
  buttons={[
    { label: "View", icon: Eye, onClick: handleView, variant: "ghost" },
    { label: "Edit", icon: Edit, onClick: handleEdit, variant: "outline" },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      variant: "destructive",
      loading: isDeleting,
    },
  ]}
  align="right"
/>
```

---

## 🚀 Migration Guide

### Adım 1: Import Değişiklikleri

**Önce:**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  // ... 10+ import
} from "@/components/ui/alert-dialog";
```

**Sonra:**

```tsx
import {
  DetailModal,
  DeleteDialog,
  DetailRow,
  ActionButtons,
} from "@/components/common";
```

### Adım 2: Component Değişiklikleri

1. **Dialog → DetailModal**
2. **AlertDialog (delete) → DeleteDialog**
3. **Manual rows → DetailRow/DetailSection**
4. **Button groups → ActionButtons**
5. **Info sections → InfoCard/InfoGrid**

### Adım 3: Test

- ✅ TypeScript hataları yok
- ✅ Tüm functionality çalışıyor
- ✅ Styling tutarlı

---

## 📊 Component Comparison

| Old Pattern        | Lines | New Component | Lines | Saved |
| ------------------ | ----- | ------------- | ----- | ----- |
| Manual Dialog      | ~25   | DetailModal   | 1-5   | ~20   |
| Delete AlertDialog | ~20   | DeleteDialog  | 1     | ~19   |
| Manual Detail Rows | ~15   | DetailRow     | ~3    | ~12   |
| Button Group       | ~10   | ActionButtons | 1     | ~9    |
| Info Cards         | ~20   | InfoGrid      | 1     | ~19   |

**Toplam tasarruf:** Ortalama **70-80 satır** per page!

---

## 🎨 Styling Guide

Tüm component'ler Tailwind CSS ve shadcn/ui design system'i kullanır:

- **Spacing:** Consistent gap, padding (2, 4, 6, 8)
- **Colors:** theme-aware (muted-foreground, destructive, etc.)
- **Typography:** text-sm, font-medium, etc.
- **Borders:** rounded-lg, border-muted
- **Icons:** Lucide React (h-4 w-4, h-5 w-5)

---

## ✅ Checklist: Component Seçimi

Hangi component'i kullanmalıyım?

- [ ] **DetailModal** → Item detaylarını göstereceksen
- [ ] **DeleteDialog** → Silme onayı isteyeceksen
- [ ] **DetailRow** → Label-value pair göstereceksen
- [ ] **InfoGrid** → Multiple properties grid'de göstereceksen
- [ ] **ActionButtons** → 2+ action button yan yana dizeceksen
- [ ] **DataTable** → Liste/table göstereceksen
- [ ] **StatsGrid** → İstatistikleri card'larda göstereceksen
- [ ] **PageHeader** → Sayfa başlığı + action button
- [ ] **FilterBar** → Search + filters
- [ ] **LoadingState** → Loading indicator
- [ ] **EmptyState** → Boş liste durumu

---

## 🔧 Troubleshooting

### Component import edilemiyor

```bash
# Index.ts'de export edildiğinden emin ol
# Veya direct import kullan:
import { DetailModal } from "@/components/common/DetailModal";
```

### TypeScript hataları

```tsx
// Icon type: LucideIcon
import { Package } from "lucide-react";
const MyIcon: LucideIcon = Package;

// Children type: React.ReactNode
children: React.ReactNode;
```

### Styling override

```tsx
// className prop'u kullan
<DetailModal className="custom-class" />
<InfoCard className="bg-blue-50" />
```

---

## 📝 Examples Repository

Tüm component'lerin live examples için:
`/frontend/src/app/(protected)/dashboard/[page]/page.tsx`

---

**Son Güncelleme:** 27 Ekim 2025
**Version:** 2.0
**Maintainer:** ProtexFlow Team
