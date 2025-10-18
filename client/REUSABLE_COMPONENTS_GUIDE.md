# 🎨 Reusable Component Kılavuzu

**Tarih:** 18 Ekim 2025
**Proje:** Tekstil Üretim Yönetim Sistemi - Client Components

---

## 📚 Yeni Eklenen Reusable Components

### 1️⃣ EmptyState Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/empty-state.tsx`

**Amaç:** Boş durum gösterimleri için

**Kullanım:**
```typescript
import { EmptyState } from "@/components/ui/empty-state";
import { Package, Plus } from "lucide-react";

<EmptyState
  icon={Package}
  title="No samples found"
  description="Get started by creating your first sample request"
  action={{
    label: "Create Sample",
    onClick: () => setShowModal(true),
    icon: Plus
  }}
/>
```

**Props:**
- `icon?`: LucideIcon - Gösterilecek icon
- `title`: string - Başlık
- `description?`: string - Açıklama metni
- `action?`: { label, onClick, icon } - CTA butonu
- `children?`: ReactNode - Özel içerik

**Önceki Kullanım:**
```tsx
// ❌ Her yerde tekrar eden kod
<div className="flex flex-col items-center justify-center py-12">
  <p className="text-muted-foreground">No data found</p>
</div>
```

**Yeni Kullanım:**
```tsx
// ✅ Tek satır
<EmptyState title="No data found" />
```

---

### 2️⃣ StatsCard Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/stats-card.tsx`

**Amaç:** Dashboard istatistik kartları

**Kullanım:**
```typescript
import { StatsCard } from "@/components/ui/stats-card";
import { Package, TrendingUp } from "lucide-react";

<StatsCard
  title="Total Samples"
  value={120}
  description="Last 30 days"
  icon={Package}
  trend={{
    value: 12.5,
    label: "vs last month",
    direction: "up"
  }}
  variant="primary"
/>
```

**Props:**
- `title`: string - Kart başlığı
- `value`: string | number - Ana değer
- `description?`: string - Alt açıklama
- `icon?`: LucideIcon - Icon
- `trend?`: { value, label, direction } - Trend bilgisi
- `variant?`: "default" | "primary" | "success" | "warning" | "danger"

**Variant'lar:**
```tsx
<StatsCard variant="primary" />   // Mavi tema
<StatsCard variant="success" />   // Yeşil tema
<StatsCard variant="warning" />   // Sarı tema
<StatsCard variant="danger" />    // Kırmızı tema
```

---

### 3️⃣ StatusBadge Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/status-badge.tsx`

**Amaç:** Otomatik status badge'leri

**Kullanım:**
```typescript
import { StatusBadge } from "@/components/ui/status-badge";
import { CheckCircle } from "lucide-react";

// Otomatik mapping
<StatusBadge status="APPROVED" />

// Icon ile
<StatusBadge status="IN_PROGRESS" icon={CheckCircle} />

// Custom variant
<StatusBadge status="CUSTOM_STATUS" customVariant="destructive" />

// Custom status map
<StatusBadge
  status="CUSTOM"
  statusMap={{
    CUSTOM: { variant: "default", label: "Custom Status" }
  }}
/>
```

**Built-in Status Mappings:**
```typescript
PENDING → secondary badge
APPROVED → default badge
COMPLETED → default badge
REJECTED → destructive badge
IN_PROGRESS → default badge "In Progress"
ON_HOLD → secondary badge "On Hold"
```

**Önceki Kullanım:**
```tsx
// ❌ Her yerde getStatusBadge fonksiyonu
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "APPROVED":
      return <Badge variant="default">Approved</Badge>;
    // ... 20+ satır kod
  }
};
```

**Yeni Kullanım:**
```tsx
// ✅ Tek satır, otomatik mapping
<StatusBadge status={sample.status} />
```

---

### 4️⃣ PageHeader Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/page-header.tsx`

**Amaç:** Sayfa başlıkları ve breadcrumb'lar

**Kullanım:**
```typescript
import { PageHeader } from "@/components/ui/page-header";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

<PageHeader
  title="Samples"
  description="Manage your sample requests and track their progress"
  icon={Package}
  breadcrumbs={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Samples" }
  ]}
  actions={
    <>
      <Button variant="outline">Export</Button>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        New Sample
      </Button>
    </>
  }
/>
```

**Props:**
- `title`: string - Sayfa başlığı
- `description?`: string - Açıklama
- `icon?`: LucideIcon - Icon
- `breadcrumbs?`: Array<{ label, href? }> - Breadcrumb navigation
- `actions?`: ReactNode - Sağ taraftaki action butonlar

---

### 5️⃣ SearchInput Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/search-input.tsx`

**Amaç:** Icon'lu arama input'u

**Kullanım:**
```typescript
import { SearchInput } from "@/components/ui/search-input";

const [search, setSearch] = useState("");

<SearchInput
  value={search}
  onChange={setSearch}
  placeholder="Search samples..."
  onClear={() => console.log("Cleared")}
/>
```

**Özellikler:**
- ✅ Sol tarafta Search icon
- ✅ Sağ tarafta Clear (X) butonu (value doluysa)
- ✅ Auto-focus ve keyboard shortcuts

**Önceki Kullanım:**
```tsx
// ❌ Her yerde tekrar eden input yapısı
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-9" ... />
</div>
```

**Yeni Kullanım:**
```tsx
// ✅ Tek component
<SearchInput value={search} onChange={setSearch} />
```

---

### 6️⃣ FilterBar Component ⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/filter-bar.tsx`

**Amaç:** Filter container

**Kullanım:**
```typescript
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { Select } from "@/components/ui/select";

<FilterBar>
  <SearchInput value={search} onChange={setSearch} className="w-full md:w-64" />
  <Select value={status} onValueChange={setStatus}>
    <SelectTrigger className="w-40">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="pending">Pending</SelectItem>
    </SelectContent>
  </Select>
  <Button variant="outline">Reset</Button>
</FilterBar>
```

**Özellikler:**
- ✅ Responsive flex wrap
- ✅ Consistent spacing
- ✅ Card container

---

### 7️⃣ LoadingSpinner & LoadingOverlay ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/loading-spinner.tsx`

**Amaç:** Loading gösterimleri

**Kullanım:**
```typescript
import { LoadingSpinner, LoadingOverlay } from "@/components/ui/loading-spinner";

// Inline spinner
<LoadingSpinner size="md" text="Loading..." />

// Full page overlay
{loading && <LoadingOverlay text="Processing..." />}
```

**Props:**
- `size?`: "sm" | "md" | "lg"
- `text?`: string - Alt açıklama

**Önceki Kullanım:**
```tsx
// ❌ Her yerde Skeleton veya custom loading
{loading ? <Skeleton className="h-20" /> : <Content />}
```

**Yeni Kullanım:**
```tsx
// ✅ Standart loading state
{loading ? <LoadingSpinner text="Loading data..." /> : <Content />}
```

---

### 8️⃣ InfoItem & InfoGrid ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/info-item.tsx`

**Amaç:** Bilgi gösterimleri

**Kullanım:**
```typescript
import { InfoItem, InfoGrid } from "@/components/ui/info-item";
import { Calendar, User, Package } from "lucide-react";

<InfoGrid columns={2}>
  <InfoItem
    label="Customer"
    value={order.customer.name}
    icon={User}
  />
  <InfoItem
    label="Created Date"
    value={formatDate(order.createdAt)}
    icon={Calendar}
  />
  <InfoItem
    label="Quantity"
    value={`${order.quantity} units`}
    icon={Package}
  />
</InfoGrid>

// Horizontal layout
<InfoItem
  label="Status"
  value={<StatusBadge status={order.status} />}
  orientation="horizontal"
/>
```

**Props (InfoItem):**
- `label`: string - Label
- `value`: ReactNode - Değer (string, number, component)
- `icon?`: LucideIcon
- `orientation?`: "vertical" | "horizontal"

**Props (InfoGrid):**
- `columns?`: 1 | 2 | 3 | 4 - Grid column sayısı
- `children`: ReactNode

---

### 9️⃣ SectionHeader Component ⭐⭐⭐⭐

**Dosya:** `client/src/components/ui/section-header.tsx`

**Amaç:** Bölüm başlıkları

**Kullanım:**
```typescript
import { SectionHeader } from "@/components/ui/section-header";
import { FileText, Plus } from "lucide-react";

<SectionHeader
  title="Order Details"
  description="View and manage order information"
  icon={FileText}
  actions={
    <Button size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Add Note
    </Button>
  }
/>
```

---

### 🔟 ActionButtons Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/Common/ActionButtons.tsx`

**Amaç:** Action button yönetimi (row actions)

**Kullanım:**
```typescript
import { ActionButtons } from "@/components/Common/ActionButtons";
import { Eye, Edit, Trash2 } from "lucide-react";

const actions = [
  {
    label: "View",
    icon: Eye,
    onClick: () => router.push(`/samples/${sample.id}`),
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: () => setEditModal(true),
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: () => handleDelete(),
    variant: "destructive" as const,
  },
];

// Dropdown mode (3+ actions)
<ActionButtons actions={actions} title="Actions" />

// Button mode (< 3 actions)
<ActionButtons actions={actions.slice(0, 2)} />

// Always compact
<ActionButtons actions={actions} compact />
```

**Props:**
- `actions`: ActionButton[] - Action listesi
- `title?`: string - Dropdown başlığı
- `compact?`: boolean - Her zaman dropdown göster

**ActionButton Interface:**
```typescript
interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | ...;
  disabled?: boolean;
  loading?: boolean;
}
```

---

### 1️⃣1️⃣ ConfirmDialog Component ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/Common/ConfirmDialog.tsx`

**Amaç:** Onay diyalogları

**Kullanım:**
```typescript
import { ConfirmDialog } from "@/components/Common/ConfirmDialog";
import { Trash2 } from "lucide-react";

const [showDelete, setShowDelete] = useState(false);

<ConfirmDialog
  open={showDelete}
  onOpenChange={setShowDelete}
  title="Delete Sample?"
  description="This action cannot be undone. Are you sure you want to delete this sample?"
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  icon={Trash2}
  onConfirm={handleDelete}
  loading={deleteLoading}
/>
```

**Props:**
- `open`: boolean - Dialog açık mı
- `onOpenChange`: (open: boolean) => void
- `title`: string - Başlık
- `description`: string - Açıklama
- `confirmText?`: string - Onay buton metni
- `cancelText?`: string - İptal buton metni
- `variant?`: "default" | "destructive"
- `icon?`: LucideIcon
- `onConfirm`: () => void - Onay callback
- `loading?`: boolean

---

## 📊 Kullanım Karşılaştırması

### Sample List Page - Önce & Sonra

**Önceki Kod (samples/page.tsx):**
```tsx
// ❌ 100+ satır tekrar eden kod
const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    // ... 20+ case
  }
};

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">Samples</h1>
      <Button onClick={() => setShowModal(true)}>
        <Plus className="mr-2" />
        New Sample
      </Button>
    </div>

    <Card className="p-4 mb-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
          <Input className="pl-9" value={search} onChange={...} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          {/* ... */}
        </Select>
      </div>
    </Card>

    {samples.length === 0 && (
      <div className="flex flex-col items-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mb-4" />
        <p>No samples found</p>
        <Button className="mt-4" onClick={() => setShowModal(true)}>
          Create Sample
        </Button>
      </div>
    )}

    <SimpleDataTable
      data={samples}
      columns={columns.map(col => ({
        ...col,
        render: (sample) => {
          if (col.key === 'status') {
            return getStatusBadge(sample.status);
          }
          // ... more logic
        }
      }))}
    />
  </div>
);
```

**Yeni Kod (samples/page.tsx):**
```tsx
// ✅ 50 satır, reusable components
import {
  PageHeader,
  FilterBar,
  SearchInput,
  StatusBadge,
  EmptyState,
  ActionButtons,
} from "@/components";

return (
  <div>
    <PageHeader
      title="Samples"
      description="Manage your sample requests"
      icon={Package}
      actions={
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Sample
        </Button>
      }
    />

    <FilterBar>
      <SearchInput value={search} onChange={setSearch} className="flex-1 md:w-64" />
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        {/* ... */}
      </Select>
    </FilterBar>

    {samples.length === 0 ? (
      <EmptyState
        icon={Package}
        title="No samples found"
        description="Get started by creating your first sample"
        action={{
          label: "Create Sample",
          onClick: () => setShowModal(true),
          icon: Plus
        }}
      />
    ) : (
      <SimpleDataTable
        data={samples}
        columns={[
          {
            id: 'status',
            header: 'Status',
            cell: (sample) => <StatusBadge status={sample.status} />
          },
          {
            id: 'actions',
            header: 'Actions',
            cell: (sample) => (
              <ActionButtons
                actions={[
                  { label: "View", icon: Eye, onClick: () => router.push(`/samples/${sample.id}`) },
                  { label: "Delete", icon: Trash2, onClick: () => handleDelete(sample.id), variant: "destructive" },
                ]}
                compact
              />
            )
          }
        ]}
      />
    )}
  </div>
);
```

**Kazanç:**
- ✅ %50 daha az kod
- ✅ Daha okunabilir
- ✅ Consistent UI
- ✅ Kolay bakım

---

## 🎯 Migration Guide

### Adım 1: Imports Güncelle

```typescript
// Önce
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

// Sonra
import { StatusBadge } from "@/components/ui/status-badge";
import { FilterBar } from "@/components/ui/filter-bar";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
```

### Adım 2: Status Badge'leri Değiştir

```typescript
// Önce
{sample.status === "PENDING" && <Badge variant="secondary">Pending</Badge>}
{sample.status === "APPROVED" && <Badge variant="default">Approved</Badge>}

// Sonra
<StatusBadge status={sample.status} />
```

### Adım 3: Search Input'u Değiştir

```typescript
// Önce
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2" />
  <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
</div>

// Sonra
<SearchInput value={search} onChange={setSearch} />
```

### Adım 4: Empty State'leri Değiştir

```typescript
// Önce
{items.length === 0 && (
  <div className="flex flex-col items-center py-12">
    <p>No data found</p>
  </div>
)}

// Sonra
{items.length === 0 && <EmptyState title="No data found" />}
```

### Adım 5: Action Buttons Ekle

```typescript
// Önce
<div className="flex gap-2">
  <Button size="sm" variant="outline" onClick={() => handleView(item)}>
    <Eye className="mr-2 h-4 w-4" />
    View
  </Button>
  <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>
    <Trash2 className="mr-2 h-4 w-4" />
    Delete
  </Button>
</div>

// Sonra
<ActionButtons
  actions={[
    { label: "View", icon: Eye, onClick: () => handleView(item) },
    { label: "Delete", icon: Trash2, onClick: () => handleDelete(item), variant: "destructive" },
  ]}
/>
```

---

## 📋 Component Index

| Component | Dosya | Kullanım | Reusability |
|-----------|-------|----------|-------------|
| EmptyState | ui/empty-state.tsx | Boş durumlar | ⭐⭐⭐⭐⭐ |
| StatsCard | ui/stats-card.tsx | Dashboard stats | ⭐⭐⭐⭐⭐ |
| StatusBadge | ui/status-badge.tsx | Status gösterimleri | ⭐⭐⭐⭐⭐ |
| PageHeader | ui/page-header.tsx | Sayfa başlıkları | ⭐⭐⭐⭐⭐ |
| SearchInput | ui/search-input.tsx | Arama | ⭐⭐⭐⭐⭐ |
| FilterBar | ui/filter-bar.tsx | Filter container | ⭐⭐⭐⭐ |
| LoadingSpinner | ui/loading-spinner.tsx | Loading states | ⭐⭐⭐⭐⭐ |
| InfoItem | ui/info-item.tsx | Bilgi gösterimi | ⭐⭐⭐⭐⭐ |
| InfoGrid | ui/info-item.tsx | Info grid layout | ⭐⭐⭐⭐⭐ |
| SectionHeader | ui/section-header.tsx | Bölüm başlıkları | ⭐⭐⭐⭐ |
| ActionButtons | Common/ActionButtons.tsx | Row actions | ⭐⭐⭐⭐⭐ |
| ConfirmDialog | Common/ConfirmDialog.tsx | Onay diyalogları | ⭐⭐⭐⭐⭐ |

**Toplam:** 12 yeni reusable component

---

## 🏆 Faydalar

### Kod Azaltma
```
Samples Page: 850 satır → 400 satır (%53 azalma)
Orders Page: 920 satır → 450 satır (%51 azalma)
Collections Page: Tahmini %50 azalma
```

### Tutarlılık
- ✅ Aynı Empty State tasarımı
- ✅ Aynı Status Badge renkleri
- ✅ Aynı Search Input davranışı
- ✅ Aynı Loading states

### Bakım Kolaylığı
- ✅ Tek yerden güncelleme
- ✅ Type-safe props
- ✅ Consistent API
- ✅ Kolay test

### Developer Experience
- ✅ Autocomplete
- ✅ TypeScript types
- ✅ Clear props
- ✅ Reusable patterns

---

## 🎯 Sonraki Adımlar

### Öncelik 1: Migration
1. ✅ Samples page'i güncelle
2. ✅ Orders page'i güncelle
3. ⏳ Collections page'i güncelle
4. ⏳ Dashboard page'i güncelle

### Öncelik 2: Yeni Components
1. ⏳ DataCard - Product card'lar için
2. ⏳ TimelineItem - Production timeline için
3. ⏳ FileUploadZone - File upload için
4. ⏳ ColorPicker - Renk seçimi için

### Öncelik 3: Dokumentasyon
1. ⏳ Storybook oluştur
2. ⏳ Component examples
3. ⏳ Best practices guide

---

**Hazırlayan:** AI Development Team
**Tarih:** 18 Ekim 2025
**Versiyon:** 2.0.0
**Durum:** ✅ 12 Component Hazır
