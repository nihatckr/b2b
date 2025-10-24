import { Ruler } from "lucide-react";
import React from "react";
import {
  getRegionalStandard,
  getSizeCategory,
  getSizes,
  getTargetGender,
} from "../../../lib/utils-helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";

export interface LibraryItem {
  code: string;
  name: string;
  description: string;
  data: Record<string, unknown>;
  imageFile?: File;
  imageUrl?: string; // 🖼️ Existing image URL (for edit mode)
  iconValue?: string; // 🎨 Custom icon URL (for certification icons)
  certificationIds?: number[]; // 🔗 Certification IDs
  tags?: string; // 🏷️ JSON stringified tags for certification categories
  createdAt?: string | Date; // 🕒 Created timestamp
  updatedAt?: string | Date; // 🕒 Updated timestamp
}

interface SizeDetailProps {
  detailsModalOpen: boolean;
  setDetailsModalOpen: (open: boolean) => void;
  initialData?: Partial<LibraryItem>; // For edit mode
}

const SizeDetail: React.FC<SizeDetailProps> = ({
  detailsModalOpen,
  setDetailsModalOpen,
  initialData,
}) => {
  return (
    <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-purple-600" />
            {initialData?.name}
          </DialogTitle>
        </DialogHeader>
        {initialData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Name
                </h4>
                <p>{initialData.name}</p>
              </div>
              {initialData.code && (
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                    Code
                  </h4>
                  <p className="font-mono text-sm">{initialData.code}</p>
                </div>
              )}
            </div>

            {initialData.description && (
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  Description
                </h4>
                <p className="text-sm">{initialData.description}</p>
              </div>
            )}

            {(() => {
              const sizes = getSizes(initialData.data);
              const category = getSizeCategory(initialData.data);
              const regional = getRegionalStandard(initialData.data);
              const gender = getTargetGender(initialData.data);

              return (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {regional && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Regional Standard
                        </h4>
                        <p>{regional}</p>
                      </div>
                    )}

                    {gender && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                          Target Gender
                        </h4>
                        <p>{gender}</p>
                      </div>
                    )}
                  </div>

                  {category && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Category
                      </h4>
                      <p>{category}</p>
                    </div>
                  )}

                  {sizes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                        Sizes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((size: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-muted-foreground mb-1">
                    Created
                  </h4>
                  <p>
                    {initialData.createdAt &&
                      new Date(initialData.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-muted-foreground mb-1">
                    Updated
                  </h4>
                  <p>
                    {initialData.updatedAt &&
                      new Date(initialData.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SizeDetail;
