# 🎯 Common Components - Usage Examples

## 📦 Yeni Eklenen Bileşenler

### 1. **PageHeader** - Sayfa Başlığı

Tüm sayfa başlıklarını standart hale getirir.

```tsx
import { PageHeader } from "@/components/common";

<PageHeader
  title="User Management"
  description="View and manage all users"
  icon={<Users className="w-8 h-8" />}
  action={
    <Button onClick={handleCreate}>
      <Plus className="w-4 h-4" />
      New User
    </Button>
  }
/>;
```

**Props:**

- `title`: string (required) - Ana başlık
- `description`: string (optional) - Alt açıklama
- `icon`: ReactNode (optional) - Sol taraftaki ikon
- `action`: ReactNode (optional) - Sağ taraftaki action button(lar)
- `className`: string (optional) - Özel stil

---

### 2. **StatsCard & StatsGrid** - İstatistik Kartları

Dashboard ve liste sayfalarındaki metrik kartları için.

#### Tek Kart:

```tsx
import { StatsCard } from "@/components/common";

<StatsCard
  title="Total Users"
  value={245}
  description="Active users"
  icon={<Users className="h-4 w-4 text-muted-foreground" />}
  valueColor="text-green-600"
  compact={true}
/>;
```

#### Grid (Çoklu Kartlar):

```tsx
import { StatsGrid } from "@/components/common";

<StatsGrid
  stats={[
    {
      title: "Total Users",
      value: stats.total,
      description: "All system users",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Active",
      value: stats.active,
      description: "Active users",
      icon: <UserCheck className="h-4 w-4" />,
      valueColor: "text-green-600",
    },
    {
      title: "Pending",
      value: stats.pending,
      description: "Awaiting approval",
      icon: <Clock className="h-4 w-4" />,
      valueColor: "text-yellow-600",
    },
  ]}
  columns="md:grid-cols-2 lg:grid-cols-3"
/>;
```

**StatsCard Props:**

- `title`: string (required) - Kart başlığı
- `value`: string | number (required) - Ana değer
- `description`: string (optional) - Alt açıklama
- `icon`: ReactNode (optional) - Başlık yanında ikon
- `valueColor`: string (optional) - Değer rengi (örn: "text-green-600")
- `compact`: boolean (optional, default: false) - Kompakt layout
- `className`: string (optional)

**StatsGrid Props:**

- `stats`: StatsCardProps[] (required) - Kart dizisi
- `columns`: string (optional, default: "md:grid-cols-2 lg:grid-cols-4") - Grid yapısı
- `compact`: boolean (optional, default: true) - Tüm kartları kompakt yap
- `className`: string (optional)

---

### 3. **FilterBar** - Filtre ve Arama Çubuğu

Liste sayfalarındaki arama ve filtre işlemleri için.

```tsx
import { FilterBar } from "@/components/common";

<FilterBar
  title="Filters"
  description="Filter and search users"
  search={{
    placeholder: "Search by name or email...",
    value: searchTerm,
    onChange: setSearchTerm,
  }}
  filters={[
    {
      placeholder: "Role",
      value: roleFilter,
      options: [
        { label: "All Roles", value: "all" },
        { label: "Admin", value: "ADMIN" },
        { label: "User", value: "USER" },
      ],
      onChange: setRoleFilter,
    },
    {
      placeholder: "Status",
      value: statusFilter,
      options: [
        { label: "All Status", value: "all" },
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      onChange: setStatusFilter,
    },
  ]}
  actions={
    <Button variant="outline">
      <Download className="w-4 h-4 mr-2" />
      Export
    </Button>
  }
  columns="md:grid-cols-3"
/>;
```

**FilterBar Props:**

- `title`: string (optional) - Başlık
- `description`: string (optional) - Açıklama
- `search`: SearchInputProps (optional) - Arama input'u
  - `placeholder`: string
  - `value`: string
  - `onChange`: (value: string) => void
- `filters`: FilterSelectProps[] (optional) - Filtre select'leri
  - `placeholder`: string
  - `value`: string
  - `options`: { label: string; value: string }[]
  - `onChange`: (value: string) => void
  - `label`: string (optional)
- `actions`: ReactNode (optional) - Ek action butonları
- `columns`: string (optional, default: "md:grid-cols-3") - Grid yapısı
- `wrapped`: boolean (optional, default: true) - Card içinde göster
- `className`: string (optional)

#### Standalone Bileşenler:

FilterBar içindeki bileşenler ayrı ayrı da kullanılabilir:

```tsx
import { SearchInput, FilterSelect } from "@/components/common";

// Sadece arama
<SearchInput
  placeholder="Search..."
  value={searchTerm}
  onChange={setSearchTerm}
/>

// Sadece filtre
<FilterSelect
  label="Category"
  placeholder="Select category"
  value={categoryFilter}
  options={categories}
  onChange={setCategoryFilter}
/>
```

---

## 📊 Gerçek Kullanım Örnekleri

### Admin Users Sayfası

**Önce (150+ satır):**

```tsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold flex items-center gap-2">
      <Users className="w-8 h-8" />
      Kullanıcı Yönetimi
    </h1>
    <p className="text-muted-foreground mt-1">
      Tüm kullanıcıları görüntüleyin ve yönetin
    </p>
  </div>
  <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
    <Plus className="w-4 h-4" />
    Yeni Kullanıcı
  </Button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
      <Users className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.total}</div>
      <p className="text-xs text-muted-foreground mt-1">
        Tüm sistemdeki kullanıcılar
      </p>
    </CardContent>
  </Card>
  {/* 3 more cards... */}
</div>

<Card>
  <CardHeader>
    <CardTitle>Filtreler</CardTitle>
    <CardDescription>Kullanıcıları filtreleyin ve arayın</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="İsim veya email ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        {/* ... */}
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        {/* ... */}
      </Select>
    </div>
  </CardContent>
</Card>
```

**Sonra (30 satır - %80 azalma):**

```tsx
<PageHeader
  title="Kullanıcı Yönetimi"
  description="Tüm kullanıcıları görüntüleyin ve yönetin"
  icon={<Users className="w-8 h-8" />}
  action={
    <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
      <Plus className="w-4 h-4" />
      Yeni Kullanıcı
    </Button>
  }
/>

<StatsGrid
  stats={[
    {
      title: "Toplam Kullanıcı",
      value: stats.total,
      description: "Tüm sistemdeki kullanıcılar",
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Aktif",
      value: stats.active,
      icon: <UserCheck className="h-4 w-4" />,
      valueColor: "text-green-600",
    },
    // ...
  ]}
/>

<FilterBar
  title="Filtreler"
  description="Kullanıcıları filtreleyin ve arayın"
  search={{
    placeholder: "İsim veya email ara...",
    value: searchTerm,
    onChange: setSearchTerm,
  }}
  filters={[
    {
      placeholder: "Rol filtrele",
      value: roleFilter,
      options: roleOptions,
      onChange: setRoleFilter,
    },
    {
      placeholder: "Durum filtrele",
      value: statusFilter,
      options: statusOptions,
      onChange: setStatusFilter,
    },
  ]}
/>
```

---

### Dashboard Ana Sayfa

**Önce:**

```tsx
<div className="flex items-center justify-between space-y-2">
  <div>
    <h2 className="text-3xl font-bold tracking-tight">
      Welcome back, {session?.user?.name || "User"}! 👋
    </h2>
    {departmentLabel && (
      <p className="text-muted-foreground mt-2">
        {departmentLabel} Department
      </p>
    )}
  </div>
</div>

<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard title="Active Orders" value="24" icon={...} description="..." />
  <StatsCard title="Samples" value="18" icon={...} description="..." />
  <StatsCard title="Production" value="12" icon={...} description="..." />
  <StatsCard title="Quality Rate" value="94%" icon={...} description="..." />
</div>
```

**Sonra:**

```tsx
<PageHeader
  title={`Welcome back, ${session?.user?.name || "User"}! 👋`}
  description={departmentLabel ? `${departmentLabel} Department` : undefined}
/>

<StatsGrid
  stats={[
    { title: "Active Orders", value: "24", icon: <ShoppingCart />, description: "+12% from last month" },
    { title: "Samples", value: "18", icon: <Package />, description: "+5 new this week" },
    { title: "Production", value: "12", icon: <Factory />, description: "3 in final stage" },
    { title: "Quality Rate", value: "94%", icon: <TrendingUp />, description: "+2% from last month" },
  ]}
/>
```

---

## ✅ Refactor Edilmiş Sayfalar

1. ✅ `/dashboard/admin/users/page.tsx` - Admin kullanıcı yönetimi
2. ✅ `/dashboard/library/seasons/page.tsx` - Seasons library
3. ✅ `/dashboard/page.tsx` - Ana dashboard sayfası

---

## 🎯 Refactor Edilecek Sayfalar

### Öncelikli:

1. `/dashboard/library/fabrics/page.tsx`
2. `/dashboard/library/colors/page.tsx`
3. `/dashboard/library/size-groups/page.tsx`
4. `/dashboard/library/fits/page.tsx`
5. `/dashboard/library/certifications/page.tsx`
6. `/dashboard/library/accessories/page.tsx`
7. `/dashboard/samples/page.tsx`
8. `/dashboard/collections/page.tsx`
9. `/dashboard/orders/page.tsx`

### Her biri için:

- `PageHeader` ile başlık standartlaştır
- İstatistik kartları varsa `StatsGrid` kullan
- Filtre/arama bölümleri `FilterBar` ile değiştir

---

## 📈 İstatistikler

- **%80 kod azaltma** header + stats + filters bölümlerinde
- **3 yeni ortak bileşen** (PageHeader, StatsCard/Grid, FilterBar)
- **3 sayfa refactor edildi** (daha fazlası yolda)
- **Type-safe** tüm bileşenler TypeScript ile
- **Responsive** mobil uyumlu grid yapıları

---

## 🚀 Hızlı Başlangıç

Yeni bir liste sayfası oluştururken:

```tsx
import {
  PageHeader,
  StatsGrid,
  FilterBar,
  DataCard,
  EmptyState,
} from "@/components/common";

export default function MyListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <PageHeader
        title="My Items"
        description="Manage all items"
        icon={<Package />}
        action={<Button onClick={handleCreate}>New Item</Button>}
      />

      <StatsGrid
        stats={[
          { title: "Total", value: items.length, icon: <Package /> },
          {
            title: "Active",
            value: activeCount,
            icon: <Check />,
            valueColor: "text-green-600",
          },
        ]}
      />

      <FilterBar
        search={{
          placeholder: "Search items...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={[
          {
            placeholder: "Category",
            value: categoryFilter,
            options: categories,
            onChange: setCategoryFilter,
          },
        ]}
      />

      <DataCard title="Items" icon={<Package />} isLoading={fetching}>
        {items.length === 0 ? (
          <EmptyState title="No items" action={<Button>Create</Button>} />
        ) : (
          <ItemList items={items} />
        )}
      </DataCard>
    </div>
  );
}
```

**Sonuç:** Tam özellikli bir liste sayfası, 50 satırdan az kodla! 🎉
