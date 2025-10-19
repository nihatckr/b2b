"use client";

import { PermissionGate } from "@/components/auth/permission-gate";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { Edit, Plus, Shield, Trash2 } from "lucide-react";

export default function ProductionPage() {
  const { permissions } = usePermissions();

  return (
    <ProtectedRoute permission="PRODUCTION_VIEW">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header with Action Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Production Dashboard 🏭
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage production orders and workflows
            </p>
          </div>

          {/* Create Button - Only for users with PRODUCTION_CREATE permission */}
          <PermissionGate permission="PRODUCTION_CREATE">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Production Order
            </Button>
          </PermissionGate>
        </div>

        {/* Permissions Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Your Permissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {permissions.map((permission) => (
                <Badge key={permission} variant="secondary">
                  {permission}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Production Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Production Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Sample data row */}
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      #PROD-001
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      Cotton T-Shirt
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        In Progress
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      1,000 units
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Edit Button - Only for PRODUCTION_EDIT or PRODUCTION_MANAGE */}
                        <PermissionGate
                          permission={["PRODUCTION_EDIT", "PRODUCTION_MANAGE"]}
                        >
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </PermissionGate>

                        {/* Delete Button - Only for PRODUCTION_MANAGE */}
                        <PermissionGate
                          permission="PRODUCTION_MANAGE"
                          fallback={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Requires PRODUCTION_MANAGE permission"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>

                  {/* More sample rows can be added here */}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Production Management Section - Only for PRODUCTION_MANAGE permission */}
        <PermissionGate
          permission="PRODUCTION_MANAGE"
          fallback={
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Limited Access:</strong> You need PRODUCTION_MANAGE
                  permission to access advanced production management features.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-0">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">
                🎉 Advanced Production Management
              </h3>
              <p className="text-muted-foreground mb-4">
                You have full production management access! You can create,
                edit, and delete production orders.
              </p>
              <div className="flex gap-3">
                <Button>Manage Workflows</Button>
                <Button variant="secondary">Configure Settings</Button>
              </div>
            </CardContent>
          </Card>
        </PermissionGate>
      </div>
    </ProtectedRoute>
  );
}
