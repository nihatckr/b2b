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
  uploadType?: string; // Type of upload for backend optimization
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
      // Debug logging removed for production

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
    if (!value) {
      toast.error("Silinecek resim bulunamadı");
      return;
    }

    if (!session?.user?.backendToken) {
      toast.error("Oturum bilgisi bulunamadı. Lütfen yeniden giriş yapın.");
      return;
    }

    // Optimistically clear the value first (immediate UI feedback)
    onDelete?.();

    try {
      // Extract filename from URL
      const filename = value.split("/").pop();
      if (!filename) {
        toast.info("Resim referansı temizlendi");
        return;
      }

      // Call backend to delete file (async, non-blocking)
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

      // If file not found (404), just inform - already cleared UI
      if (response.status === 404) {
        console.warn("File not found on server, but UI already cleared");
        toast.success("Resim kaldırıldı");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete failed:", errorData);
        toast.success(
          "Resim kaldırıldı (sunucu uyarısı: " +
            (errorData.message || "dosya bulunamadı") +
            ")"
        );
        return;
      }

      toast.success("Resim başarıyla silindi");
    } catch (error) {
      console.error("Delete error:", error);
      // Don't show error toast since we already cleared the UI
      toast.success("Resim kaldırıldı");
    }
  };

  // Get preview dimensions based on aspect ratio
  const getPreviewClass = () => {
    switch (aspectRatio) {
      case "square":
        return "w-24 h-24";
      case "wide":
        return "w-full h-32";
      default:
        return "w-full h-28";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>

      {value && value.trim() !== "" ? (
        // Preview Mode - Show image with delete button
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "relative border-2 border-dashed rounded-lg overflow-hidden flex-shrink-0",
              getPreviewClass()
            )}
          >
            <img src={value} alt="" className="w-full h-full object-cover" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={handleDelete}
              disabled={disabled || uploading}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Upload Area - Compact (next to preview) */}
          <div
            className={cn(
              "flex-1 border-2 border-dashed rounded-lg p-4 transition-colors",
              dragActive && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted flex-shrink-0">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled || uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Yükleniyor...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-1 h-3 w-3" />
                        Değiştir
                      </>
                    )}
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    veya sürükle bırak
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                  />
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {description && <p>{description}</p>}
                  <p>
                    Önerilen: {recommended} • Maks {maxSize}MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Upload Mode - Full width upload area (no preview)
        <div
          className={cn(
            "w-full border-2 border-dashed rounded-lg p-4 transition-colors",
            dragActive && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted flex-shrink-0">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-1 h-3 w-3" />
                      Dosya Seç
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground">
                  veya sürükle bırak
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={disabled || uploading}
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-0.5">
                {description && <p>{description}</p>}
                <p>
                  Önerilen: {recommended} • Maks {maxSize}MB
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
