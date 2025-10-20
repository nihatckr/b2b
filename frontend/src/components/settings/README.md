# Settings Components

Reusable components for building consistent settings pages.

## Components

### 1. SettingsCard

A card wrapper for settings sections with built-in form integration, header, and submit button.

**Features:**

- Automatic form integration with React Hook Form
- Built-in loading states
- Customizable submit button
- Consistent styling across all settings sections

**Usage:**

```tsx
<SettingsCard
  title="Profile Information"
  description="Update your personal information"
  form={profileForm}
  onSubmit={onProfileSubmit}
  isLoading={isLoading}
  submitLabel="Save Profile"
>
  <FormInput name="name" label="Name" />
  <FormInput name="email" label="Email" />
</SettingsCard>
```

**Props:**

- `title` (string): Card title
- `description` (string, optional): Card description
- `form` (UseFormReturn): React Hook Form instance
- `onSubmit` (function): Form submit handler
- `isLoading` (boolean, optional): Loading state
- `submitLabel` (string, optional): Submit button text (default: "Save Changes")
- `submitIcon` (ReactNode, optional): Submit button icon (default: Save icon)
- `hideSubmitButton` (boolean, optional): Hide the submit button
- `children` (ReactNode): Form fields and content

---

### 2. SettingsSection

A section divider with optional title and description, used within SettingsCard.

**Features:**

- Automatic separator insertion
- Optional section title and description
- Consistent spacing

**Usage:**

```tsx
<SettingsSection
  title="Basic Information"
  description="Your personal details"
>
  <FormInput name="firstName" label="First Name" />
  <FormInput name="lastName" label="Last Name" />
</SettingsSection>

<SettingsSection>
  <FormInput name="bio" label="Bio" />
</SettingsSection>
```

**Props:**

- `title` (string, optional): Section title
- `description` (string, optional): Section description
- `hideSeparator` (boolean, optional): Hide the separator
- `className` (string, optional): Additional CSS classes
- `children` (ReactNode): Section content

---

### 3. ImageUploadWithSync

Image upload component with automatic backend synchronization on delete.

**Features:**

- Optimistic UI updates
- Automatic backend mutation on delete
- Customizable success/error messages
- Supports different upload types (avatar, logo, cover)

**Usage:**

```tsx
// For user profile
<ImageUploadWithSync
  value={form.watch("customAvatar")}
  onChange={(url) => form.setValue("customAvatar", url)}
  onValueClear={() => form.setValue("customAvatar", "")}
  mutation={updateProfileMutation}
  mutationField="customAvatar"
  label="Profile Picture"
  uploadType="avatar"
  maxSize={3}
  recommended="256x256px"
/>

// For company with additional params
<ImageUploadWithSync
  value={companyForm.watch("logo")}
  onChange={(url) => companyForm.setValue("logo", url)}
  onValueClear={() => companyForm.setValue("logo", "")}
  mutation={updateCompanyMutation}
  mutationField="logo"
  mutationParams={{ id: companyId }}
  label="Company Logo"
  uploadType="logo"
  aspectRatio="square"
/>
```

**Props:**

- `value` (string | null, optional): Current image URL
- `onChange` (function): Callback when image uploaded
- `onValueClear` (function): Callback to clear form value
- `mutation` (function): Backend mutation function
- `mutationField` (string): Field name in mutation
- `mutationParams` (object, optional): Additional mutation parameters
- `label` (string): Upload field label
- `description` (string, optional): Upload field description
- `uploadType` ('avatar' | 'logo' | 'cover', optional): Upload type
- `maxSize` (number, optional): Max file size in MB
- `recommended` (string, optional): Recommended dimensions
- `aspectRatio` ('square' | 'wide', optional): Image aspect ratio
- `successMessage` (string, optional): Success toast message
- `errorMessage` (string, optional): Error toast message

---

## Complete Example

Here's a complete example of a settings page using all three components:

```tsx
import {
  SettingsCard,
  SettingsSection,
  ImageUploadWithSync,
} from "@/components/settings";
import { FormInput, FormTextarea } from "@/components/forms";
import { useForm } from "react-hook-form";

export default function ProfileSettings() {
  const profileForm = useForm();
  const [, updateProfileMutation] = useMutation(UpdateUserProfileDocument);

  const onSubmit = async (values) => {
    // Handle form submission
  };

  return (
    <SettingsCard
      title="Profile Information"
      description="Update your personal information"
      form={profileForm}
      onSubmit={onSubmit}
      isLoading={false}
    >
      {/* Basic Info Section */}
      <SettingsSection
        title="Basic Information"
        description="Your personal details"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormInput name="firstName" label="First Name" />
          <FormInput name="lastName" label="Last Name" />
        </div>
        <FormTextarea name="bio" label="Bio" rows={4} />
      </SettingsSection>

      {/* Profile Picture Section */}
      <SettingsSection>
        <ImageUploadWithSync
          value={profileForm.watch("avatar")}
          onChange={(url) => profileForm.setValue("avatar", url)}
          onValueClear={() => profileForm.setValue("avatar", "")}
          mutation={updateProfileMutation}
          mutationField="customAvatar"
          label="Profile Picture"
          uploadType="avatar"
        />
      </SettingsSection>

      {/* Social Links Section */}
      <SettingsSection title="Social Media" description="Your social profiles">
        <FormInput name="twitter" label="Twitter" />
        <FormInput name="linkedin" label="LinkedIn" />
      </SettingsSection>
    </SettingsCard>
  );
}
```

---

## Benefits

### Before (Without Reusable Components)

```tsx
// 170+ lines of repetitive code
<Card>
  <CardHeader>
    <CardTitle>...</CardTitle>
    <CardDescription>...</CardDescription>
  </CardHeader>
  <CardContent>
    <Form {...form}>
      <form onSubmit={...}>
        <Separator />
        <div className="space-y-4">
          <h3>Section Title</h3>
          <FormInput ... />
        </div>
        <Separator />
        <FormImageUpload
          onDelete={async () => {
            // 20+ lines of delete logic
            form.setValue("", "");
            try {
              const result = await mutation({ field: "" });
              if (result.error) toast.error("...");
              else toast.success("...");
            } catch (error) {
              toast.error("...");
            }
          }}
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 /> : <Save />}
          Save
        </Button>
      </form>
    </Form>
  </CardContent>
</Card>
```

### After (With Reusable Components)

```tsx
// 40-50 lines, clean and maintainable
<SettingsCard title="..." form={form} onSubmit={onSubmit}>
  <SettingsSection title="Section Title">
    <FormInput ... />
  </SettingsSection>

  <SettingsSection>
    <ImageUploadWithSync
      value={form.watch("avatar")}
      onChange={(url) => form.setValue("avatar", url)}
      onValueClear={() => form.setValue("avatar", "")}
      mutation={updateMutation}
      mutationField="avatar"
      label="..."
    />
  </SettingsSection>
</SettingsCard>
```

---

## Migration Guide

### Step 1: Replace Card + Form Wrapper

**Before:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* content */}
        <Button type="submit">Save</Button>
      </form>
    </Form>
  </CardContent>
</Card>
```

**After:**

```tsx
<SettingsCard title="Title" form={form} onSubmit={onSubmit}>
  {/* content */}
</SettingsCard>
```

### Step 2: Replace Sections

**Before:**

```tsx
<Separator />
<div className="space-y-4">
  <h3>Section Title</h3>
  <FormInput ... />
</div>
```

**After:**

```tsx
<SettingsSection title="Section Title">
  <FormInput ... />
</SettingsSection>
```

### Step 3: Replace Image Uploads with Delete Logic

**Before:**

```tsx
<FormImageUpload
  value={form.watch("image")}
  onChange={(url) => form.setValue("image", url)}
  onDelete={async () => {
    form.setValue("image", "");
    try {
      const result = await mutation({ image: "" });
      // error handling...
    } catch (error) {
      // error handling...
    }
  }}
  label="Upload"
/>
```

**After:**

```tsx
<ImageUploadWithSync
  value={form.watch("image")}
  onChange={(url) => form.setValue("image", url)}
  onValueClear={() => form.setValue("image", "")}
  mutation={mutation}
  mutationField="image"
  label="Upload"
/>
```

---

## File Structure

```
frontend/src/components/settings/
├── index.ts                      # Barrel export
├── settings-card.tsx             # SettingsCard component
├── settings-section.tsx          # SettingsSection component
├── image-upload-with-sync.tsx    # ImageUploadWithSync component
└── README.md                     # This file
```

---

## Type Safety

All components are fully typed with TypeScript and provide excellent IDE autocomplete support.

```tsx
// Type-safe form integration
<SettingsCard<MyFormType>
  form={form}
  onSubmit={(values: MyFormType) => {
    // values are fully typed!
  }}
>
  {/* ... */}
</SettingsCard>
```

---

## Contributing

When adding new reusable patterns:

1. Create component in `components/settings/`
2. Export from `index.ts`
3. Add documentation to this README
4. Add usage examples
5. Update migration guide if replacing old patterns
