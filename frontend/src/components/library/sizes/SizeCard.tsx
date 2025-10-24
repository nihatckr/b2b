import { Edit, Eye, Globe, Plus, Trash2 } from "lucide-react";
import { DashboardPlatformStandardsQuery } from "../../../__generated__/graphql";
import {
  getRegionalStandard,
  getSizeCategory,
  getSizes,
  getTargetGender,
} from "../../../lib/utils-helper";
import { Button } from "../../ui/button";
import { TabsContent } from "../../ui/tabs";

type LibraryItemType = NonNullable<
  DashboardPlatformStandardsQuery["platformStandards"]
>[0];
interface SizeCardProps {
  response: {
    fetching: boolean;
    data: {
      id: number;
      name: string;
      description?: string;
      data: Record<string, unknown>;
      isPopular?: boolean;
    }[];
  };
  role: boolean;
  setSelectedItem: (item: LibraryItemType) => void;
  setEditModalOpen: (item: boolean) => void;
  setDetailsModalOpen: (item: boolean) => void;
  setDeleteAlertOpen: (item: boolean) => void;
  title: string;
  subtitle: string;
  description: string;
  iconText: string;
  loadingText?: string;
  value: string;
}

function SizeCard({
  response,
  role,
  setSelectedItem,
  setEditModalOpen,
  setDetailsModalOpen,
  setDeleteAlertOpen,
  title,
  subtitle,
  description,
  iconText,
  loadingText,
  value,
}: SizeCardProps) {
  // Edit/Delete/Details handlers
  const handleEditItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setEditModalOpen(true);
  };
  const handleDeleteItem = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDeleteAlertOpen(true);
  };
  const handleViewDetails = (item: LibraryItemType) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  const data = response.data ?? [];

  return (
    <TabsContent value={value} className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">{subtitle}</span>
        </div>

        {response.fetching ? (
          <div className="text-center py-8 text-muted-foreground">
            {loadingText}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">{description}</p>
            {role && (
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {iconText}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((sizeGroup) => (
                <SizeGroupCardItem
                  key={sizeGroup.id}
                  sizeGroup={sizeGroup}
                  role={role}
                  onEdit={handleEditItem}
                  onView={handleViewDetails}
                  onDelete={handleDeleteItem}
                  popularText="Popular"
                  regionalText="Regional Standard"
                  genderText="Unisex"
                  categoryText="Clothing"
                  sizesText="S, M, L, XL"
                  detailsText="View Details"
                  editText="Edit"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </TabsContent>
  );
}

export default SizeCard;

function SizeGroupCardItem({
  popularText,
  regionalText,
  genderText,
  categoryText,
  sizesText,
  detailsText,
  editText,
  sizeGroup,
  role,
  onEdit,
  onView,
  onDelete,
}: {
  sizeGroup: any;
  role: boolean;
  onEdit: (item: LibraryItemType) => void;
  onView: (item: LibraryItemType) => void;
  onDelete: (item: LibraryItemType) => void;
  popularText: string;
  regionalText: string;
  genderText: string;
  categoryText: string;
  sizesText: string;
  detailsText: string;
  editText: string;
}) {
  const sizes = getSizes(sizeGroup.data);
  const category = getSizeCategory(sizeGroup.data);
  const regional = getRegionalStandard(sizeGroup.data);
  const gender = getTargetGender(sizeGroup.data);

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium">{sizeGroup.name}</h4>
        {sizeGroup.isPopular && (
          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
            {popularText}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-3">
        {regional && (
          <p>
            {" "}
            {regionalText} {regional}
          </p>
        )}
        {gender && (
          <p>
            {genderText}: {gender}
          </p>
        )}
        {category && (
          <p>
            {categoryText}: {category}
          </p>
        )}
      </div>

      {sizes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">{sizesText}</p>
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
          onClick={() => onView(sizeGroup)}
        >
          <Eye className="h-3 w-3 mr-1" />
          {detailsText}
        </Button>
        {role && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(sizeGroup)}
            >
              <Edit className="h-3 w-3 mr-1" />
              {editText}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(sizeGroup)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
