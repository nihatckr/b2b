"use client";

import { PermissionGate } from "@/components/auth/permission-gate";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import { CheckCircle, Shield, XCircle } from "lucide-react";

export default function QualityPage() {
  const { permissions } = usePermissions();

  return (
    <ProtectedRoute permission="QUALITY_VIEW">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Quality Control Dashboard ✅
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage quality checks and approvals
          </p>
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

        {/* Pending Quality Checks */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Check ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {/* Sample data row 1 */}
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      #QC-001
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      Cotton T-Shirt
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      BATCH-2024-01
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      2 hours ago
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* Approve Button - Only for QUALITY_APPROVE */}
                        <PermissionGate
                          permission="QUALITY_APPROVE"
                          fallback={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Requires QUALITY_APPROVE permission"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-600"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                        </PermissionGate>

                        {/* Reject Button - Only for QUALITY_REJECT */}
                        <PermissionGate
                          permission="QUALITY_REJECT"
                          fallback={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              title="Requires QUALITY_REJECT permission"
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>

                  {/* Sample data row 2 */}
                  <tr className="hover:bg-muted/50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      #QC-002
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      Denim Jeans
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      BATCH-2024-02
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      5 hours ago
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <PermissionGate permission="QUALITY_APPROVE">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-600"
                            title="Approve"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </Button>
                        </PermissionGate>

                        <PermissionGate permission="QUALITY_REJECT">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            title="Reject"
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quality Approval Authority - Only for QUALITY_APPROVE and QUALITY_REJECT */}
        <PermissionGate
          permission={["QUALITY_APPROVE", "QUALITY_REJECT"]}
          requireAll
          fallback={
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
              <CardContent className="pt-6">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Limited Access:</strong> You need both QUALITY_APPROVE
                  and QUALITY_REJECT permissions to access quality approval
                  features.
                </p>
              </CardContent>
            </Card>
          }
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-0">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-2">
                ✅ Quality Approval Authority
              </h3>
              <p className="text-muted-foreground mb-4">
                You have full quality control approval authority! You can
                approve or reject quality checks.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      24
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Approved Today
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      3
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Rejected Today
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      5
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Pending Review
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </PermissionGate>
      </div>
    </ProtectedRoute>
  );
}
