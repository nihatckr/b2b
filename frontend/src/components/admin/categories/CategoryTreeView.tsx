"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCategoryLevelBadge,
  renderCategoryIcon,
  type CategoryTreeNode,
} from "@/lib/category-utils";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CategoryTreeViewProps {
  tree: CategoryTreeNode[];
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
  onToggleStatus?: (category: CategoryTreeNode) => void;
}

export function CategoryTreeView({
  tree,
  onEdit,
  onDelete,
  onToggleStatus,
}: CategoryTreeViewProps) {
  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  depth: number;
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
  onToggleStatus?: (category: CategoryTreeNode) => void;
}

function TreeNode({
  node,
  depth,
  onEdit,
  onDelete,
  onToggleStatus,
}: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const { icon: Icon, label, colorClass } = getCategoryLevelBadge(node.level);

  return (
    <div>
      {/* Node Row */}
      <div
        className={`flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 group transition-colors border border-transparent hover:border-border ${
          !node.isActive ? "opacity-60" : ""
        }`}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Icon - Show custom icon if available, otherwise default level icon */}
        {renderCategoryIcon(
          node.icon,
          node.level,
          "h-4 w-4 text-muted-foreground"
        )}

        {/* Code & Name */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
            {node.code}
          </code>
          <span className="font-medium text-foreground">{node.name}</span>
          {node.description && (
            <span className="text-sm text-muted-foreground truncate">
              {node.description}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="outline" className={colorClass}>
            {label}
          </Badge>
          {!node.isActive && (
            <Badge variant="destructive" className="text-xs">
              Pasif
            </Badge>
          )}
          {!node.isPublic && (
            <Badge variant="secondary" className="text-xs">
              Özel
            </Badge>
          )}
          {hasChildren && (
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 border-primary/20"
            >
              {node.children.length} alt
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
          {onToggleStatus && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onToggleStatus(node)}
              className="h-8"
            >
              {node.isActive ? "Devre Dışı" : "Aktifleştir"}
            </Button>
          )}
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(node)}
              className="h-8"
            >
              Düzenle
            </Button>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(node)}
              className="text-destructive h-8 hover:bg-destructive/10"
            >
              Sil
            </Button>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
