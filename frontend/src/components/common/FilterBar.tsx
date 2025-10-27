import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import React from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  /**
   * Label for the filter select
   */
  label?: string;

  /**
   * Placeholder text
   */
  placeholder: string;

  /**
   * Current selected value
   */
  value: string;

  /**
   * Options for the select
   */
  options: FilterOption[];

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Optional className
   */
  className?: string;
}

/**
 * FilterSelect Component
 *
 * Reusable select dropdown for filtering.
 */
export function FilterSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  className = "",
}: FilterSelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="text-sm font-medium mb-2 block">{label}</label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface SearchInputProps {
  /**
   * Placeholder text
   */
  placeholder: string;

  /**
   * Current search value
   */
  value: string;

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Optional className
   */
  className?: string;
}

/**
 * SearchInput Component
 *
 * Reusable search input with icon.
 */
export function SearchInput({
  placeholder,
  value,
  onChange,
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}

interface FilterBarProps {
  /**
   * Optional title for the filter bar
   */
  title?: string;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Search input configuration
   */
  search?: SearchInputProps;

  /**
   * Array of filter selects
   */
  filters?: FilterSelectProps[];

  /**
   * Optional additional actions (buttons, etc.)
   */
  actions?: React.ReactNode;

  /**
   * Number of columns for filters (responsive)
   * @default "md:grid-cols-3"
   */
  columns?: string;

  /**
   * Whether to wrap in a Card component
   * @default true
   */
  wrapped?: boolean;

  /**
   * Optional className for the container
   */
  className?: string;
}

/**
 * FilterBar Component
 *
 * Reusable filter bar with search, selects, and actions.
 * Can be wrapped in a Card or used standalone.
 *
 * @example
 * ```tsx
 * <FilterBar
 *   title="Filters"
 *   description="Filter and search users"
 *   search={{
 *     placeholder: "Search by name or email...",
 *     value: searchTerm,
 *     onChange: setSearchTerm,
 *   }}
 *   filters={[
 *     {
 *       placeholder: "Role",
 *       value: roleFilter,
 *       options: roleOptions,
 *       onChange: setRoleFilter,
 *     },
 *     {
 *       placeholder: "Status",
 *       value: statusFilter,
 *       options: statusOptions,
 *       onChange: setStatusFilter,
 *     },
 *   ]}
 *   actions={<Button>Export</Button>}
 * />
 * ```
 */
export function FilterBar({
  title,
  description,
  search,
  filters = [],
  actions,
  columns = "md:grid-cols-3",
  wrapped = true,
  className = "",
}: FilterBarProps) {
  const content = (
    <>
      {(title || description) && wrapped && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <div className={wrapped ? "" : className}>
        <div
          className={`grid grid-cols-1 ${columns} gap-4 ${!wrapped ? "" : ""}`}
        >
          {/* Search Input */}
          {search && <SearchInput {...search} />}

          {/* Filter Selects */}
          {filters.map((filter, index) => (
            <FilterSelect key={index} {...filter} />
          ))}

          {/* Additional Actions */}
          {actions && <div className="flex items-end">{actions}</div>}
        </div>
      </div>
    </>
  );

  if (wrapped) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return <div className={className}>{content}</div>;
}
