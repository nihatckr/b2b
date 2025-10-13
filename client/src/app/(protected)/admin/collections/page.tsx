"use client";

import {
  IconEdit,
  IconPackage,
  IconPlus,
  IconSearch,
  IconStarFilled,
  IconTrash,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useMutation, useQuery } from "urql";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import {
  Card,
  CardContent,
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
import { Switch } from "../../../../components/ui/switch";
import { Textarea } from "../../../../components/ui/textarea";
import { useAuth } from "../../../../context/AuthProvider";
import {
  CREATE_COLLECTION_MUTATION,
  DELETE_COLLECTION_MUTATION,
  UPDATE_COLLECTION_MUTATION,
} from "../../../../lib/graphql/mutations";
import {
  ALL_COLLECTIONS_QUERY,
  ALL_COMPANIES_QUERY,
  ROOT_CATEGORIES_QUERY,
} from "../../../../lib/graphql/queries";

interface CollectionData {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  sku?: string | null;
  stock: number;
  images?: string[] | null;
  isActive: boolean;
  isFeatured: boolean;
  slug?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: string; name: string } | null;
  company?: { id: string; name: string } | null;
  author?: {
    id: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  samplesCount?: number;
  ordersCount?: number;
}

interface CompanyData {
  id: string;
  name: string;
}

interface CategoryData {
  id: string;
  name: string;
}

export default function AdminCollectionsPage() {
  const { user: currentUser } = useAuth();
  const [shouldFetch, setShouldFetch] = React.useState(false);

  // Pause queries initially, then activate in useEffect
  React.useEffect(() => {
    setShouldFetch(true);
  }, []);

  // Queries
  const [
    {
      data: collectionsData,
      fetching: collectionsFetching,
      error: collectionsError,
    },
    reexecuteCollectionsQuery,
  ] = useQuery({
    query: ALL_COLLECTIONS_QUERY,
    variables: {
      isActive: undefined, // Show all for admin
    },
    requestPolicy: "network-only",
    pause: !shouldFetch,
  });

  const [{ data: companiesData }] = useQuery({
    query: ALL_COMPANIES_QUERY,
    requestPolicy: "network-only",
    pause: !shouldFetch,
  });

  const [{ data: categoriesData }] = useQuery({
    query: ROOT_CATEGORIES_QUERY,
    requestPolicy: "network-only",
    pause: !shouldFetch,
  });

  // Mutations
  const [, createCollection] = useMutation(CREATE_COLLECTION_MUTATION);
  const [, updateCollection] = useMutation(UPDATE_COLLECTION_MUTATION);
  const [, deleteCollection] = useMutation(DELETE_COLLECTION_MUTATION);

  // State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionData | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    price: 0,
    sku: "",
    stock: 0,
    images: [] as string[],
    isActive: true,
    isFeatured: false,
    slug: "",
    categoryId: "none",
    companyId: "global",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: 0,
    sku: "",
    stock: 0,
    images: [] as string[],
    isActive: true,
    isFeatured: false,
    slug: "",
    categoryId: "none",
    companyId: "global",
  });

  const collections = collectionsData?.collections || [];
  const companies = companiesData?.allCompanies || [];
  const categories = categoriesData?.rootCategories || [];

  // Filter collections based on search
  const filteredCollections = collections.filter(
    (collection: CollectionData) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      collection.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create collection
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.name.trim()) {
      return;
    }

    try {
      const result = await createCollection({
        input: {
          name: createForm.name.trim(),
          description: createForm.description.trim() || null,
          price: createForm.price || 0,
          sku: createForm.sku.trim() || null,
          stock: createForm.stock || 0,
          images: createForm.images.length > 0 ? createForm.images : null,
          isActive: createForm.isActive,
          isFeatured: createForm.isFeatured,
          slug: createForm.slug.trim() || null,
          categoryId:
            createForm.categoryId !== "none"
              ? parseInt(createForm.categoryId)
              : null,
          companyId:
            createForm.companyId !== "global"
              ? parseInt(createForm.companyId)
              : null,
        },
      });

      if (result.error) {
        console.error("Create collection error:", result.error);
        return;
      }

      // Reset form and close dialog
      setCreateForm({
        name: "",
        description: "",
        price: 0,
        sku: "",
        stock: 0,
        images: [],
        isActive: true,
        isFeatured: false,
        slug: "",
        categoryId: "none",
        companyId: "global",
      });
      setIsCreateDialogOpen(false);

      // Refetch data
      reexecuteCollectionsQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Create collection error:", error);
    }
  };

  // Handle edit collection
  const handleEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCollection || !editForm.name.trim()) {
      return;
    }

    try {
      const result = await updateCollection({
        input: {
          id: parseInt(selectedCollection.id),
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          price: editForm.price,
          sku: editForm.sku.trim() || null,
          stock: editForm.stock,
          images: editForm.images.length > 0 ? editForm.images : null,
          isActive: editForm.isActive,
          isFeatured: editForm.isFeatured,
          slug: editForm.slug.trim() || null,
          categoryId:
            editForm.categoryId !== "none"
              ? parseInt(editForm.categoryId)
              : null,
          companyId:
            editForm.companyId !== "global"
              ? parseInt(editForm.companyId)
              : null,
        },
      });

      if (result.error) {
        console.error("Update collection error:", result.error);
        return;
      }

      setIsEditDialogOpen(false);
      setSelectedCollection(null);
      reexecuteCollectionsQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Update collection error:", error);
    }
  };

  // Handle delete collection
  const handleDeleteCollection = async (id: string) => {
    try {
      const result = await deleteCollection({
        id: parseInt(id),
      });

      if (result.error) {
        console.error("Delete collection error:", result.error);
        return;
      }

      reexecuteCollectionsQuery({ requestPolicy: "network-only" });
    } catch (error) {
      console.error("Delete collection error:", error);
    }
  };

  // Open edit dialog
  const openEditDialog = (collection: CollectionData) => {
    setSelectedCollection(collection);
    setEditForm({
      name: collection.name,
      description: collection.description || "",
      price: collection.price,
      sku: collection.sku || "",
      stock: collection.stock,
      images: collection.images || [],
      isActive: collection.isActive,
      isFeatured: collection.isFeatured,
      slug: collection.slug || "",
      categoryId: collection.category?.id || "none",
      companyId: collection.company?.id || "global",
    });
    setIsEditDialogOpen(true);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  if (collectionsFetching)
    return <div className="p-4">Loading collections...</div>;
  if (collectionsError)
    return (
      <div className="p-4 text-red-500">Error: {collectionsError.message}</div>
    );

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Collection Management
          </h1>
          <p className="text-muted-foreground">
            Manage product collections and inventory
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <IconPlus size={16} />
          Add Collection
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconSearch size={20} />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search collections by name, description, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCollections.map((collection: CollectionData) => (
          <Card key={collection.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconPackage size={18} />
                    {collection.name}
                    {collection.isFeatured && (
                      <IconStarFilled size={16} className="text-yellow-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={collection.isActive ? "default" : "secondary"}
                    >
                      {collection.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {collection.isFeatured && (
                      <Badge variant="outline" className="text-yellow-600">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(collection)}
                  >
                    <IconEdit size={16} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <IconTrash size={16} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the collection &#34;{collection.name}&#34;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {collection.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {collection.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">Price:</span>
                  <p>{formatPrice(collection.price)}</p>
                </div>
                <div>
                  <span className="font-medium">Stock:</span>
                  <p>{collection.stock} units</p>
                </div>
                <div>
                  <span className="font-medium">SKU:</span>
                  <p className="font-mono">{collection.sku || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Samples:</span>
                  <p>{collection.samplesCount || 0}</p>
                </div>
              </div>

              {collection.category && (
                <div className="text-sm">
                  <span className="font-medium">Category:</span>
                  <p>{collection.category.name}</p>
                </div>
              )}

              {collection.company && (
                <div className="text-sm">
                  <span className="font-medium">Company:</span>
                  <p>{collection.company.name}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Created: {formatDate(collection.createdAt)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCollections.length === 0 && (
        <Card className="p-8 text-center">
          <IconPackage
            size={48}
            className="mx-auto mb-4 text-muted-foreground"
          />
          <h3 className="text-lg font-semibold mb-2">No collections found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "No collections match your search criteria."
              : "No collections have been created yet."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <IconPlus size={16} className="mr-2" />
              Create First Collection
            </Button>
          )}
        </Card>
      )}

      {/* Create Collection Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Collection</DialogTitle>
            <DialogDescription>
              Add a new product collection to your inventory.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCollection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Name *</Label>
                <Input
                  id="create-name"
                  placeholder="Collection name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-sku">SKU</Label>
                <Input
                  id="create-sku"
                  placeholder="Product SKU (auto-generated if empty)"
                  value={createForm.sku}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, sku: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                placeholder="Collection description"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-price">Price (₺)</Label>
                <Input
                  id="create-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={createForm.price}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-stock">Stock</Label>
                <Input
                  id="create-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={createForm.stock}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-slug">SEO Slug</Label>
              <Input
                id="create-slug"
                placeholder="seo-friendly-url"
                value={createForm.slug}
                onChange={(e) =>
                  setCreateForm({ ...createForm, slug: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={createForm.categoryId}
                  onValueChange={(value) =>
                    setCreateForm({ ...createForm, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category: CategoryData) => (
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
                    <SelectItem value="global">Global Collection</SelectItem>
                    {companies.map((company: CompanyData) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-active"
                  checked={createForm.isActive}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, isActive: checked })
                  }
                />
                <Label htmlFor="create-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-featured"
                  checked={createForm.isFeatured}
                  onCheckedChange={(checked) =>
                    setCreateForm({ ...createForm, isFeatured: checked })
                  }
                />
                <Label htmlFor="create-featured">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Create Collection</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
              Update collection information and settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditCollection} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Collection name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  placeholder="Product SKU"
                  value={editForm.sku}
                  onChange={(e) =>
                    setEditForm({ ...editForm, sku: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Collection description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₺)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={editForm.stock}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slug">SEO Slug</Label>
              <Input
                id="edit-slug"
                placeholder="seo-friendly-url"
                value={editForm.slug}
                onChange={(e) =>
                  setEditForm({ ...editForm, slug: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.categoryId}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category: CategoryData) => (
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
                    <SelectItem value="global">Global Collection</SelectItem>
                    {companies.map((company: { id: string; name: string }) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={editForm.isActive}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, isActive: checked })
                  }
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={editForm.isFeatured}
                  onCheckedChange={(checked) =>
                    setEditForm({ ...editForm, isFeatured: checked })
                  }
                />
                <Label htmlFor="edit-featured">Featured</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Update Collection</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
