"use client";

import {
  SettingsGetMyCompanyDocument,
  SettingsResendVerificationEmailDocument,
} from "@/__generated__/graphql";
import { PermissionGate } from "@/components/auth/permission-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermissions } from "@/hooks/usePermissions";
import {
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
import AlertButton from "../../../components/alerts/alert-button";
import AlertLink from "../../../components/alerts/alert-link";
import StatsCard from "../../../components/stats/StatsCard";

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
        <AlertButton
          resendVerificationEmail={resendVerificationEmail}
          isResendingEmail={isResendingEmail}
          description="Hesabınızı tam olarak kullanabilmek için email adresinizi doğrulamanız gerekmektedir. Lütfen gelen kutunuzu kontrol edin ve doğrulama linkine tıklayın."
          label="Email Doğrulaması Gerekli"
          buttonTextResending="Gönderiliyor..."
          buttonTextDefault="Tekrar Gönder"
          icon={<Mail className="mr-2 h-4 w-4" />}
        />
      )}

      {/* Company Information Warning */}
      {showCompanyAlert && isCompanyOwner && (
        <AlertLink
          linkLabel="Firma Bilgilerini Gir"
          description="Sistemi tam olarak kullanabilmek için firma bilgilerinizi girmeniz gerekmektedir. Lütfen firma profilinizi tamamlayın."
          label="  Firma Bilgilerini Girmeniz Gerekiyor"
          href="/dashboard/settings?tab=company"
          icon={<Factory className="h-4 w-4 text-orange-600" />}
        />
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
        <StatsCard
          title="Active Orders"
          value="24"
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="+12% from last month"
        />

        <StatsCard
          title="Samples"
          value="18"
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          description="+5 new this week"
        />

        <StatsCard
          title="Production"
          value="12"
          icon={<Factory className="h-4 w-4 text-muted-foreground" />}
          description="3 in final stage"
        />

        <StatsCard
          title="Quality Rate"
          value="94%"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="+2% from last month"
        />
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
    </div>
  );
}
