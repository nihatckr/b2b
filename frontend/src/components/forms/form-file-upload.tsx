/**
 * FormFileUpload Component
 *
 * Reusable file upload component with:
 * - Drag & drop support
 * - File preview (images, PDFs, documents)
 * - Delete functionality
 * - File validation (type, size)
 * - Loading states
 * - REST API upload
 *
 * @example
 * // Image upload
 * <FormFileUpload
 *   value={logoUrl}
 *   onChange={(url) => form.setValue('logo', url)}
 *   onDelete={() => form.setValue('logo', '')}
 *   label="Company Logo"
 *   accept="image/*"
 *   fileType="image"
 *   maxSize={5}
 * />
 *
 * // PDF upload
 * <FormFileUpload
 *   value={techPackUrl}
 *   onChange={(url) => form.setValue('techPack', url)}
 *   onDelete={() => form.setValue('techPack', '')}
 *   label="Tech Pack"
 *   accept=".pdf"
 *   fileType="pdf"
 *   maxSize={10}
 *   uploadType="documents"
 * />
 *
 * // Excel upload
 * <FormFileUpload
 *   value={measurementTableUrl}
 *   onChange={(url) => form.setValue('measurementTable', url)}
 *   onDelete={() => form.setValue('measurementTable', '')}
 *   label="Ölçü Tablosu"
 *   accept=".xlsx,.xls"
 *   fileType="document"
 *   maxSize={5}
 *   uploadType="documents"
 * />
 */

"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface FormFileUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  onDelete?: () => void;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  recommended?: string;
  aspectRatio?: "square" | "wide" | "custom";
  uploadType?: string; // Type of upload for backend routing (fabrics, certifications, documents, etc.)
  fileType?: "image" | "pdf" | "document" | "any"; // UI rendering type
  className?: string;
  disabled?: boolean;
}

export function FormFileUpload({
  value,
  onChange,
  onDelete,
  label,
  description,
  accept = "image/*",
  maxSize = 5,
  recommended = "Önerilen boyut",
  aspectRatio = "square",
  uploadType = "documents",
  fileType = "image",
  className,
  disabled = false,
}: FormFileUploadProps) {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get file type from extension
  const getFileType = (url: string): "image" | "pdf" | "document" => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["xlsx", "xls", "csv", "doc", "docx"].includes(ext || ""))
      return "document";
    return "image";
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Dosya boyutu ${maxSize}MB'dan küçük olmalıdır`;
    }

    // Check file type based on accept prop
    if (fileType === "image" && !file.type.startsWith("image/")) {
      return "Lütfen bir resim dosyası seçin";
    }

    if (fileType === "pdf" && file.type !== "application/pdf") {
      return "Lütfen bir PDF dosyası seçin";
    }

    if (fileType === "document") {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/csv",
      ];
      if (!allowedTypes.includes(file.type)) {
        return "Lütfen geçerli bir döküman dosyası seçin (PDF, Excel, Word, CSV)";
      }
    }

    return null;
  };

  // Upload file to backend
  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
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
      toast.success("Dosya başarıyla yüklendi!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Dosya yüklenirken bir hata oluştu"
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
      toast.error("Silinecek dosya bulunamadı");
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
        toast.info("Dosya referansı temizlendi");
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
        toast.success("Dosya kaldırıldı");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Delete failed:", errorData);
        toast.success(
          "Dosya kaldırıldı (sunucu uyarısı: " +
            (errorData.message || "dosya bulunamadı") +
            ")"
        );
        return;
      }

      toast.success("Dosya başarıyla silindi");
    } catch (error) {
      console.error("Delete error:", error);
      // Don't show error toast since we already cleared the UI
      toast.success("Dosya kaldırıldı");
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

  // Get icon based on file type
  const getFileIcon = () => {
    if (!value) {
      return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
    }

    const type = getFileType(value);
    switch (type) {
      case "pdf":
        return <FileText className="h-5 w-5 text-red-500" />;
      case "document":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
      default:
        return <ImageIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get file name from URL
  const getFileName = () => {
    if (!value) return "";
    const parts = value.split("/");
    return parts[parts.length - 1];
  };

  const renderPreview = () => {
    if (!value || value.trim() === "") return null;

    const type = getFileType(value);

    if (type === "image") {
      return (
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
          {renderUploadArea()}
        </div>
      );
    }

    // Document/PDF preview
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getFileName()}</p>
            <p className="text-xs text-muted-foreground">
              {type === "pdf" ? "PDF Dökümanı" : "Döküman"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={disabled || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {renderUploadArea()}
      </div>
    );
  };

  const renderUploadArea = () => (
    <div
      className={cn(
        "flex-1 border-2 border-dashed rounded-lg p-4 transition-colors",
        dragActive && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        !value && "w-full"
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
            getFileIcon()
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
                  {value ? "Değiştir" : "Dosya Seç"}
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
              {recommended} • Maks {maxSize}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {value && value.trim() !== "" ? renderPreview() : renderUploadArea()}
    </div>
  );
}
