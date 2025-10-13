"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthProvider";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CompanyManagementPage() {
  const { user } = useAuth();
  const { isCompanyOwner, canManageCompany } = usePermissions();
  const router = useRouter();

  // Check permissions with useEffect to avoid setState during render
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  if (!isCompanyOwner && user.role !== "ADMIN") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Erişim Engellendi</CardTitle>
            <CardDescription>
              Bu sayfayı görüntülemek için firma sahibi veya admin olmalısınız.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const company = user.company;

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Firma Bulunamadı</CardTitle>
            <CardDescription>
              Firma bilgileriniz yüklenemedi. Lütfen tekrar giriş yapın.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Mock employees data (will be replaced with real query)
  const employees = company.employees || [];

  const getCompanyTypeBadge = (type: string) => {
    switch (type) {
      case "MANUFACTURER":
        return <Badge className="bg-blue-500">🏭 Üretici</Badge>;
      case "BUYER":
        return <Badge className="bg-green-500">🛒 Alıcı</Badge>;
      case "BOTH":
        return <Badge className="bg-purple-500">⚡ Her İkisi</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) {
      return <Badge className="bg-yellow-500">👑 Firma Sahibi</Badge>;
    }
    switch (role) {
      case "COMPANY_EMPLOYEE":
        return <Badge variant="outline">👥 Çalışan</Badge>;
      case "COMPANY_OWNER":
        return <Badge className="bg-yellow-500">👑 Firma Sahibi</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Company Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">{company.name}</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-2">
                {getCompanyTypeBadge(company.type)}
                {company.isActive ? (
                  <Badge variant="outline" className="text-green-600">
                    ✓ Aktif
                  </Badge>
                ) : (
                  <Badge variant="destructive">✗ Pasif</Badge>
                )}
              </CardDescription>
            </div>
            <Button size="sm" variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Düzenle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`https://${company.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
            {company.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{company.address}</span>
              </div>
            )}
          </div>
          {company.description && (
            <p className="mt-4 text-sm text-muted-foreground">
              {company.description}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Employees Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Çalışanlar ({employees.length})
              </CardTitle>
              <CardDescription>
                Firma çalışanlarını yönetin ve yetkilendirin
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Çalışan Davet Et
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İsim</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Departman</TableHead>
                <TableHead>Pozisyon</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    Henüz çalışan bulunmuyor. "Çalışan Davet Et" butonuna
                    tıklayarak ekleyebilirsiniz.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((employee: any) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName || employee.name}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {employee.department || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {employee.jobTitle || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(employee.role, employee.isCompanyOwner)}
                    </TableCell>
                    <TableCell>
                      {employee.isPendingApproval ? (
                        <Badge variant="outline" className="text-yellow-600">
                          ⏳ Onay Bekliyor
                        </Badge>
                      ) : employee.isActive ? (
                        <Badge variant="outline" className="text-green-600">
                          ✓ Aktif
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600">
                          ✗ Pasif
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Yönet
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Çalışan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Firma bünyesinde</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Çalışan</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e: any) => e.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Platformda aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onay Bekleyen</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter((e: any) => e.isPendingApproval).length}
            </div>
            <p className="text-xs text-muted-foreground">Bekleyen davetler</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
