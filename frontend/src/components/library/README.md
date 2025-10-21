# Library Management Components

## CreateLibraryItemModal

Reusable modal component for creating library items (Fabrics, Colors, Size Groups, Fits, etc.)

### Features

#### 🎨 **Color Category**

- **Interactive Color Picker**: Click the color box to select any color
- **Live Preview**: See the selected color in real-time (large color swatch)
- **Hex Code Input**: Type hex codes directly or use the color picker
- **Hex Validation**: Automatic validation of hex format (#RRGGBB)
- **Pantone Support**: Add Pantone codes
- **RGB Support**: Add RGB values (R, G, B 0-255)

**Example Usage:**

```tsx
<CreateLibraryItemModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  category="COLOR"
  scope="COMPANY_CUSTOM"
  onSubmit={handleCreateColor}
/>
```

**Color Data Structure:**

```typescript
{
  code: "BLK-001",
  name: "Midnight Black",
  description: "Deep black color for evening wear",
  data: {
    hex: "#000000",
    pantone: "PANTONE 533C",
    r: "0",
    g: "0",
    b: "0"
  },
  tags: ["dark", "neutral"]
}
```

#### 🧵 **Fabric Category**

- **Image Upload**: Upload fabric photos (texture, weave pattern)
- **Image Preview**: See uploaded image before submission
- **Remove Image**: Easy image removal with X button
- **Composition**: Required field for fabric composition (e.g., "100% Cotton")
- **Weight**: Fabric weight in g/m²
- **Width**: Fabric width in cm
- **Supplier**: Supplier name

**Example Usage:**

```tsx
<CreateLibraryItemModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  category="FABRIC"
  scope="PLATFORM_STANDARD"
  onSubmit={handleCreateFabric}
/>
```

**Fabric Data Structure:**

```typescript
{
  code: "CTN-100",
  name: "Premium Cotton",
  description: "High-quality cotton fabric",
  data: {
    composition: "100% Cotton",
    weight: "180",
    width: "150",
    supplier: "Cotton Co."
  },
  tags: ["natural", "breathable"],
  imageFile: File // Image file to be uploaded
}
```

### Props

```typescript
interface CreateLibraryItemModalProps {
  open: boolean;                    // Modal open state
  onOpenChange: (open: boolean) => void; // Open state handler
  category: "FABRIC" | "COLOR" | ... ;   // Item category
  scope: "PLATFORM_STANDARD" | "COMPANY_CUSTOM"; // Visibility scope
  onSubmit: (data: LibraryItemFormData) => Promise<void>; // Submit handler
}
```

### Form Data

```typescript
interface LibraryItemFormData {
  code: string; // Unique code (e.g., "BLK-001")
  name: string; // Display name
  description: string; // Description
  data: Record<string, any>; // Category-specific data (JSON)
  tags: string[]; // Tags array
  imageFile?: File; // Image file (Fabric only)
}
```

### Category-Specific Fields

| Category       | Specific Fields                                            |
| -------------- | ---------------------------------------------------------- |
| **COLOR**      | hex (required), pantone, r, g, b                           |
| **FABRIC**     | composition (required), weight, width, supplier, imageFile |
| **SIZE_GROUP** | sizes (required), sizeCategory                             |
| **FIT**        | fitCategory                                                |

### UI Features

- ✅ **Responsive Design**: Mobile-first, adaptive layout
- ✅ **Live Preview**: Real-time color/image preview
- ✅ **Validation**: Required field validation
- ✅ **Loading State**: Shows "Creating..." during submission
- ✅ **Error Handling**: Try-catch with console error logging
- ✅ **Auto Reset**: Form clears on successful submission
- ✅ **Max Height**: Scrollable content (max 90vh)

### Integration with Pages

**Fabrics Page:**

```tsx
const handleCreateItem = async (data: LibraryItemFormData) => {
  // TODO: Upload image if exists
  // if (data.imageFile) { ... upload to /api/upload ... }

  // Create mutation
  await createLibraryItem({
    code: data.code,
    name: data.name,
    category: "FABRIC",
    scope: createScope,
    data: JSON.stringify(data.data),
    tags: JSON.stringify(data.tags),
    imageUrl: uploadedImageUrl, // from upload response
  });
};
```

**Colors Page:**

```tsx
const handleCreateItem = async (data: LibraryItemFormData) => {
  // Create mutation
  await createLibraryItem({
    code: data.code,
    name: data.name,
    category: "COLOR",
    scope: createScope,
    data: JSON.stringify(data.data),
    tags: JSON.stringify(data.tags),
  });
};
```

### Next Steps (TODO)

1. **Implement Image Upload**

   - Upload to `/api/upload` endpoint
   - Get `imageUrl` from response
   - Pass `imageUrl` to mutation

2. **Implement Create Mutation**

   - Use `DashboardCreateLibraryItemDocument`
   - Convert `data` to JSON string
   - Convert `tags` to JSON array
   - Handle success/error with toast

3. **Add Edit Modal**

   - Similar to create but with pre-filled data
   - Use `DashboardUpdateLibraryItemDocument`

4. **Add Delete Confirmation**
   - Use `DashboardDeleteLibraryItemDocument`
   - Show confirmation dialog

### Example: Complete Implementation

```tsx
import { useMutation } from "urql";
import { DashboardCreateLibraryItemDocument } from "@/__generated__/graphql";

const [, createMutation] = useMutation(DashboardCreateLibraryItemDocument);

const handleCreateFabric = async (data: LibraryItemFormData) => {
  let imageUrl = "";

  // 1. Upload image if exists
  if (data.imageFile) {
    const formData = new FormData();
    formData.append("file", data.imageFile);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    imageUrl = result.url;
  }

  // 2. Create library item
  const result = await createMutation({
    input: {
      code: data.code,
      name: data.name,
      description: data.description,
      category: "FABRIC",
      scope: createScope,
      data: JSON.stringify(data.data),
      tags: JSON.stringify(data.tags),
      imageUrl: imageUrl || null,
    },
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  // 3. Refetch queries
  refetchFabrics({ requestPolicy: "network-only" });
};
```

---

## Design Decisions

### Why Color Picker First?

- More intuitive for designers
- Visual feedback is immediate
- Hex codes can be copied/pasted
- Supports all modern browsers

### Why Image Upload for Fabrics?

- Visual identification is crucial
- Shows texture and weave pattern
- Helps designers make decisions
- Industry standard practice

### Why Live Preview?

- Instant visual feedback
- Reduces errors
- Professional UX
- Matches industry tools (Adobe, Figma, etc.)
