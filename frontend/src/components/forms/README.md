# Reusable Form Components

## Overview

These reusable form components are built on top of `react-hook-form` and provide a clean, type-safe API for building forms quickly.

## Components

### FormInput

A text input field with full form integration.

```tsx
<FormInput
  control={form.control}
  name="email"
  label="Email Address"
  type="email"
  placeholder="john@example.com"
  description="We'll never share your email"
  disabled={isLoading}
/>
```

**Props:**

- `control` - React Hook Form control object
- `name` - Field name (type-safe)
- `label` - Field label text
- `type` - Input type (text, email, password, tel, etc.) - default: "text"
- `placeholder` - Placeholder text (optional)
- `description` - Helper text below input (optional)
- `disabled` - Disable the input (optional)
- `className` - Additional CSS classes (optional)

---

### FormTextarea

A multi-line text input field.

```tsx
<FormTextarea
  control={form.control}
  name="bio"
  label="Biography"
  placeholder="Tell us about yourself..."
  description="Maximum 500 characters"
  rows={4}
  maxLength={500}
/>
```

**Props:**

- `control` - React Hook Form control object
- `name` - Field name (type-safe)
- `label` - Field label text
- `placeholder` - Placeholder text (optional)
- `description` - Helper text below textarea (optional)
- `disabled` - Disable the textarea (optional)
- `className` - Additional CSS classes (optional)
- `rows` - Number of visible text lines - default: 4
- `maxLength` - Maximum character count (optional)

---

### FormSwitch

A toggle switch for boolean values.

```tsx
<FormSwitch
  control={form.control}
  name="emailNotifications"
  label="Email Notifications"
  description="Receive updates via email"
/>
```

**Props:**

- `control` - React Hook Form control object
- `name` - Field name (type-safe)
- `label` - Field label text
- `description` - Helper text below label (optional)
- `disabled` - Disable the switch (optional)
- `className` - Additional CSS classes (optional)

**Note:** Automatically renders with border and padding for better visual separation.

---

### FormSelect

A dropdown select input.

```tsx
<FormSelect
  control={form.control}
  name="language"
  label="Preferred Language"
  description="Choose your language"
  options={[
    { value: "en", label: "English" },
    { value: "tr", label: "Türkçe" },
    { value: "de", label: "Deutsch" },
  ]}
  placeholder="Select a language"
/>
```

**Props:**

- `control` - React Hook Form control object
- `name` - Field name (type-safe)
- `label` - Field label text
- `options` - Array of `{ value: string, label: string }` objects
- `placeholder` - Placeholder text - default: "Select an option"
- `description` - Helper text below select (optional)
- `disabled` - Disable the select (optional)
- `className` - Additional CSS classes (optional)

---

## Usage Example

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormInput,
  FormTextarea,
  FormSwitch,
  FormSelect,
} from "@/components/forms";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import * as z from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  bio: z.string().max(500).optional(),
  newsletter: z.boolean(),
  role: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function MyForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      bio: "",
      newsletter: true,
      role: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          control={form.control}
          name="name"
          label="Full Name"
          placeholder="John Doe"
        />

        <FormInput
          control={form.control}
          name="email"
          label="Email"
          type="email"
          placeholder="john@example.com"
        />

        <FormTextarea
          control={form.control}
          name="bio"
          label="Bio"
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={500}
        />

        <FormSwitch
          control={form.control}
          name="newsletter"
          label="Subscribe to Newsletter"
          description="Receive weekly updates via email"
        />

        <FormSelect
          control={form.control}
          name="role"
          label="Role"
          options={[
            { value: "user", label: "User" },
            { value: "admin", label: "Administrator" },
            { value: "moderator", label: "Moderator" },
          ]}
        />

        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
}
```

## Benefits

### ✅ Reduced Code

Before:

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="john@example.com" {...field} />
      </FormControl>
      <FormDescription>We'll never share your email</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

After:

```tsx
<FormInput
  control={form.control}
  name="email"
  label="Email"
  type="email"
  placeholder="john@example.com"
  description="We'll never share your email"
/>
```

### ✅ Type Safety

All components are fully typed with TypeScript generics, providing autocomplete for field names based on your form schema.

### ✅ Consistency

Ensures consistent styling and behavior across all forms in your application.

### ✅ Maintainability

Centralized component logic makes updates and bug fixes easier.

### ✅ DRY Principle

Don't repeat yourself - write form fields once, use everywhere.

## File Structure

```
src/
└── components/
    └── forms/
        ├── FormInput.tsx       # Text input
        ├── FormTextarea.tsx    # Multi-line text
        ├── FormSwitch.tsx      # Boolean toggle
        ├── FormSelect.tsx      # Dropdown select
        └── index.ts            # Barrel export
```

## Integration

Import from the barrel export:

```tsx
import {
  FormInput,
  FormTextarea,
  FormSwitch,
  FormSelect,
} from "@/components/forms";
```

Or individual imports:

```tsx
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
```

---

**Created for:** ProtexFlow Application
**Tech Stack:** React Hook Form + Zod + ShadCN UI
