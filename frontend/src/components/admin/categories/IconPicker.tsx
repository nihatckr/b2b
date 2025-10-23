"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";
import { useState } from "react";

// Common category icons
const CATEGORY_ICONS = [
  // General
  "FolderTree",
  "Folder",
  "FolderOpen",
  "Package",
  "Box",
  "Boxes",
  "Archive",
  "Tag",
  "Tags",
  "Layers",
  "Layout",
  "LayoutGrid",
  "LayoutList",

  // Textile/Fashion specific
  "Shirt",
  "Home",
  "Store",
  "ShoppingBag",
  "ShoppingCart",
  "Warehouse",
  "Truck",
  "Package2",
  "PackageCheck",
  "PackageOpen",

  // Industry/Manufacturing
  "Factory",
  "Wrench",
  "Hammer",
  "Settings",
  "Cog",
  "Tool",
  "Scissors",
  "Ruler",
  "Palette",
  "Brush",

  // Materials/Fabric
  "Sparkles",
  "Star",
  "Circle",
  "Square",
  "Triangle",
  "Hexagon",
  "Diamond",
  "Shapes",

  // Organization
  "Grid",
  "List",
  "ListTree",
  "Network",
  "GitBranch",
  "Workflow",
  "Component",

  // Status/Action
  "Check",
  "CheckCircle",
  "AlertCircle",
  "Info",
  "Zap",
  "Target",
  "Award",
  "Badge",
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  label?: string;
  error?: string;
}

export function IconPicker({
  value = "",
  onChange,
  label = "İkon",
  error,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Get icon component
  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-5 w-5" /> : null;
  };

  // Filter icons based on search
  const filteredIcons = CATEGORY_ICONS.filter((iconName) =>
    iconName.toLowerCase().includes(search.toLowerCase())
  );

  // Convert camelCase to readable name
  const formatIconName = (name: string) => {
    return name.replace(/([A-Z])/g, " $1").trim();
  };

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start gap-2",
              !value && "text-muted-foreground",
              error && "border-red-500"
            )}
          >
            {value ? (
              <>
                {getIconComponent(value)}
                <span>{formatIconName(value)}</span>
              </>
            ) : (
              <span>İkon seçin</span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[400px] p-0" align="start">
          <div className="p-2 border-b">
            <Input
              placeholder="İkon ara... (örn: folder, shirt, package)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>

          <ScrollArea className="h-[300px]">
            <div className="grid grid-cols-4 gap-2 p-2">
              {filteredIcons.length > 0 ? (
                filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-md hover:bg-accent transition-colors",
                      value === iconName && "bg-accent ring-2 ring-primary"
                    )}
                    title={formatIconName(iconName)}
                  >
                    {getIconComponent(iconName)}
                    <span className="text-[10px] mt-1 text-muted-foreground truncate w-full text-center">
                      {formatIconName(iconName).split(" ")[0]}
                    </span>
                  </button>
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-sm text-muted-foreground">
                  İkon bulunamadı
                </div>
              )}
            </div>
          </ScrollArea>

          {value && (
            <div className="p-2 border-t">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                İkonu Temizle
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {value && !error && (
        <p className="text-xs text-muted-foreground">
          Seçili ikon:{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{value}</code>
        </p>
      )}
    </div>
  );
}
