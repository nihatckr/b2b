/**
 * ImageUploadWithSync Component
 *
 * Reusable image upload component with automatic backend synchronization
 * Handles optimistic updates and backend mutations on delete
 *
 * @example
 * // For user profile
 * <ImageUploadWithSync
 *   value={form.watch("customAvatar")}
 *   onChange={(url) => form.setValue("customAvatar", url)}
 *   mutation={updateProfileMutation}
 *   mutationField="customAvatar"
 *   label="Profile Picture"
 *   uploadType="avatar"
 * />
 *
 * // For company logo
 * <ImageUploadWithSync
 *   value={companyForm.watch("logo")}
 *   onChange={(url) => companyForm.setValue("logo", url)}
 *   mutation={updateCompanyMutation}
 *   mutationField="logo"
 *   mutationParams={{ id: companyId }}
 *   label="Company Logo"
 *   uploadType="logo"
 * />
 */

import { FormImageUpload } from "@/components/forms";
import { toast } from "sonner";

interface ImageUploadWithSyncProps {
  value?: string | null;
  onChange: (url: string) => void;
  onValueClear: () => void; // Callback to clear form value
  mutation: (params: any) => Promise<{ error?: any }>;
  mutationField: string;
  mutationParams?: Record<string, any>; // Additional params like { id: companyId }
  label: string;
  description?: string;
  uploadType?: "avatar" | "logo" | "cover";
  maxSize?: number;
  recommended?: string;
  aspectRatio?: "square" | "wide";
  successMessage?: string;
  errorMessage?: string;
}

export function ImageUploadWithSync({
  value,
  onChange,
  onValueClear,
  mutation,
  mutationField,
  mutationParams = {},
  label,
  description,
  uploadType = "avatar",
  maxSize,
  recommended,
  aspectRatio = "square",
  successMessage = "Resim kaldırıldı",
  errorMessage = "Resim veritabanından silinemedi",
}: ImageUploadWithSyncProps) {
  const handleDelete = async () => {
    // Optimistic update - clear form state immediately
    onValueClear();

    // Update backend to persist the change
    try {
      const result = await mutation({
        ...mutationParams,
        [mutationField]: "",
      });

      if (result.error) {
        console.error("❌ Backend update failed:", result.error);
        toast.error(errorMessage);
      } else {
        toast.success(successMessage);
      }
    } catch (error) {
      console.error("❌ Error updating backend:", error);
      toast.error("Bir hata oluştu");
    }
  };

  return (
    <FormImageUpload
      value={value}
      onChange={onChange}
      onDelete={handleDelete}
      label={label}
      description={description}
      uploadType={uploadType}
      maxSize={maxSize}
      recommended={recommended}
      aspectRatio={aspectRatio}
    />
  );
}
