/**
 * FormImageUpload Component
 *
 * Reusable image upload component with:
 * - Drag & drop support
 * - Image preview
 * - Delete functionality
 * - File validation (type, size)
 * - Loading states
 * - GraphQL upload mutation
 *
 * @example
 * <FormImageUpload
 *   value={logoUrl}
 *   onChange={(url) => form.setValue('logo', url)}
 *   onDelete={() => form.setValue('logo', '')}
 *   label="Company Logo"
 *   accept="image/*"
 *   maxSize={5} // MB
 *   recommended="512x512px"
 *   aspectRatio="square" // or "wide" for cover images
 * />
 */

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FormImageUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onDelete?: () => void;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  recommended?: string;
  aspectRatio?: "square" | "wide" | "custom";
  uploadType?: "logo" | "cover" | "avatar"; // Type of upload for backend optimization
  className?: string;
  disabled?: boolean;
}

export function FormImageUpload({
  value,
  onChange,
  onDelete,
  label,
  description,
  accept = "image/*",
  maxSize = 5,
  recommended = "Recommended size",
  aspectRatio = "square",
  uploadType = "logo",
  className,
  disabled = false,
}: FormImageUploadProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return "Lütfen bir resim dosyası seçin";
    }

    // Check file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Dosya boyutu ${maxSize}MB'dan küçük olmalıdır`;
    }

    return null;
  };

  // Upload file to backend
  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      console.log("🔑 Upload Debug:", {
        hasSession: !!session,
        hasBackendToken: !!session?.user?.backendToken,
        tokenPreview: session?.user?.backendToken?.substring(0, 20) + "...",
      });

      if (!session?.user?.backendToken) {
        toast.error("Oturum bilgisi bulunamadı. Lütfen yeniden giriş yapın.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `http://localhost:4001/upload?type=${uploadType}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`,
          },
          credentials: "include",
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      const data = await response.json();
      const fileUrl = `http://localhost:4001${data.url}`;

      onChange(fileUrl);
      toast.success("Resim başarıyla yüklendi!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Resim yüklenirken bir hata oluştu"
      );
    } finally {
      setUploading(false);
    }
  };

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await uploadFile(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await uploadFile(file);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!value) return;

    if (!session?.user?.backendToken) {
      toast.error("Oturum bilgisi bulunamadı. Lütfen yeniden giriş yapın.");
      return;
    }

    try {
      // Extract filename from URL
      const filename = value.split("/").pop();
      if (!filename) return;

      // Call backend to delete file
      const response = await fetch(
        `http://localhost:4001/upload/${filename}?type=${uploadType}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.user.backendToken}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      onDelete?.();
      toast.success("Resim başarıyla silindi");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Resim silinirken bir hata oluştu");
    }
  };

  // Get preview dimensions based on aspect ratio
  const getPreviewClass = () => {
    switch (aspectRatio) {
      case "square":
        return "w-32 h-32";
      case "wide":
        return "w-full h-48";
      default:
        return "w-full h-40";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Label>{label}</Label>

      {/* Preview */}
      {value && (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg overflow-hidden",
            getPreviewClass()
          )}
        >
          <img
            src={value}
            alt={label}
            className={cn(
              "w-full h-full",
              aspectRatio === "square" ? "object-contain" : "object-cover"
            )}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className={cn(
              "absolute",
              aspectRatio === "square"
                ? "top-1 right-1 h-6 w-6"
                : "top-2 right-2 h-8 w-8"
            )}
            onClick={handleDelete}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive && "border-primary bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                disabled={disabled || uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Dosya Seç
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || uploading}
              />
            </div>

            <p className="text-sm text-muted-foreground">
              veya sürükleyip bırakın
            </p>

            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            <p className="text-xs text-muted-foreground">
              {recommended} • Max {maxSize}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
