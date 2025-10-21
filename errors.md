## Error Type

Runtime ReferenceError

## Error Message

formData is not defined

    at MaterialForm (src/components/library/forms/MaterialForm.tsx:75:28)
    at CreateLibraryItemModal (src/components/library/CreateLibraryItemModal.tsx:745:5)
    at AccessoriesPage (src/app/(protected)/dashboard/library/accessories/page.tsx:474:7)

## Code Frame

73 | : "ITEM-001"
74 | }`}

> 75 | value={formData.code}

     |                            ^

76 | onChange={(e) =>
77 | setFormData({ ...formData, code: e.target.value })
78 | }

Next.js version: 15.5.6 (Webpack)
