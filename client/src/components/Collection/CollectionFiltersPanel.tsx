"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter, Search, X } from "lucide-react";
import { useState } from "react";

interface CollectionFilters {
  search?: string;
  location?: string;
  manufacturerName?: string;
  season?: string;
  gender?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  trend?: string;
}

interface CollectionFiltersProps {
  filters: CollectionFilters;
  onFiltersChange: (filters: CollectionFilters) => void;
  locations?: string[];
  manufacturers?: Array<{ id: number; name: string }>;
  categories?: Array<{ id: number; name: string }>;
}

const seasons = ["SS25", "FW25", "SS26", "FW26", "SS27", "FW27"];
const genders = ["WOMEN", "MEN", "GIRLS", "BOYS", "UNISEX"];
const trends = [
  "Minimalist",
  "Vintage",
  "Sport Chic",
  "Y2K",
  "Bohemian",
  "Classic",
  "Modern",
  "Casual",
];

export function CollectionFiltersPanel({
  filters,
  onFiltersChange,
  locations = [],
  manufacturers = [],
  categories = [],
}: CollectionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<CollectionFilters>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof CollectionFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const removeFilter = (key: keyof CollectionFilters) => {
    const newFilters = { ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFiltersChange({});
  };

  const activeFiltersCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof CollectionFilters] !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Ürün, model kodu veya açıklama ara..."
          value={localFilters.search || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Toggle Filters Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Filtreler</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount}</Badge>
          )}
        </div>
      </Button>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {localFilters.location && (
            <Badge variant="secondary" className="gap-1">
              Lokasyon: {localFilters.location}
              <button
                onClick={() => removeFilter("location")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {localFilters.manufacturerName && (
            <Badge variant="secondary" className="gap-1">
              Üretici: {localFilters.manufacturerName}
              <button
                onClick={() => removeFilter("manufacturerName")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {localFilters.season && (
            <Badge variant="secondary" className="gap-1">
              Sezon: {localFilters.season}
              <button
                onClick={() => removeFilter("season")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {localFilters.gender && (
            <Badge variant="secondary" className="gap-1">
              Cinsiyet: {localFilters.gender}
              <button
                onClick={() => removeFilter("gender")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {localFilters.trend && (
            <Badge variant="secondary" className="gap-1">
              Trend: {localFilters.trend}
              <button
                onClick={() => removeFilter("trend")}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 text-xs"
          >
            Tümünü Temizle
          </Button>
        </div>
      )}

      {/* Filters Panel */}
      {isOpen && (
        <Card className="p-4">
          <Accordion type="multiple" className="w-full">
            {/* Manufacturer Filters */}
            <AccordionItem value="manufacturer">
              <AccordionTrigger className="text-sm font-semibold">
                Üretici Bilgileri
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs">
                    Lokasyon/Şehir
                  </Label>
                  <Select
                    value={localFilters.location || ""}
                    onValueChange={(value) =>
                      value ? updateFilter("location", value) : removeFilter("location")
                    }
                  >
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Lokasyon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Manufacturer Name */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer" className="text-xs">
                    Üretici İsmi
                  </Label>
                  <Select
                    value={localFilters.manufacturerName || ""}
                    onValueChange={(value) =>
                      value
                        ? updateFilter("manufacturerName", value)
                        : removeFilter("manufacturerName")
                    }
                  >
                    <SelectTrigger id="manufacturer">
                      <SelectValue placeholder="Üretici seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {manufacturers.map((manufacturer) => (
                        <SelectItem
                          key={manufacturer.id}
                          value={manufacturer.name}
                        >
                          {manufacturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Product Properties */}
            <AccordionItem value="properties">
              <AccordionTrigger className="text-sm font-semibold">
                Ürün Özellikleri
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                {/* Season */}
                <div className="space-y-2">
                  <Label htmlFor="season" className="text-xs">
                    Sezon
                  </Label>
                  <Select
                    value={localFilters.season || ""}
                    onValueChange={(value) =>
                      value ? updateFilter("season", value) : removeFilter("season")
                    }
                  >
                    <SelectTrigger id="season">
                      <SelectValue placeholder="Sezon seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {seasons.map((season) => (
                        <SelectItem key={season} value={season}>
                          {season}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-xs">
                    Cinsiyet
                  </Label>
                  <Select
                    value={localFilters.gender || ""}
                    onValueChange={(value) =>
                      value ? updateFilter("gender", value) : removeFilter("gender")
                    }
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Cinsiyet seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {genders.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trend */}
                <div className="space-y-2">
                  <Label htmlFor="trend" className="text-xs">
                    Trend
                  </Label>
                  <Select
                    value={localFilters.trend || ""}
                    onValueChange={(value) =>
                      value ? updateFilter("trend", value) : removeFilter("trend")
                    }
                  >
                    <SelectTrigger id="trend">
                      <SelectValue placeholder="Trend seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      {trends.map((trend) => (
                        <SelectItem key={trend} value={trend}>
                          {trend}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category */}
                {categories.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs">
                      Kategori
                    </Label>
                    <Select
                      value={localFilters.categoryId?.toString() || ""}
                      onValueChange={(value) =>
                        value
                          ? updateFilter("categoryId", parseInt(value))
                          : removeFilter("categoryId")
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Price Range */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-semibold">
                Fiyat Aralığı
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="flex gap-2">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="minPrice" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="$0"
                      value={localFilters.minPrice || ""}
                      onChange={(e) =>
                        updateFilter(
                          "minPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="maxPrice" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="$1000"
                      value={localFilters.maxPrice || ""}
                      onChange={(e) =>
                        updateFilter(
                          "maxPrice",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      )}
    </div>
  );
}
