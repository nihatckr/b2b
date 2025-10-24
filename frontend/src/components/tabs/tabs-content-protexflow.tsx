import { Edit, Eye, Globe, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { TabsContent } from "../ui/tabs";

interface TabsContentProtexflowProps {
  platformResult: {
    fetching: boolean;
    data: Array<{
      id: string;
      name: string;
      description?: string;
      isPopular: boolean;
      data: any[];
    }>;
  };
  isAdmin: boolean;
  handleViewDetails: (sizeGroup: any) => void;
  handleEditItem: (sizeGroup: any) => void;
  handleDeleteItem: (sizeGroup: any) => void;
}

const TabsContentProtexflow = () => {
  return (
    <TabsContent value="platform" className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold">Platform Standards</h3>
          <span className="text-sm text-muted-foreground">
            (Visible to all users)
          </span>
        </div>

        {platformResult.fetching ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading size groups...
          </div>
        ) : platformData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">
              No platform standard size groups yet
            </p>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add First Standard Size Group
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformData.map((sizeGroup) => {
              const sizes = getSizes(sizeGroup.data);
              const category = getSizeCategory(sizeGroup.data);
              const regional = getRegionalStandard(sizeGroup.data);
              const gender = getTargetGender(sizeGroup.data);

              return (
                <div
                  key={sizeGroup.id}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{sizeGroup.name}</h4>
                    {sizeGroup.isPopular && (
                      <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground mb-3">
                    {regional && <p>Region: {regional}</p>}
                    {gender && <p>Gender: {gender}</p>}
                    {category && <p>Category: {category}</p>}
                  </div>

                  {sizes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        Sizes:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {sizes.map((size: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {sizeGroup.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {sizeGroup.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(sizeGroup)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(sizeGroup)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteItem(sizeGroup)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TabsContent>
  );
};

export default TabsContentProtexflow;
