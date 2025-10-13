"use client";

import {
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconFolder,
  IconFolderPlus,
  IconPlus,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useMutation, useQuery } from "urql";

import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { useAuth } from "../../../../context/AuthProvider";
import {
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  UPDATE_CATEGORY_MUTATION,
} from "../../../../lib/graphql/mutations";
import {
  ALL_COMPANIES_QUERY,
  ROOT_CATEGORIES_QUERY,
} from "../../../../lib/graphql/queries";

interface CategoryData {
  id: string;
  name: string;
  description?: string | null;
  collectionsCount: number;
  author?: { id: string; name?: string | null };
  company?: { id: string; name: string };
  parentCategory?: { id: string; name: string };
  subCategories?: CategoryData[];
  createdAt: string;
  updatedAt: string;
}

interface CompanyData {
  id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const { user: currentUser } = useAuth();
  const [shouldFetch, setShouldFetch] = React.useState(false);

  // Pause queries initially, then activate in useEffect
  React.useEffect(() => {
    setShouldFetch(true);
  }, []);

  // Queries
  const [result, reexecuteQuery] = useQuery({
    query: ROOT_CATEGORIES_QUERY,
    requestPolicy: "network-only",
    pause: !shouldFetch,
  });
  const { data, error, fetching } = result;

  // Companies for dropdown
  const [companiesResult] = useQuery({
    query: ALL_COMPANIES_QUERY,
    requestPolicy: "network-only",
    pause: !shouldFetch,
  });
  const companies = (companiesResult.data?.allCompanies || []) as CompanyData[];

  // Mutations
  const [, createCategory] = useMutation(CREATE_CATEGORY_MUTATION);
  const [, updateCategory] = useMutation(UPDATE_CATEGORY_MUTATION);
  const [, deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryData | null>(
    null
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  // Form states
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    parentCategoryId: "none",
    companyId: "global",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    parentCategoryId: "",
    companyId: "",
  });

  // Get categories data
  const categories = (data?.rootCategories || []) as CategoryData[];

  // Flatten categories for search and parent selection
  const flattenCategories = (cats: CategoryData[]): CategoryData[] => {
    const flattened: CategoryData[] = [];

    const flatten = (category: CategoryData, depth = 0) => {
      flattened.push({ ...category, name: "  ".repeat(depth) + category.name });
      if (category.subCategories) {
        category.subCategories.forEach((sub) => flatten(sub, depth + 1));
      }
    };

    cats.forEach((cat) => flatten(cat));
    return flattened;
  };

  const allCategories = flattenCategories(categories);

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle category expansion
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      return;
    }

    try {
      const result = await createCategory({
        name: createForm.name.trim(),
        description: createForm.description.trim() || null,
        parentCategoryId:
          createForm.parentCategoryId && createForm.parentCategoryId !== "none"
            ? parseInt(createForm.parentCategoryId)
            : null,
        companyId:
          createForm.companyId && createForm.companyId !== "global"
            ? parseInt(createForm.companyId)
            : null,
      });

      if (result.error) {
        console.error("Create category error:", result.error);
        return;
      }

      // Reset form and close dialog
      setCreateForm({
        name: "",
        description: "",
        parentCategoryId: "none",
        companyId: "global",
      });
      setIsCreateDialogOpen(false);

      // Refetch data
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Create category error:", error);
    }
  };

  // Handle edit category
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !editForm.name.trim()) {
      return;
    }

    try {
      const result = await updateCategory({
        id: parseInt(selectedCategory.id),
        name: editForm.name.trim(),
        description: editForm.description.trim() || null,
        parentCategoryId:
          editForm.parentCategoryId && editForm.parentCategoryId !== "none"
            ? parseInt(editForm.parentCategoryId)
            : null,
        companyId:
          editForm.companyId && editForm.companyId !== "global"
            ? parseInt(editForm.companyId)
            : null,
      });

      if (result.error) {
        console.error("Update category error:", result.error);
        return;
      }

      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Update category error:", error);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      const result = await deleteCategory({
        id: parseInt(categoryToDelete.id),
      });

      if (result.error) {
        console.error("Delete category error:", result.error);
        return;
      }

      setCategoryToDelete(null);
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Delete category error:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (category: CategoryData) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || "",
      parentCategoryId: category.parentCategory?.id || "none",
      companyId: category.company?.id || "global",
    });
    setIsEditDialogOpen(true);
  };

  // Render category row recursively
  const renderCategoryRow = (category: CategoryData, depth = 0) => {
    const hasSubCategories =
      category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <React.Fragment key={category.id}>
        <TableRow>
          <TableCell className="font-medium">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${depth * 20}px` }}
            >
              {hasSubCategories ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 mr-2"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {isExpanded ? (
                    <IconChevronDown className="h-4 w-4" />
                  ) : (
                    <IconChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6 mr-2" />
              )}
              <IconFolder className="h-4 w-4 mr-2 text-muted-foreground" />
              {category.name}
            </div>
          </TableCell>
          <TableCell>{category.description || "—"}</TableCell>
          <TableCell>
            <Badge variant="secondary">
              {category.collectionsCount} collections
            </Badge>
          </TableCell>
          <TableCell>{category.company?.name || "Global"}</TableCell>
          <TableCell>{category.author?.name || "System"}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditDialog(category)}
              >
                <IconEdit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCategoryToDelete(category)}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasSubCategories &&
          isExpanded &&
          category.subCategories!.map((subCategory) =>
            renderCategoryRow(subCategory, depth + 1)
          )}
      </React.Fragment>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading categories: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Category Management</h1>
          <p className="text-muted-foreground">
            Organize products with hierarchical categories
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <IconPlus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your products.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Category Name</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Input
                  id="create-description"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter category description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-parent">Parent Category</Label>
                <Select
                  value={createForm.parentCategoryId}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, parentCategoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No Parent (Root Category)
                    </SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-company">Company</Label>
                <Select
                  value={createForm.companyId}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, companyId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global Category</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit">Create Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconFolderPlus className="h-5 w-5 mr-2" />
            Categories ({categories.length} root categories)
          </CardTitle>
          <CardDescription>
            Hierarchical organization of product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Collections</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) =>
                  renderCategoryRow(category)
                )}
                {filteredCategories.length === 0 && !fetching && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      No categories found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCategory} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Category Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                placeholder="Enter category name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter category description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Category</Label>
              <Select
                value={editForm.parentCategoryId}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, parentCategoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    No Parent (Root Category)
                  </SelectItem>
                  {allCategories
                    .filter((cat) => cat.id !== selectedCategory?.id) // Prevent self-parent
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Select
                value={editForm.companyId}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, companyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global Category</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Update Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category &ldquo;{categoryToDelete?.name}&rdquo; and it may affect
              related collections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
