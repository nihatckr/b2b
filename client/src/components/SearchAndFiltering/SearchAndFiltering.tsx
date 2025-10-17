"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import React from "react";

export interface FilterOption {
  value: string;
  label: string;
  data?: any; // For additional data like hex color, etc.
}

export interface FilterConfig {
  id: string;
  label: string;
  placeholder: string;
  width: string; // e.g., "w-[140px]"
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  showWhen?: boolean; // Optional condition to show/hide filter
  renderOption?: (option: FilterOption) => React.ReactNode; // Custom option renderer
}

export interface SecondaryFilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface SearchAndFilteringProps {
  // Search
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;

  // Filters
  filters: FilterConfig[];

  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // Clear all
  hasActiveFilters: boolean;
  onClearAll: () => void;

  // Secondary filters (shown as chips below main bar)
  secondaryFilterChips?: SecondaryFilterChip[];

  // Results info
  resultsCount: number;
  totalCount: number;
  showPagination?: boolean;
}

export const SearchAndFiltering: React.FC<SearchAndFilteringProps> = ({
  searchValue,
  searchPlaceholder = "Ara...",
  onSearchChange,
  filters,
  currentPage,
  totalPages,
  onPageChange,
  hasActiveFilters,
  onClearAll,
  secondaryFilterChips = [],
  resultsCount,
  totalCount,
  showPagination = true,
}) => {
  return (
    <div className="space-y-4">
      {/* Filters Bar - Horizontal Layout with Search and Pagination */}
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left Side: Filters */}
          <div className="flex items-center gap-3">
            {/* Filters with Labels */}
            {filters
              .filter((filter) => filter.showWhen !== false)
              .map((filter) => (
                <div key={filter.id} className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    {filter.label}
                  </label>
                  <Select value={filter.value} onValueChange={filter.onChange}>
                    <SelectTrigger
                      className={`${filter.width} h-9 ${
                        filter.value !== "ALL" ? "border-primary" : ""
                      }`}
                    >
                      <SelectValue placeholder={filter.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tümü</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {filter.renderOption
                            ? filter.renderOption(option)
                            : option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-transparent">
                  Block
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearAll}
                  className="whitespace-nowrap h-9"
                >
                  Temizle
                </Button>
              </div>
            )}
          </div>

          {/* Right Side: Search + Pagination */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Pagination */}
            {showPagination && totalPages > 1 && (
              <>
                <div className="h-8 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        const showEllipsis =
                          (page === 2 && currentPage > 3) ||
                          (page === totalPages - 1 && currentPage < totalPages - 2);

                        if (showEllipsis) {
                          return (
                            <span
                              key={page}
                              className="px-2 text-sm text-muted-foreground"
                            >
                              ...
                            </span>
                          );
                        }

                        if (!showPage) return null;

                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => onPageChange(page)}
                            className="h-8 w-8 p-0"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onPageChange(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Secondary Filter Chips (Below main bar) */}
        {secondaryFilterChips.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t">
            <span className="text-xs text-muted-foreground">Diğer filtreler:</span>
            {secondaryFilterChips.map((chip) => (
              <button
                key={chip.id}
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-background rounded text-xs border hover:bg-accent transition-colors"
              >
                {chip.label}: {chip.value} <span>×</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {resultsCount} sonuç bulundu
          {totalCount !== resultsCount && ` (${totalCount} toplam)`}
          {showPagination && totalPages > 1 && ` • Sayfa ${currentPage} / ${totalPages}`}
        </span>
      </div>
    </div>
  );
};
