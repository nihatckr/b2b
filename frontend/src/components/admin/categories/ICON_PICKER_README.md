# IconPicker Component

User-friendly icon selection component for category management.

## Features

✅ **Visual Icon Selection** - Browse icons in a grid layout
✅ **Search Functionality** - Filter icons by name
✅ **Categorized Icons** - Pre-selected relevant icons for textile/fashion industry
✅ **Live Preview** - See selected icon immediately
✅ **Clear Option** - Easy way to remove icon selection
✅ **Lucide React Integration** - Uses 70+ carefully selected icons

## Usage

### Basic Usage

```tsx
import { IconPicker } from "@/components/admin/categories/IconPicker";

function MyForm() {
  const [icon, setIcon] = useState("");

  return <IconPicker value={icon} onChange={setIcon} label="Category Icon" />;
}
```

### With Form Validation

```tsx
import { IconPicker } from "@/components/admin/categories/IconPicker";

function MyForm() {
  const [icon, setIcon] = useState("");
  const [errors, setErrors] = useState<{ icon?: string }>({});

  return (
    <IconPicker
      value={icon}
      onChange={(newIcon) => {
        setIcon(newIcon);
        setErrors((prev) => ({ ...prev, icon: undefined }));
      }}
      label="Category Icon"
      error={errors.icon}
    />
  );
}
```

## Icon Categories

### General (13 icons)

- Folder management: `FolderTree`, `Folder`, `FolderOpen`
- Containers: `Package`, `Box`, `Boxes`, `Archive`
- Organization: `Tag`, `Tags`, `Layers`, `Layout`, `LayoutGrid`, `LayoutList`

### Textile/Fashion (10 icons)

- Products: `Shirt`, `Home`, `Store`
- Shopping: `ShoppingBag`, `ShoppingCart`
- Operations: `Warehouse`, `Truck`
- Packaging: `Package2`, `PackageCheck`, `PackageOpen`

### Industry/Manufacturing (10 icons)

- Production: `Factory`, `Wrench`, `Hammer`
- Tools: `Settings`, `Cog`, `Tool`, `Scissors`, `Ruler`
- Design: `Palette`, `Brush`

### Materials/Fabric (8 icons)

- Visual: `Sparkles`, `Star`, `Circle`, `Square`, `Triangle`, `Hexagon`, `Diamond`, `Shapes`

### Organization (7 icons)

- Structure: `Grid`, `List`, `ListTree`, `Network`, `GitBranch`, `Workflow`, `Component`

### Status/Action (8 icons)

- Indicators: `Check`, `CheckCircle`, `AlertCircle`, `Info`, `Zap`, `Target`, `Award`, `Badge`

**Total: 70+ carefully selected icons**

## Features Breakdown

### 1. Visual Grid Layout

- 4-column responsive grid
- Icon preview with hover effects
- Selected icon highlighted with ring
- Truncated labels for compact display

### 2. Search Functionality

- Real-time filtering
- Case-insensitive search
- Searches in icon names
- "No results" message when no match

### 3. Popover Interface

- Opens on button click
- 400px width for comfortable browsing
- 300px scrollable height
- Aligned to start of trigger

### 4. Selected Icon Display

- Shows icon + formatted name in button
- Code display below (e.g., `FolderTree`)
- Clear button in popover footer

### 5. Validation Support

- Error prop for validation messages
- Red border on error state
- Error message display

## Integration with CategoryForm

```tsx
// CategoryForm.tsx
import { IconPicker } from "./IconPicker";

<IconPicker
  value={formData.icon}
  onChange={(icon) => handleChange("icon", icon)}
  label="İkon"
/>;
```

## Integration with category-utils.tsx

```tsx
// Render icon dynamically
import { renderCategoryIcon } from "@/lib/category-utils";

// In component
{
  renderCategoryIcon(category.icon, category.level, "h-4 w-4");
}
```

## Helper Functions

### getDynamicIcon()

Returns icon component from Lucide, with fallback logic:

1. Try custom icon name
2. Try default level icon
3. Fallback to `FolderIcon`

### renderCategoryIcon()

Renders icon as JSX element with specified className.

## Styling

- Uses shadcn/ui components (Button, Popover, Input, ScrollArea)
- Tailwind CSS for styling
- Hover effects for better UX
- Ring indicator for selected state

## Accessibility

- Keyboard navigation supported (via Radix Popover)
- Button titles for tooltip info
- Clear semantic structure
- Focus management

## Performance

- Icons imported dynamically from Lucide
- Filtered list computed on-the-fly
- Minimal re-renders with proper state management

## Future Enhancements

- [ ] Icon color picker
- [ ] Custom icon upload
- [ ] Recently used icons
- [ ] Favorite icons
- [ ] Icon categories/tabs
- [ ] Bulk icon operations

## Related Components

- `CategoryForm.tsx` - Uses IconPicker for icon selection
- `CategoryTreeView.tsx` - Displays selected icons
- `category-utils.tsx` - Icon utility functions

## Example Icons for Textile Categories

| Category          | Suggested Icon | Reason         |
| ----------------- | -------------- | -------------- |
| ROOT: Tekstil     | `FolderTree`   | Tree structure |
| MAIN: Giyim       | `Shirt`        | Clothing       |
| MAIN: Ev Tekstili | `Home`         | Home products  |
| MAIN: Kumaş       | `Layers`       | Fabric layers  |
| SUB: Üst Giyim    | `Shirt`        | Tops           |
| SUB: Alt Giyim    | `Package`      | Bottoms        |
| SUB: Yatak Odası  | `Package2`     | Bedroom        |
| DETAIL: Gömlek    | `Shirt`        | Specific item  |
| DETAIL: Nevresim  | `PackageCheck` | Bedding set    |

## Icon Naming Convention

Lucide uses PascalCase for icon names:

- ✅ `FolderTree` (correct)
- ❌ `folder-tree` (wrong)
- ❌ `folderTree` (wrong)

The component handles this automatically.

## Troubleshooting

### Icon not showing?

- Check icon name spelling (PascalCase)
- Verify icon exists in Lucide React
- Check `CATEGORY_ICONS` array includes the icon

### Search not working?

- Search is case-insensitive and matches icon names
- Try partial name (e.g., "fold" matches "Folder", "FolderTree")

### Popover positioning issues?

- Adjust `align` prop on PopoverContent
- Check parent container overflow settings

## Related Documentation

- [Lucide React Icons](https://lucide.dev/icons/)
- [Radix UI Popover](https://www.radix-ui.com/primitives/docs/components/popover)
- [shadcn/ui Popover](https://ui.shadcn.com/docs/components/popover)
