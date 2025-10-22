"use client";
import { CollectionsListDocument } from "@/__generated__/graphql";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Calendar, Eye, Plus, Search, Star } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "urql";

export default function CollectionsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const take = 12;

  const [{ data, fetching, error }, refetchCollections] = useQuery({
    query: CollectionsListDocument,
    variables: {
      skip,
      take,
      search: search || undefined,
      featured,
    },
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSkip(0); // Reset pagination when searching
  };

  const nextPage = () => setSkip(skip + take);
  const prevPage = () => setSkip(Math.max(0, skip - take));

  return (
    <div className="p-6 space-y-6">
      {/* Create Collection Modal */}
      <CreateCollectionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          refetchCollections({ requestPolicy: "network-only" });
        }}
      />

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Collections</h1>
          <p className="text-muted-foreground">
            Manage your product collections and catalogs
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Collection
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search collections by name or model code..."
              className="pl-10"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          {/* Featured Filter */}
          <div className="flex gap-2">
            <Button
              variant={featured === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setFeatured(undefined)}
            >
              All Collections
            </Button>
            <Button
              variant={featured === true ? "default" : "outline"}
              size="sm"
              onClick={() => setFeatured(true)}
            >
              <Star className="mr-1 h-3 w-3" />
              Featured Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {fetching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Error loading collections:</span>
              <span>{error.message}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collections Grid */}
      {data?.collections && !fetching && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.collections.map((collection) => (
              <Card
                key={collection.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() =>
                  router.push(`/dashboard/collections/${collection.id}`)
                }
              >
                {/* Collection Image */}
                <div className="aspect-video bg-muted relative overflow-hidden rounded-t-lg">
                  {(() => {
                    try {
                      const imageUrl = collection.images
                        ? JSON.parse(collection.images)[0]
                        : null;
                      return imageUrl ? (
                        <Image
                          src={
                            imageUrl.startsWith("/")
                              ? `http://localhost:4001${imageUrl}`
                              : imageUrl
                          }
                          alt={collection.name || "Collection image"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Eye className="h-8 w-8" />
                        </div>
                      );
                    } catch {
                      return (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <Eye className="h-8 w-8" />
                        </div>
                      );
                    }
                  })()}

                  {/* Featured Badge */}
                  {collection.isFeatured && (
                    <Badge className="absolute top-2 right-2 bg-yellow-500 hover:bg-yellow-600">
                      <Star className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  )}

                  {/* Status Badge */}
                  <Badge
                    variant={collection.isActive ? "default" : "secondary"}
                    className="absolute top-2 left-2"
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Collection Info */}
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {collection.modelCode}
                      </p>
                    </div>

                    {collection.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {collection.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      {collection.season && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{collection.season}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        <span>{collection.viewCount || 0} views</span>
                      </div>
                    </div>

                    {collection.company && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        <span>by {collection.company.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <Button variant="outline" disabled={skip === 0} onClick={prevPage}>
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">
              Showing {skip + 1}-
              {Math.min(skip + take, skip + (data.collections?.length || 0))}{" "}
              results
            </span>
            <Button
              variant="outline"
              disabled={!data.collections || data.collections.length < take}
              onClick={nextPage}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Empty State */}
      {data?.collections && data.collections.length === 0 && !fetching && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">No collections found</h3>
                <p className="text-muted-foreground mb-4">
                  {search
                    ? `No collections match "${search}". Try adjusting your search.`
                    : "Get started by creating your first collection."}
                </p>
                <Button onClick={() => setCreateModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Collection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
