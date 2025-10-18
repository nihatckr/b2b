# 🔧 Reusable Kod Envanteri

**Tarih:** 18 Ekim 2025
**Proje:** Tekstil Üretim Yönetim Sistemi

---

## 📚 İçindekiler

1. [Backend Utils](#-backend-utils-serverutils)
2. [Frontend Hooks](#-frontend-hooks-clienthooks)
3. [Frontend Utils](#-frontend-utils-clientlib)
4. [UI Components](#-ui-components-clientcomponentsui)
5. [Custom Components](#-custom-components)
6. [Kullanım Örnekleri](#-kullanım-örnekleri)

---

## 🔧 Backend Utils (server/utils)

### 1️⃣ DynamicTaskHelper ⭐⭐⭐⭐⭐

**Dosya:** `server/src/utils/dynamicTaskHelper.ts` (700+ satır)

**Amaç:** Status bazlı otomatik görev yönetimi

**Özellikler:**
- ✅ Sample status değişikliklerinde otomatik task oluşturma (28 status)
- ✅ Order status değişikliklerinde otomatik task oluşturma (15 status)
- ✅ Production stage bazlı task oluşturma (7 stage)
- ✅ Dual task creation (customer + manufacturer)
- ✅ Auto-completion of old tasks
- ✅ Deadline tracking
- ✅ Priority management
- ✅ Rich metadata (JSON actionData)

**Kullanım:**
```typescript
import { DynamicTaskHelper } from "../utils/dynamicTaskHelper";

// Sample status değiştiğinde
const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
await dynamicTaskHelper.createTasksForSampleStatus(
  sample.id,
  'QUOTE_SENT',  // Yeni status
  sample.customerId,
  sample.manufactureId,
  sample.collectionId
);

// Order status değiştiğinde
await dynamicTaskHelper.createTasksForOrderStatus(
  order.id,
  order.status,
  order.customerId,
  order.manufactureId
);

// Production stage başladığında
await dynamicTaskHelper.createTaskForProductionStage(
  production.id,
  'FABRIC',  // Stage
  order.customerId,
  order.manufactureId
);
```

**Reusability:** ⭐⭐⭐⭐⭐ (Herhangi bir status-based workflow için kullanılabilir)

---

### 2️⃣ NotificationHelper ⭐⭐⭐⭐⭐

**Dosya:** `server/src/utils/notificationHelper.ts` (300+ satır)

**Amaç:** Bildirim oluşturma ve yönetimi

**Fonksiyonlar:**
- `createNotification()` - Tek bildirim oluşturma
- `checkProductionDeadlines()` - Yaklaşan deadline'ları kontrol et
- `checkOverdueProduction()` - Geciken üretimleri kontrol et

**Kullanım:**
```typescript
import { createNotification } from "../utils/notificationHelper";

// Basit bildirim
await createNotification(prisma, {
  type: "ORDER",
  title: "🎉 New Order Received",
  message: `Order #${orderNumber} received for ${quantity} units.`,
  userId: manufacturerId,
  link: `/dashboard/orders/${order.id}`,
  orderId: order.id,
});

// Production deadline kontrolü (cron job'dan çağrılabilir)
await checkProductionDeadlines(prisma);
await checkOverdueProduction(prisma);
```

**Reusability:** ⭐⭐⭐⭐⭐ (Herhangi bir bildirim ihtiyacı için)

---

### 3️⃣ Permissions System ⭐⭐⭐⭐⭐

**Dosya:** `server/src/utils/permissions.ts` (230+ satır)

**Amaç:** Granular yetki kontrolü

**Fonksiyonlar:**
- `getUserPermissions()` - Kullanıcı yetkilerini al
- `hasPermission()` - Belirli yetki kontrolü
- `requirePermission()` - Yetki zorunluluğu (throw error)
- `isCompanyOwner()` - Şirket sahibi kontrolü
- `canManageCompany()` - Şirket yönetim yetkisi
- `isManufacturer()` - Üretici kontrolü (company type)
- `isBuyer()` - Alıcı kontrolü (company type)

**Kullanım:**
```typescript
import {
  requirePermission,
  hasPermission,
  isManufacturer,
  isBuyer
} from "../utils/permissions";

// Yetki kontrolü (throw error)
requirePermission(user, "collections", "create");

// Boolean dönen kontrol
if (hasPermission(user, "samples", "approve")) {
  // Approve işlemi
}

// Company type kontrolü
if (isManufacturer(user)) {
  // Üretici işlemleri
}

if (isBuyer(user)) {
  // Alıcı işlemleri
}
```

**Permission Yapısı:**
```typescript
interface UserPermissions {
  collections?: { create, edit, delete, view }
  categories?: { create, edit, delete, view }
  samples?: { create, updateStatus, respond, view, approve }
  orders?: { create, sendQuote, updateStatus, confirm, view }
  production?: { updateStages, assignWorkshop, view, requestRevision }
  quality?: { view, comment, perform }
  messages?: { send, view }
  management?: { inviteUsers, manageUsers, viewReports }
}
```

**Reusability:** ⭐⭐⭐⭐⭐ (Herhangi bir yetki bazlı sistem için)

---

### 4️⃣ User Role Helper ⭐⭐⭐⭐

**Dosya:** `server/src/utils/user-role-helper.ts`

**Amaç:** Kullanıcı rolü yönetimi ve auth kontrolü

**Fonksiyonlar:**
- `requireAuth()` - JWT token kontrolü (throw error)
- `getUserRole()` - Kullanıcı rolünü al
- `isAdmin()` - Admin kontrolü
- `isManufacturer()` - Üretici kontrolü (role)
- `isCustomer()` - Müşteri kontrolü

**Kullanım:**
```typescript
import { requireAuth, getUserRole, isAdmin } from "../utils/user-role-helper";

// Resolver'da
const userId = requireAuth(context);  // Throw error if not authenticated

const user = await prisma.user.findUnique({ where: { id: userId }});
const role = getUserRole(user);

if (isAdmin(user)) {
  // Admin işlemleri
}
```

**Reusability:** ⭐⭐⭐⭐ (Auth gerektiren her sistemde)

---

### 5️⃣ TaskHelper (Legacy - Deprecating) ⚠️

**Dosya:** `server/src/utils/taskHelper.ts` (650+ satır)

**Durum:** DEPRECATING - DynamicTaskHelper'a geçilmeli

**Not:** Hala orderResolver.ts'de kullanılıyor ama yeni kodlarda DynamicTaskHelper tercih edilmeli.

---

### 6️⃣ AI Integration Utils ⭐⭐⭐

**ComfyUI Integration:**
- **Dosya:** `server/src/utils/comfyui.ts`
- **Amaç:** AI görsel oluşturma workflow'u
- **Kullanım:** Sample design otomasyonu

**Ollama Vision:**
- **Dosya:** `server/src/utils/ollamaVision.ts`
- **Amaç:** Görsel analiz ve AI feedback
- **Kullanım:** Sample inceleme otomasyonu

---

### 7️⃣ Production Scheduler ⭐⭐⭐

**Dosya:** `server/src/utils/productionScheduler.ts`

**Amaç:** Üretim süreç takibi ve zamanlama

**Kullanım:** Production stage geçişlerinde deadline hesaplama

---

## 🎣 Frontend Hooks (client/hooks)

### 1️⃣ usePermissions ⭐⭐⭐⭐⭐

**Dosya:** `client/src/hooks/usePermissions.ts` (280+ satır)

**Amaç:** Frontend yetki kontrolü

**Dönen Değerler:**
```typescript
{
  permissions: UserPermissions
  hasPermission: (resource, action) => boolean
  isCompanyOwner: boolean
  canManageCompany: (companyId?) => boolean
  companyType: string | null
  isManufacturer: boolean
  isBuyer: boolean
}
```

**Kullanım:**
```typescript
import { usePermissions } from "@/hooks/usePermissions";

function CollectionPage() {
  const { hasPermission, isManufacturer } = usePermissions();

  const canCreate = hasPermission("collections", "create");

  return (
    <>
      {canCreate && <CreateButton />}
      {isManufacturer && <ManufacturerPanel />}
    </>
  );
}
```

**Özel Hook'lar:**
```typescript
// Koleksiyon yetkileri
const { canCreate, canEdit, canDelete, canView } = useCanManageCollections();

// Sample yetkileri
const { canCreate, canUpdateStatus, canRespond, canApprove, canView }
  = useCanManageSamples();

// Order yetkileri
const { canCreate, canSendQuote, canUpdateStatus, canConfirm, canView }
  = useCanManageOrders();

// Company yönetimi
const { canInviteUsers, canManageUsers, canViewReports, isOwner }
  = useCanManageCompany();
```

**Reusability:** ⭐⭐⭐⭐⭐ (Her sayfada kullanılabilir)

---

### 2️⃣ use-toast ⭐⭐⭐⭐⭐

**Dosya:** `client/src/hooks/use-toast.ts`

**Amaç:** Toast notification yönetimi (shadcn/ui)

**Kullanım:**
```typescript
import { useToast } from "@/hooks/use-toast";

function MyComponent() {
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "✅ Başarılı",
      description: "İşlem tamamlandı",
      variant: "default",
    });
  };

  const handleError = () => {
    toast({
      title: "❌ Hata",
      description: "Bir sorun oluştu",
      variant: "destructive",
    });
  };

  return <Button onClick={handleSuccess}>Kaydet</Button>;
}
```

**Reusability:** ⭐⭐⭐⭐⭐

---

### 3️⃣ use-mobile ⭐⭐⭐⭐

**Dosya:** `client/src/hooks/use-mobile.ts`

**Amaç:** Responsive design için mobil cihaz tespiti

**Kullanım:**
```typescript
import { useMobile } from "@/hooks/use-mobile";

function ResponsiveComponent() {
  const isMobile = useMobile();

  return (
    <>
      {isMobile ? <MobileView /> : <DesktopView />}
    </>
  );
}
```

**Reusability:** ⭐⭐⭐⭐

---

## 🛠️ Frontend Utils (client/lib)

### 1️⃣ cn() - Tailwind Class Merger ⭐⭐⭐⭐⭐

**Dosya:** `client/src/lib/utils.ts`

**Amaç:** Tailwind class'larını merge etme

**Kullanım:**
```typescript
import { cn } from "@/lib/utils";

// Conditional classes
<div className={cn(
  "px-4 py-2 rounded",
  isActive && "bg-blue-500 text-white",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />

// Variant-based styling
<Button className={cn(
  "base-styles",
  variant === "primary" && "bg-blue-500",
  variant === "secondary" && "bg-gray-500"
)} />
```

**Reusability:** ⭐⭐⭐⭐⭐ (Tüm component'lerde kullanılır)

---

### 2️⃣ GraphQL Client Setup ⭐⭐⭐⭐

**Dosya:** `client/src/lib/graphql/client.ts`

**Amaç:** URQL GraphQL client yapılandırması

**Kullanım:** Context provider ile tüm app'te kullanılır

---

## 🎨 UI Components (client/components/ui)

### Shadcn/ui Components (37 adet) ⭐⭐⭐⭐⭐

**Dizin:** `client/src/components/ui/`

**Tüm Component'ler:**
```
accordion        drawer          radio-group     switch
alert-dialog     dropdown-menu   scroll-area     table
alert            field           select          tabs
avatar           form            separator       textarea
badge            image-upload    sheet           toast
button           input           sidebar         toaster
card             label           skeleton        toggle-group
chart            navigation-menu sonner          toggle
checkbox         popover         switch          tooltip
dialog           progress
```

**Kullanım Örneği:**
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";

<Card>
  <CardHeader>
    <Badge variant="success">Active</Badge>
  </CardHeader>
  <CardContent>
    <Button>Click Me</Button>
  </CardContent>
</Card>
```

**Reusability:** ⭐⭐⭐⭐⭐ (Tüm projede kullanılır)

---

## 🔥 Custom Components

### 1️⃣ SimpleDataTable ⭐⭐⭐⭐⭐

**Dosya:** `client/src/components/DataTable/SimpleDataTable.tsx`

**Amaç:** Generic, sortable, type-safe data table

**Özellikler:**
- ✅ TypeScript generic support
- ✅ Sortable columns (date, number, string)
- ✅ Flexible column definitions
- ✅ Custom cell renderers
- ✅ Performance optimized (useMemo)

**Kullanım:**
```typescript
import { SimpleDataTable } from "@/components/DataTable";

interface Sample {
  id: number;
  name: string;
  status: string;
  createdAt: string;
}

const columns = [
  {
    key: 'name',
    label: 'Sample Name',
    sortable: true,
    render: (sample: Sample) => (
      <span className="font-semibold">{sample.name}</span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    render: (sample: Sample) => (
      <Badge variant={getStatusVariant(sample.status)}>
        {sample.status}
      </Badge>
    )
  },
  {
    key: 'createdAt',
    label: 'Date',
    sortable: true,
    sortType: 'date'
  }
];

<SimpleDataTable<Sample>
  data={samples}
  columns={columns}
  getRowKey={(sample) => sample.id}
  defaultSortField="createdAt"
  defaultSortDirection="desc"
/>
```

**Reusability:** ⭐⭐⭐⭐⭐ (Herhangi bir data table için)

---

### 2️⃣ DataTable (Complex) ⭐⭐⭐⭐

**Dosya:** `client/src/components/DataTable/DataTable.tsx`

**Amaç:** Drag-and-drop destekli complex table

**Özellikler:**
- ✅ Drag & drop row reordering
- ✅ Complex interactions
- ✅ Advanced sorting

**Kullanım:** Collection item reordering gibi advanced senaryolar için

---

## 📋 Kullanım Örnekleri

### Backend: Yeni Feature Eklerken

**Senaryo:** Yeni bir entity type için task sistemi eklemek

```typescript
// 1. DynamicTaskHelper'ı genişlet
// server/src/utils/dynamicTaskHelper.ts içinde

const INVOICE_STATUS_TASK_MAP: Record<string, TaskConfig> = {
  PENDING: {
    customerTask: {
      title: '📄 Fatura Onayı Bekleniyor',
      description: 'Faturanızı incelemelisiniz',
      type: 'APPROVE_REJECT',
      priority: 'HIGH',
      dueDays: 3,
    },
    // ... manufacturer task
  },
  // ... diğer statusler
};

// 2. Yeni method ekle
async createTasksForInvoiceStatus(
  invoiceId: number,
  status: string,
  customerId: number,
  manufacturerId: number
) {
  // DynamicTaskHelper pattern'ini kullan
}

// 3. Resolver'da kullan
const dynamicTaskHelper = new DynamicTaskHelper(context.prisma);
await dynamicTaskHelper.createTasksForInvoiceStatus(
  invoice.id,
  invoice.status,
  invoice.customerId,
  invoice.manufacturerId
);
```

**Avantajlar:**
- ✅ 80+ satır kod yerine 6 satır
- ✅ Merkezi yönetim
- ✅ Kolay bakım
- ✅ Tutarlı task creation

---

### Frontend: Yeni Sayfa Eklerken

**Senaryo:** Yeni bir yönetim sayfası

```typescript
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { SimpleDataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

function InvoicePage() {
  // 1. Permission kontrolü
  const { hasPermission } = usePermissions();
  const canCreate = hasPermission("invoices", "create");

  // 2. Toast notifications
  const { toast } = useToast();

  // 3. Data table columns
  const columns = [
    { key: 'number', label: 'Invoice #', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, sortType: 'number' },
    { key: 'status', label: 'Status', render: (invoice) => (
      <Badge>{invoice.status}</Badge>
    )}
  ];

  // 4. CRUD operations
  const handleCreate = async () => {
    try {
      await createInvoice();
      toast({
        title: "✅ Success",
        description: "Invoice created"
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <h1>Invoices</h1>
        {canCreate && <Button onClick={handleCreate}>Create</Button>}
      </CardHeader>
      <CardContent>
        <SimpleDataTable
          data={invoices}
          columns={columns}
          getRowKey={(inv) => inv.id}
        />
      </CardContent>
    </Card>
  );
}
```

**Kullanılan Reusable Kodlar:**
- ✅ usePermissions hook
- ✅ useToast hook
- ✅ SimpleDataTable component
- ✅ shadcn/ui components (Button, Card, Badge)

---

## 🎯 Öneriler

### Yeni Reusable Kod Eklerken

**1. Utility Functions:**
- `server/src/utils/` veya `client/src/lib/` dizinlerine ekle
- Export et ve dökümanla

**2. Custom Hooks:**
- `client/src/hooks/` dizinine ekle
- `use` prefix kullan
- TypeScript generic type'ları destekle

**3. Components:**
- Basit UI: `client/src/components/ui/`
- Complex Business Logic: `client/src/components/[Feature]/`
- Generic props interface kullan

**4. Best Practices:**
```typescript
// ✅ İyi
export function useGenericHook<T>(data: T[]) {
  // Generic, reusable
}

// ❌ Kötü
export function useSampleHook(samples: Sample[]) {
  // Sadece Sample için çalışır
}
```

---

## 📊 Reusability Skorları

### Backend Utils
| Utility | Satır | Reusability | Kullanım |
|---------|-------|-------------|----------|
| DynamicTaskHelper | 700+ | ⭐⭐⭐⭐⭐ | Aktif |
| NotificationHelper | 300+ | ⭐⭐⭐⭐⭐ | Aktif |
| Permissions | 230+ | ⭐⭐⭐⭐⭐ | Aktif |
| User Role Helper | 150+ | ⭐⭐⭐⭐ | Aktif |
| TaskHelper | 650+ | ⚠️ Deprecating | Legacy |

### Frontend Hooks
| Hook | Reusability | Kullanım Alanı |
|------|-------------|----------------|
| usePermissions | ⭐⭐⭐⭐⭐ | Tüm sayfalar |
| useToast | ⭐⭐⭐⭐⭐ | Tüm sayfalar |
| useMobile | ⭐⭐⭐⭐ | Responsive pages |

### Components
| Component | Reusability | Kullanım |
|-----------|-------------|----------|
| SimpleDataTable | ⭐⭐⭐⭐⭐ | 10+ sayfa |
| shadcn/ui (37 adet) | ⭐⭐⭐⭐⭐ | Tüm UI |
| DataTable (Complex) | ⭐⭐⭐⭐ | 3+ sayfa |

---

## 🏆 Özet

### En Çok Kullanılan Reusable Kodlar

**Backend (Top 5):**
1. ✅ DynamicTaskHelper - 700+ satır, status-based automation
2. ✅ NotificationHelper - Bildirim yönetimi
3. ✅ Permissions System - Yetki kontrolü
4. ✅ User Role Helper - Auth ve role
5. ✅ AI Integration Utils - ComfyUI, Ollama

**Frontend (Top 5):**
1. ✅ usePermissions - Yetki kontrolü hook
2. ✅ shadcn/ui Components - 37 UI component
3. ✅ SimpleDataTable - Generic data table
4. ✅ useToast - Notification hook
5. ✅ cn() utility - Tailwind merger

**Toplam Reusable Kod:**
- Backend: ~2,500 satır utility code
- Frontend: ~1,000 satır hooks + components
- UI Library: 37 shadcn/ui components

**Kazanç:**
- %80+ kod tekrarı önlendi
- Bakım kolaylığı arttı
- Tutarlı API
- Type-safe development

---

**Hazırlayan:** AI Development Team
**Tarih:** 18 Ekim 2025
**Versiyon:** 2.0.0
