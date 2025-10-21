# Library Management Implementation Plan

## 🎯 Öncelik: PRIORITY 0 (Collections'dan önce geliştirilmeli)

**Neden önce:** Collections form'unda şu alanlar Library'den seçilecek:

- `colors` → LibraryColor
- `fit` → LibraryFit
- `trend` → LibraryTrend (varsa)
- `sizeGroups` → LibrarySizeGroup
- `certifications` → LibraryCertification
- `fabricComposition` → LibraryFabric (opsiyonel)

---

## 📊 Backend Status: ✅ 100% Ready

### Mevcut Backend Yapısı:

**Model:** `LibraryItem` (Unified model - tüm library tipleri tek tabloda)

**Kategoriler:**

```typescript
enum LibraryCategory {
  COLOR         // Renk paleti
  FABRIC        // Kumaş kütüphanesi
  MATERIAL      // Aksesuar/Malzemeler (Button, Zipper, Label, etc.)
  SIZE_GROUP    // Beden grupları
  SEASON        // Sezon yönetimi
  FIT           // Kesim tipleri
  CERTIFICATION // Sertifikalar
}

enum LibraryScope {
  PLATFORM_STANDARD  // Platform geneli standart (admin tanımlı)
  COMPANY_CUSTOM     // Firma özel
}
```

**GraphQL Operations:**

**Queries:**

- `libraryItems(filter)` - Tüm library items (filtreli)
- `platformStandards(category)` - Platform standartları
- `myCompanyLibrary(category)` - Firma özel library
- `libraryItem(id)` - Tek item
- `libraryItemByCode(code)` - Code ile arama

**Mutations:**

- `createLibraryItem(input)` - Yeni item oluştur
- `updateLibraryItem(id, input)` - Item güncelle
- `deleteLibraryItem(id)` - Item sil (soft delete)

---

## 🏗️ Frontend Implementation

### Dosya Yapısı:

```bash
frontend/src/
├── graphql/
│   └── library.graphql                   # NEW: All library operations
├── app/(protected)/dashboard/
│   └── library/
│       ├── page.tsx                      # NEW: Library dashboard (category tabs)
│       ├── colors/
│       │   ├── page.tsx                  # NEW: Color palette management
│       │   └── components/
│       │       ├── ColorCard.tsx         # NEW: Color swatch card
│       │       ├── ColorForm.tsx         # NEW: Create/Edit color
│       │       └── ColorPicker.tsx       # NEW: Color picker widget
│       ├── fabrics/
│       │   ├── page.tsx                  # NEW: Fabric library
│       │   └── components/
│       │       ├── FabricCard.tsx        # NEW
│       │       └── FabricForm.tsx        # NEW
│       ├── materials/
│       │   ├── page.tsx                  # NEW: Materials (buttons, zippers, etc.)
│       │   └── components/
│       │       ├── MaterialCard.tsx      # NEW
│       │       └── MaterialForm.tsx      # NEW
│       ├── size-groups/
│       │   ├── page.tsx                  # NEW: Size groups
│       │   └── components/
│       │       ├── SizeGroupCard.tsx     # NEW
│       │       └── SizeGroupForm.tsx     # NEW
│       ├── fits/
│       │   ├── page.tsx                  # NEW: Fit types
│       │   └── components/
│       │       ├── FitCard.tsx           # NEW
│       │       └── FitForm.tsx           # NEW
│       └── certifications/
│           ├── page.tsx                  # NEW: Certifications
│           └── components/
│               ├── CertificationCard.tsx # NEW
│               └── CertificationForm.tsx # NEW
├── components/
│   └── library/
│       ├── LibraryItemSelector.tsx       # NEW: Reusable selector for forms
│       ├── ColorSelector.tsx             # NEW: Color multi-select
│       ├── FitSelector.tsx               # NEW: Fit single-select
│       ├── SizeGroupSelector.tsx         # NEW: Size group multi-select
│       └── CertificationSelector.tsx     # NEW: Certification multi-select
└── hooks/
    └── useLibrary.ts                     # NEW: Library management hooks
```

---

## 📝 GraphQL Operations

### library.graphql

```graphql
# ========================================
# QUERIES
# ========================================

# All Library Items (with filters)
query DashboardLibraryItems(
  $filter: LibraryFilterInput
  $limit: Int
  $offset: Int
) {
  libraryItems(filter: $filter, limit: $limit, offset: $offset) {
    id
    scope
    category
    code
    name
    description
    imageUrl
    data
    tags
    isActive
    isPopular
    company {
      id
      name
    }
    standardItem {
      id
      name
    }
    createdBy {
      id
      name
    }
    createdAt
    updatedAt
  }
}

# Platform Standards (all users can see)
query DashboardPlatformStandards($category: String) {
  platformStandards(category: $category) {
    id
    category
    code
    name
    description
    imageUrl
    data
    isPopular
  }
}

# Company Custom Library
query DashboardMyCompanyLibrary($category: String) {
  myCompanyLibrary(category: $category) {
    id
    category
    code
    name
    description
    imageUrl
    data
    internalCode
    notes
    isActive
  }
}

# Single Library Item
query DashboardLibraryItem($id: Int!) {
  libraryItem(id: $id) {
    id
    scope
    category
    code
    name
    description
    imageUrl
    data
    tags
    internalCode
    notes
    isActive
    isPopular
    company {
      id
      name
    }
    standardItem {
      id
      name
    }
    createdBy {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}

# ========================================
# MUTATIONS
# ========================================

# Create Library Item
mutation DashboardCreateLibraryItem($input: CreateLibraryItemInput!) {
  createLibraryItem(input: $input) {
    id
    category
    name
    code
  }
}

# Update Library Item
mutation DashboardUpdateLibraryItem(
  $id: Int!
  $input: UpdateLibraryItemInput!
) {
  updateLibraryItem(id: $id, input: $input) {
    id
    category
    name
    code
  }
}

# Delete Library Item (soft delete)
mutation DashboardDeleteLibraryItem($id: Int!) {
  deleteLibraryItem(id: $id)
}
```

---

## 🎨 UI Components

### 1. Library Dashboard (library/page.tsx)

**Layout:** Tab-based navigation

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Fabric, Package, Ruler, Scissors, Award } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Library Management</h1>

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="colors">
            <Palette className="mr-2 h-4 w-4" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fabrics">
            <Fabric className="mr-2 h-4 w-4" />
            Fabrics
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Package className="mr-2 h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="size-groups">
            <Ruler className="mr-2 h-4 w-4" />
            Size Groups
          </TabsTrigger>
          <TabsTrigger value="fits">
            <Scissors className="mr-2 h-4 w-4" />
            Fits
          </TabsTrigger>
          <TabsTrigger value="certifications">
            <Award className="mr-2 h-4 w-4" />
            Certifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors">{/* Colors content */}</TabsContent>

        <TabsContent value="fabrics">{/* Fabrics content */}</TabsContent>

        {/* ... other tabs */}
      </Tabs>
    </div>
  );
}
```

---

### 2. Color Management (library/colors/page.tsx)

```tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "urql";
import {
  DashboardPlatformStandardsDocument,
  DashboardMyCompanyLibraryDocument,
  DashboardCreateLibraryItemDocument,
} from "@/__generated__/graphql";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ColorCard from "./components/ColorCard";
import ColorForm from "./components/ColorForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function ColorsPage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Platform standards (all users can see)
  const [{ data: platformData }] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "COLOR" },
  });

  // Company custom colors
  const [{ data: companyData }] = useQuery({
    query: DashboardMyCompanyLibraryDocument,
    variables: { category: "COLOR" },
  });

  const [, createColor] = useMutation(DashboardCreateLibraryItemDocument);

  const handleCreate = async (colorData: any) => {
    const result = await createColor({
      input: {
        category: "COLOR",
        scope: "COMPANY_CUSTOM",
        name: colorData.name,
        description: colorData.description,
        data: JSON.stringify({
          hex: colorData.hex,
          pantone: colorData.pantone,
          rgb: colorData.rgb,
          cmyk: colorData.cmyk,
        }),
      },
    });

    if (!result.error) {
      setShowCreateDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Color Palette</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Color
            </Button>
          </DialogTrigger>
          <DialogContent>
            <ColorForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Platform Standards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Platform Standards</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {platformData?.platformStandards.map((color) => (
            <ColorCard key={color.id} color={color} />
          ))}
        </div>
      </div>

      {/* Company Custom Colors */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your Company Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {companyData?.myCompanyLibrary.map((color) => (
            <ColorCard key={color.id} color={color} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 3. ColorCard Component (library/colors/components/ColorCard.tsx)

```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface ColorCardProps {
  color: {
    id: string;
    name: string;
    description?: string | null;
    data?: any;
    isPopular?: boolean | null;
  };
  selected?: boolean;
  onSelect?: () => void;
}

export default function ColorCard({
  color,
  selected,
  onSelect,
}: ColorCardProps) {
  const colorData = color.data || {};
  const hex = colorData.hex || "#CCCCCC";

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-shadow ${
        selected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        {/* Color Swatch */}
        <div
          className="w-full h-20 rounded-lg mb-3 relative"
          style={{ backgroundColor: hex }}
        >
          {selected && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Check className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
          )}
          {color.isPopular && (
            <Badge className="absolute top-2 right-2 text-xs">Popular</Badge>
          )}
        </div>

        {/* Color Info */}
        <div className="space-y-1">
          <h4 className="font-semibold text-sm truncate">{color.name}</h4>
          <p className="text-xs text-muted-foreground">{hex}</p>
          {colorData.pantone && (
            <p className="text-xs text-muted-foreground">{colorData.pantone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### 4. ColorForm Component (library/colors/components/ColorForm.tsx)

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ColorFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export default function ColorForm({
  onSubmit,
  onCancel,
  initialData,
}: ColorFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    hex: initialData?.data?.hex || "#FFFFFF",
    pantone: initialData?.data?.pantone || "",
    rgb: initialData?.data?.rgb || "",
    cmyk: initialData?.data?.cmyk || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {initialData ? "Edit Color" : "Add New Color"}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Color Name */}
        <div>
          <Label htmlFor="name">Color Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Navy Blue"
            required
          />
        </div>

        {/* HEX Color Picker */}
        <div>
          <Label htmlFor="hex">HEX Code *</Label>
          <div className="flex gap-2">
            <Input
              id="hex"
              type="color"
              value={formData.hex}
              onChange={(e) =>
                setFormData({ ...formData, hex: e.target.value })
              }
              className="w-20 h-10"
            />
            <Input
              value={formData.hex}
              onChange={(e) =>
                setFormData({ ...formData, hex: e.target.value })
              }
              placeholder="#FFFFFF"
              className="flex-1"
            />
          </div>
        </div>

        {/* Pantone */}
        <div>
          <Label htmlFor="pantone">Pantone Code</Label>
          <Input
            id="pantone"
            value={formData.pantone}
            onChange={(e) =>
              setFormData({ ...formData, pantone: e.target.value })
            }
            placeholder="e.g., PANTONE 18-3838"
          />
        </div>

        {/* RGB */}
        <div>
          <Label htmlFor="rgb">RGB</Label>
          <Input
            id="rgb"
            value={formData.rgb}
            onChange={(e) => setFormData({ ...formData, rgb: e.target.value })}
            placeholder="e.g., rgb(255, 255, 255)"
          />
        </div>

        {/* CMYK */}
        <div>
          <Label htmlFor="cmyk">CMYK</Label>
          <Input
            id="cmyk"
            value={formData.cmyk}
            onChange={(e) => setFormData({ ...formData, cmyk: e.target.value })}
            placeholder="e.g., cmyk(0, 0, 0, 0)"
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Color description..."
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialData ? "Update" : "Create"} Color</Button>
      </div>
    </form>
  );
}
```

---

## 🔄 Reusable Selector Components

### ColorSelector (Collections form'unda kullanılacak)

```tsx
"use client";

import { useQuery } from "urql";
import { DashboardPlatformStandardsDocument } from "@/__generated__/graphql";
import ColorCard from "@/app/(protected)/dashboard/library/colors/components/ColorCard";

interface ColorSelectorProps {
  value: string[]; // Array of color IDs
  onChange: (colorIds: string[]) => void;
  multiple?: boolean;
}

export default function ColorSelector({
  value,
  onChange,
  multiple = true,
}: ColorSelectorProps) {
  const [{ data }] = useQuery({
    query: DashboardPlatformStandardsDocument,
    variables: { category: "COLOR" },
  });

  const handleSelect = (colorId: string) => {
    if (multiple) {
      if (value.includes(colorId)) {
        onChange(value.filter((id) => id !== colorId));
      } else {
        onChange([...value, colorId]);
      }
    } else {
      onChange([colorId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {data?.platformStandards.map((color) => (
          <ColorCard
            key={color.id}
            color={color}
            selected={value.includes(color.id)}
            onSelect={() => handleSelect(color.id)}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        {value.length} color{value.length !== 1 ? "s" : ""} selected
      </p>
    </div>
  );
}
```

---

## 📅 Implementation Timeline

### Week 1: Foundation (2 days)

**Day 1:**

- [ ] Create `library.graphql` file
- [ ] Run codegen
- [ ] Create library dashboard layout (`library/page.tsx`)
- [ ] Setup tab navigation structure

**Day 2:**

- [ ] Create `useLibrary.ts` hook
- [ ] Setup basic query/mutation patterns
- [ ] Test GraphQL operations in Playground

### Week 1: Colors & Fabrics (2 days)

**Day 3:**

- [ ] Build Colors page (`library/colors/page.tsx`)
- [ ] Create `ColorCard.tsx` component
- [ ] Create `ColorForm.tsx` component
- [ ] Create `ColorPicker.tsx` widget
- [ ] Test color CRUD operations

**Day 4:**

- [ ] Build Fabrics page (`library/fabrics/page.tsx`)
- [ ] Create `FabricCard.tsx` component
- [ ] Create `FabricForm.tsx` component
- [ ] Test fabric CRUD operations

### Week 2: Size Groups & Fits (1.5 days)

**Day 5:**

- [ ] Build Size Groups page
- [ ] Create `SizeGroupCard.tsx`
- [ ] Create `SizeGroupForm.tsx`

**Day 6 (half):**

- [ ] Build Fits page
- [ ] Create `FitCard.tsx`
- [ ] Create `FitForm.tsx`

### Week 2: Materials & Certifications (1.5 days)

**Day 6 (half):**

- [ ] Build Materials page
- [ ] Create `MaterialCard.tsx`
- [ ] Create `MaterialForm.tsx`

**Day 7:**

- [ ] Build Certifications page
- [ ] Create `CertificationCard.tsx`
- [ ] Create `CertificationForm.tsx`

### Week 2: Reusable Selectors (1 day)

**Day 8:**

- [ ] Create `ColorSelector.tsx` (reusable)
- [ ] Create `FitSelector.tsx` (reusable)
- [ ] Create `SizeGroupSelector.tsx` (reusable)
- [ ] Create `CertificationSelector.tsx` (reusable)
- [ ] Test all selectors in isolation

---

## ✅ Success Criteria

### Per Category:

- [ ] CRUD operations working (Create, Read, Update, Delete)
- [ ] Platform standards visible to all users
- [ ] Company custom items only visible to company members
- [ ] Permission checks enforced (Admin can edit platform standards)
- [ ] Form validation working
- [ ] Loading states during async operations
- [ ] Error handling with user-friendly messages
- [ ] Mobile responsive

### Reusable Selectors:

- [ ] Can be imported and used in other forms
- [ ] Support single and multi-select modes
- [ ] Show selected state visually
- [ ] Real-time updates when library changes

---

## 🔗 Integration with Collections

After Library Management is complete, Collections form will use:

```tsx
// Collections Create Form
import ColorSelector from "@/components/library/ColorSelector";
import FitSelector from "@/components/library/FitSelector";
import SizeGroupSelector from "@/components/library/SizeGroupSelector";
import CertificationSelector from "@/components/library/CertificationSelector";

export default function CollectionForm() {
  const [formData, setFormData] = useState({
    // ... other fields
    colorIds: [],
    fitId: null,
    sizeGroupIds: [],
    certificationIds: [],
  });

  return (
    <Form>
      {/* ... other fields */}

      {/* Colors */}
      <FormField>
        <FormLabel>Colors</FormLabel>
        <ColorSelector
          value={formData.colorIds}
          onChange={(ids) => setFormData({ ...formData, colorIds: ids })}
          multiple={true}
        />
      </FormField>

      {/* Fit */}
      <FormField>
        <FormLabel>Fit Type</FormLabel>
        <FitSelector
          value={formData.fitId ? [formData.fitId] : []}
          onChange={(ids) => setFormData({ ...formData, fitId: ids[0] })}
          multiple={false}
        />
      </FormField>

      {/* Size Groups */}
      <FormField>
        <FormLabel>Size Groups</FormLabel>
        <SizeGroupSelector
          value={formData.sizeGroupIds}
          onChange={(ids) => setFormData({ ...formData, sizeGroupIds: ids })}
          multiple={true}
        />
      </FormField>

      {/* Certifications */}
      <FormField>
        <FormLabel>Certifications</FormLabel>
        <CertificationSelector
          value={formData.certificationIds}
          onChange={(ids) =>
            setFormData({ ...formData, certificationIds: ids })
          }
          multiple={true}
        />
      </FormField>
    </Form>
  );
}
```

---

## 🎯 Next Steps After Library

1. **Collections Management** (can now use Library selectors)
2. **Samples Management** (can reference collection library items)
3. **Orders Management** (can reference sample library items)

---

**Total Effort:** 3-4 days (full-time developer)

**Status:** Ready to start (Backend 100% complete)

**First Action:** Create `library.graphql` file and run codegen
