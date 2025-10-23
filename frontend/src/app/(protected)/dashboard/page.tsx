"use client";

import {
  SettingsGetMyCompanyDocument,
  SettingsResendVerificationEmailDocument,
} from "@/__generated__/graphql";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import {
  AlertTriangle,
  ArrowRight,
  ClipboardCheck,
  Factory,
  Mail,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { departmentLabel, permissions } = usePermissions();
  const [showEmailAlert, setShowEmailAlert] = useState(false);
  const [showCompanyAlert, setShowCompanyAlert] = useState(false);

  const isCompanyOwner = session?.user?.isCompanyOwner || false;
  const hasCompanyId = !!session?.user?.companyId;

  // URQL Queries & Mutations
  const [{ data: companyData }] = useQuery({
    query: SettingsGetMyCompanyDocument,
    pause: !isCompanyOwner || !hasCompanyId,
  });

  const [{ fetching: isResendingEmail }, resendEmailMutation] = useMutation(
    SettingsResendVerificationEmailDocument
  );

  // Email verification durumunu kontrol et
  useEffect(() => {
    if (session?.user) {
      const isVerified = session.user.emailVerified || false;
      setShowEmailAlert(!isVerified);

      // Debug log
      console.log("📊 Dashboard Session Update:", {
        emailVerified: session.user.emailVerified,
        showAlert: !isVerified,
      });
    }
  }, [session?.user?.emailVerified]); // Session emailVerified değişince güncelle

  // Company bilgilerini kontrol et
  useEffect(() => {
    if (companyData?.myCompany) {
      const company = companyData.myCompany;
      // Temel bilgiler eksikse uyarı göster
      const isIncomplete =
        !company.email ||
        !company.phone ||
        !company.website ||
        !company.address ||
        company.name?.includes("'s Company"); // Placeholder name kontrolü

      setShowCompanyAlert(!!isIncomplete);
      console.log("🏢 Company check:", { isIncomplete, company });
    } else if (isCompanyOwner && hasCompanyId) {
      // Company bulunamadı, kesinlikle doldurması gerek
      setShowCompanyAlert(true);
    }
  }, [companyData, isCompanyOwner, hasCompanyId]);

  const resendVerificationEmail = async () => {
    const result = await resendEmailMutation({});

    if (result.error) {
      toast.error(result.error.message || "Email gönderilemedi");
    } else if (result.data) {
      toast.success(
        "Doğrulama emaili gönderildi! 📧 Lütfen email adresinizi kontrol edin."
      );
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Email Verification Warning */}
      {showEmailAlert && (
        <Alert
          variant="destructive"
          className="border-red-200 dark:border-red-900"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email Doğrulaması Gerekli</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Hesabınızı tam olarak kullanabilmek için email adresinizi
              doğrulamanız gerekmektedir. Lütfen gelen kutunuzu kontrol edin ve
              doğrulama linkine tıklayın.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resendVerificationEmail}
              disabled={isResendingEmail}
              className="ml-4 whitespace-nowrap"
            >
              <Mail className="mr-2 h-4 w-4" />
              {isResendingEmail ? "Gönderiliyor..." : "Tekrar Gönder"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Company Information Warning */}
      {showCompanyAlert && isCompanyOwner && (
        <Alert
          variant="default"
          className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
        >
          <Factory className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-900 dark:text-orange-100">
            Firma Bilgilerinizi Tamamlayın
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between text-orange-800 dark:text-orange-200">
            <span>
              Sistemi tam olarak kullanabilmek için firma bilgilerinizi girmeniz
              gerekmektedir. Lütfen firma profilinizi tamamlayın.
            </span>
            <Link href="/dashboard/settings?tab=company">
              <Button
                variant="outline"
                size="sm"
                className="ml-4 whitespace-nowrap border-orange-300 hover:bg-orange-100 dark:border-orange-700 dark:hover:bg-orange-900"
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Firma Bilgilerini Gir
              </Button>
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Welcome Header */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {session?.user?.name || "User"}! 👋
          </h2>
          {departmentLabel && (
            <p className="text-muted-foreground mt-2">
              {departmentLabel} Department
            </p>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Samples</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">+5 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 in final stage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <PermissionGate permission="PRODUCTION_VIEW">
            <Link
              href="/dashboard/production"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Production</p>
                  <p className="text-sm text-muted-foreground">
                    Manage production orders
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </PermissionGate>

          <PermissionGate permission="QUALITY_VIEW">
            <Link
              href="/dashboard/quality"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Quality Control</p>
                  <p className="text-sm text-muted-foreground">
                    Review quality checks
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </PermissionGate>

          <PermissionGate permission="ORDER_VIEW">
            <Link
              href="/dashboard/orders"
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Orders</p>
                  <p className="text-sm text-muted-foreground">
                    View and manage orders
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </PermissionGate>
        </CardContent>
      </Card>

      {/* Active Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {permissions.length > 0 ? (
              permissions.map((permission, index) => (
                <Badge key={`${permission}-${index}`} variant="secondary">
                  {permission}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No permissions assigned
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
