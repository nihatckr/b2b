"use client";
import { cn } from "@/lib/utils";
import { Loader2, Upload, X } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState } from "react";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  disabled?: boolean;
  onUpload?: (file: File) => Promise<string>;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
  disabled = false,
  onUpload,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onUpload) {
      console.log("❌ No files or onUpload handler");
      return;
    }

    console.log(`📤 Uploading ${files.length} files...`);
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => onUpload(file));
      const uploadedPaths = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedPaths].slice(0, maxImages);

      console.log("✅ Uploaded paths:", uploadedPaths);
      console.log("✅ New images array:", newImages);

      onChange(newImages);
    } catch (error) {
      console.error("❌ Upload failed:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => {
          console.log(`🖼️ Rendering image ${index}:`, image);
          return (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border bg-gray-100"
            >
              <NextImage
                width={500}
                height={500}
                quality={100}
                loading="lazy"
                src={image.replace(/\/\//g, "/")}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(`❌ Image load error for ${image}:`, e);
                }}
                onLoad={() => {
                  console.log(`✅ Image loaded successfully: ${image}`);
                }}
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}

        {canAddMore && !disabled && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "relative aspect-square rounded-lg border-2 border-dashed",
              "flex flex-col items-center justify-center",
              "hover:border-primary hover:bg-primary/5 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Resim Ekle</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />

      <p className="text-sm text-gray-500">
        {images.length} / {maxImages} resim yüklendi
      </p>
    </div>
  );
}
