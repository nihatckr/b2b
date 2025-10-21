"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  CATEGORY_LEVEL_LABELS,
  suggestCategoryCode,
  type CategoryFormData,
} from "@/lib/category-utils";
import { createCategorySchema } from "@/lib/zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { IconPicker } from "./IconPicker";

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData> & { id?: string };
  parentCategories?: Array<{
    id: string;
    code: string;
    name: string;
    level: string;
    parentCategory?: { id: string } | null;
  }>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CategoryForm({
  initialData,
  parentCategories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  // Create Zod schema with validation options
  const categorySchema = useMemo(
    () =>
      createCategorySchema({
        existingCategories: parentCategories.map((cat) => ({
          id: cat.id,
          code: cat.code,
          level: cat.level,
          parentCategory: cat.parentCategory || null,
        })),
        currentCategoryId: initialData?.id,
      }),
    [parentCategories, initialData?.id]
  );

  // React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      level: initialData?.level || "ROOT",
      order: initialData?.order || 0,
      icon: initialData?.icon || "",
      image: initialData?.image || "",
      parentId: initialData?.parentId,
      keywords: initialData?.keywords || "",
      tags: initialData?.tags || "",
      isActive: initialData?.isActive ?? true,
      isPublic: initialData?.isPublic ?? true,
    },
    mode: "onChange", // Real-time validation
  });

  const formLevel = watch("level");
  const formParentId = watch("parentId");

  // Auto-suggest code when level or parent changes
  useEffect(() => {
    if (!initialData?.id && formLevel) {
      const parent = parentCategories.find(
        (p) => p.id === String(formParentId)
      );
      const suggestedCode = suggestCategoryCode(
        parent?.code || null,
        formLevel,
        parentCategories.filter((p) => p.level === formLevel).length
      );
      setValue("code", suggestedCode);
    }
  }, [formLevel, formParentId, parentCategories, initialData?.id, setValue]);

  const onSubmitForm = async (data: CategoryFormData) => {
    await onSubmit(data);
  };

  // Filter parent categories based on selected level
  const availableParents = parentCategories.filter((p) => {
    const levelHierarchy = ["ROOT", "MAIN", "SUB", "DETAIL"];
    const currentLevelIndex = levelHierarchy.indexOf(formLevel);
    const parentLevelIndex = levelHierarchy.indexOf(p.level);
    return parentLevelIndex < currentLevelIndex;
  });

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {/* Code and Level Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">
            Kategori Kodu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="TEX-001"
            className={errors.code ? "border-red-500" : ""}
            disabled={!!initialData?.id}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase();
              register("code").onChange(e);
            }}
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">
            Seviye <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formLevel}
            onValueChange={(value) => setValue("level", value as any)}
            disabled={!!initialData?.id}
          >
            <SelectTrigger className={errors.level ? "border-red-500" : ""}>
              <SelectValue placeholder="Seviye seçin" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LEVEL_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-red-500">{errors.level.message}</p>
          )}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Kategori Adı <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Tekstil"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Kategori hakkında açıklama..."
          rows={3}
          className={errors.description ? "border-red-500" : ""}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Parent Category */}
      {formLevel !== "ROOT" && availableParents.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="parentId">Ana Kategori</Label>
          <Select
            value={watch("parentId")?.toString() || "none"}
            onValueChange={(value) =>
              setValue("parentId", value === "none" ? undefined : Number(value))
            }
          >
            <SelectTrigger className={errors.parentId ? "border-red-500" : ""}>
              <SelectValue placeholder="Ana kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Yok</SelectItem>
              {availableParents.map((parent) => (
                <SelectItem key={parent.id} value={parent.id}>
                  {parent.code} - {parent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parentId && (
            <p className="text-sm text-red-500">{errors.parentId.message}</p>
          )}
        </div>
      )}

      {/* Order and Icon Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Sıralama</Label>
          <Input
            id="order"
            type="number"
            {...register("order", { valueAsNumber: true })}
            min={0}
            max={9999}
            className={errors.order ? "border-red-500" : ""}
          />
          {errors.order && (
            <p className="text-sm text-red-500">{errors.order.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <IconPicker
            value={watch("icon") || ""}
            onChange={(icon) => setValue("icon", icon)}
            label="İkon"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Etiketler</Label>
        <Input
          id="tags"
          {...register("tags")}
          placeholder="#tekstil #giyim #fabric"
        />
        <p className="text-xs text-muted-foreground">
          # ile başlayan etiketler, boşlukla ayırın
        </p>
      </div>

      {/* Keywords (JSON) */}
      <div className="space-y-2">
        <Label htmlFor="keywords">Anahtar Kelimeler (JSON)</Label>
        <Textarea
          id="keywords"
          {...register("keywords")}
          placeholder='["tekstil", "kumaş", "fabric", "textile"]'
          rows={2}
          className={errors.keywords ? "border-red-500" : ""}
        />
        {errors.keywords && (
          <p className="text-sm text-red-500">{errors.keywords.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          JSON array formatında: ["kelime1", "kelime2"]
        </p>
      </div>

      {/* Switches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="isActive" className="cursor-pointer">
            Aktif
          </Label>
          <Switch
            id="isActive"
            checked={watch("isActive")}
            onCheckedChange={(checked) => setValue("isActive", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isPublic" className="cursor-pointer">
            Herkese Açık
          </Label>
          <Switch
            id="isPublic"
            checked={watch("isPublic")}
            onCheckedChange={(checked) => setValue("isPublic", checked)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Kaydediliyor..."
            : initialData?.id
            ? "Güncelle"
            : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
