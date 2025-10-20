"use client";

import {
  AdminCompaniesDocument,
  AdminCreateUserDocument,
  AdminDeleteUserDocument,
  AdminToggleUserStatusDocument,
  AdminUpdateUserCompanyDocument,
  AdminUpdateUserDocument,
  AdminUpdateUserRoleDocument,
  AdminUsersCountByRoleDocument,
  AdminUsersDocument,
} from "@/__generated__/graphql";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRelayIds } from "@/hooks/useRelayIds";
import {
  filterUsers,
  getDepartmentLabel,
  getRoleBadge,
  isCompanyRole,
  validateUserForm,
} from "@/lib/user-utils";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import {
  AlertCircle,
  Building2,
  CheckCircle,
  Edit,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Reusable hooks
  const { decodeGlobalId, findGlobalIdByNumericId } = useRelayIds();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "INDIVIDUAL_CUSTOMER",
    companyId: null as number | null,
  });
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    jobTitle: "",
    role: "",
    newPassword: "",
    companyId: null as number | null,
  });
  const itemsPerPage = 20;

  // Debug: Log createForm changes
  useEffect(() => {
    console.log("📝 CreateForm updated:", createForm);
  }, [createForm]);

  // Check if user is admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      toast.error("Yetkisiz Erişim", {
        description: "Bu sayfaya erişim için admin yetkisi gereklidir.",
      });
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Fetch users count statistics
  const [{ data: statsData }, refetchStats] = useQuery({
    query: AdminUsersCountByRoleDocument,
    pause: status !== "authenticated" || session?.user?.role !== "ADMIN",
    requestPolicy: "cache-and-network",
  });

  // Fetch users with filters
  const [{ data: usersData, fetching: fetchingUsers }, refetchUsers] = useQuery(
    {
      query: AdminUsersDocument,
      variables: {
        skip: (currentPage - 1) * itemsPerPage,
        take: itemsPerPage,
        role: roleFilter === "all" ? null : roleFilter,
        search: searchTerm || null,
      },
      pause: status !== "authenticated" || session?.user?.role !== "ADMIN",
      requestPolicy: "cache-and-network", // Always fetch fresh data
    }
  );

  // Fetch companies for dropdown
  const [
    { data: companiesData, fetching: fetchingCompanies, error: companiesError },
  ] = useQuery({
    query: AdminCompaniesDocument,
    variables: { take: 100 },
    pause: status !== "authenticated" || session?.user?.role !== "ADMIN",
    requestPolicy: "cache-and-network", // Always get fresh data
  });

  console.log("📊 Companies data:", {
    data: companiesData,
    fetching: fetchingCompanies,
    error: companiesError,
    companies: companiesData?.companies,
    count: companiesData?.companies?.length,
  });

  // Toggle user status mutation
  const [, toggleUserStatus] = useMutation(AdminToggleUserStatusDocument);

  // Create user mutation
  const [, createUser] = useMutation(AdminCreateUserDocument);

  // Delete user mutation
  const [, deleteUser] = useMutation(AdminDeleteUserDocument);

  // Update user mutations
  const [, updateUser] = useMutation(AdminUpdateUserDocument);
  const [, updateUserRole] = useMutation(AdminUpdateUserRoleDocument);
  const [, updateUserCompany] = useMutation(AdminUpdateUserCompanyDocument);

  // Handle create user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using reusable utility
    const errors = validateUserForm(createForm, true);
    if (errors.length > 0) {
      toast.error("Hata", {
        description: errors[0].message,
      });
      return;
    }

    const result = await createUser({
      email: createForm.email,
      password: createForm.password,
      name: createForm.name,
      role: createForm.role,
      companyId: createForm.companyId,
    });

    if (result.error) {
      toast.error("Hata", {
        description: result.error.message || "Kullanıcı oluşturulamadı.",
      });
      return;
    }

    toast.success("Başarılı", {
      description: "Kullanıcı başarıyla oluşturuldu.",
    });

    setShowCreateModal(false);
    setCreateForm({
      email: "",
      password: "",
      name: "",
      role: "INDIVIDUAL_CUSTOMER",
      companyId: null,
    });

    // Refetch both users list and statistics to update UI
    await Promise.all([
      refetchUsers({ requestPolicy: "network-only" }),
      refetchStats({ requestPolicy: "network-only" }),
    ]);
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  const stats = statsData?.usersCountByRole || {
    total: 0,
    byRole: {},
    byStatus: {},
  };

  const users = usersData?.users || [];

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    // Decode Global ID to get numeric ID
    const numericId = decodeGlobalId(userId);
    if (!numericId) {
      toast.error("Hata", {
        description: "Geçersiz kullanıcı ID'si.",
      });
      return;
    }

    console.log("🔄 Toggling user status:", {
      globalId: userId,
      numericId,
      currentStatus,
      newStatus: !currentStatus,
    });

    const result = await toggleUserStatus({
      userId: numericId,
      isActive: !currentStatus,
    });

    if (result.error) {
      console.error("❌ Toggle status error:", result.error);
      toast.error("Hata", {
        description: "Kullanıcı durumu güncellenemedi.",
      });
    } else {
      toast.success("Başarılı", {
        description: `Kullanıcı ${!currentStatus ? "aktif" : "pasif"} edildi.`,
      });

      // Refetch to update UI immediately
      await Promise.all([
        refetchUsers({ requestPolicy: "network-only" }),
        refetchStats({ requestPolicy: "network-only" }),
      ]);
    }
  };

  // Apply filters using reusable utility
  const filteredUsers = filterUsers(users, {
    searchTerm,
    roleFilter,
    statusFilter,
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Tüm kullanıcıları görüntüleyin ve yönetin
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Kullanıcı
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tüm sistemdeki kullanıcılar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.byStatus?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aktif kullanıcılar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Firma Sahipleri
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.byRole?.COMPANY_OWNER || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Company Owner</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Onay Bekleyenler
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.byStatus?.pendingApproval || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>Kullanıcıları filtreleyin ve arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="İsim veya email ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Role Filter */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Rol filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="COMPANY_OWNER">Firma Sahibi</SelectItem>
                <SelectItem value="COMPANY_EMPLOYEE">Çalışan</SelectItem>
                <SelectItem value="INDIVIDUAL_CUSTOMER">Müşteri</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
                <SelectItem value="pending">Onay Bekleyen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcılar ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Tüm kullanıcıları görüntüleyin ve yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchingUsers ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground">Yükleniyor...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Kullanıcı Bulunamadı
              </h3>
              <p className="text-muted-foreground">
                Arama kriterlerinize uygun kullanıcı bulunamadı.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Departman</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Kayıt Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user?.role || "INDIVIDUAL_CUSTOMER")}
                      </TableCell>
                      <TableCell>
                        {getDepartmentLabel(user.department ?? null)}
                      </TableCell>
                      <TableCell>
                        {user.company ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{user.company.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserX className="w-3 h-3" />
                            Pasif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() => {
                                setEditingUser(user);
                                setEditForm({
                                  name: user.name || "",
                                  email: user.email || "",
                                  phone: user.phone || "",
                                  department: user.department || "",
                                  jobTitle: user.jobTitle || "",
                                  role: user.role || "",
                                  newPassword: "",
                                  companyId: user.company
                                    ? decodeGlobalId(user.company.id)
                                    : null,
                                });
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2"
                              onClick={() =>
                                handleToggleStatus(
                                  user.id,
                                  user.isActive || false
                                )
                              }
                            >
                              {user.isActive ? (
                                <>
                                  <UserX className="w-4 h-4" />
                                  Pasif Et
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4" />
                                  Aktif Et
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <UserCog className="w-4 h-4" />
                              Rol Değiştir
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Shield className="w-4 h-4" />
                              Şifre Sıfırla
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => setDeleteUserId(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Sayfa {currentPage} - Toplam {filteredUsers.length} kullanıcı
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={filteredUsers.length < itemsPerPage}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
              <DialogDescription>
                Yeni bir kullanıcı oluşturmak için aşağıdaki bilgileri doldurun.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Ad Soyad <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Örn: Ahmet Yılmaz"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">
                  E-posta <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@sirket.com"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">
                  Şifre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="En az 6 karakter"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, password: e.target.value })
                  }
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  Şifre en az 6 karakter olmalıdır
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">
                  Rol <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value) => {
                    console.log("🔄 Role changed:", value);
                    // Rol değiştiğinde firma seçimini sıfırla
                    setCreateForm({
                      ...createForm,
                      role: value,
                      companyId: null, // Reset company selection
                    });
                  }}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL_CUSTOMER">
                      Bireysel Müşteri
                    </SelectItem>
                    <SelectItem value="COMPANY_EMPLOYEE">
                      Şirket Çalışanı
                    </SelectItem>
                    <SelectItem value="COMPANY_OWNER">Şirket Sahibi</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Selection - Show only for company roles */}
              {isCompanyRole(createForm.role) && (
                <div className="grid gap-2">
                  <Label htmlFor="company">
                    Firma <span className="text-destructive">*</span>
                  </Label>

                  {/* Debug bilgisi */}
                  <div className="text-xs text-muted-foreground mb-1 p-2 bg-muted rounded">
                    📊 Durum: {fetchingCompanies && "⏳ Yükleniyor"}
                    {companiesError && `❌ Hata: ${companiesError.message}`}
                    {!fetchingCompanies &&
                      !companiesError &&
                      `✅ ${
                        companiesData?.companies?.length || 0
                      } firma bulundu`}
                    {createForm.companyId && (
                      <span className="ml-2 font-medium text-green-600">
                        | Seçili:{" "}
                        {companiesData?.companies?.find(
                          (c: any) =>
                            c.id.toString() === createForm.companyId?.toString()
                        )?.name || createForm.companyId}
                      </span>
                    )}
                  </div>

                  {fetchingCompanies ? (
                    <p className="text-sm text-muted-foreground">
                      Firmalar yükleniyor...
                    </p>
                  ) : companiesError ? (
                    <p className="text-sm text-destructive">
                      Firmalar yüklenemedi: {companiesError.message}
                    </p>
                  ) : !companiesData?.companies?.length ? (
                    <div className="p-3 border border-amber-300 bg-amber-50 rounded-md">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ Henüz firma kaydı bulunmamaktadır
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Önce "Firma Yönetimi" bölümünden firma ekleyiniz.
                      </p>
                    </div>
                  ) : (
                    <Select
                      key={`company-select-${createForm.role}`}
                      value={
                        findGlobalIdByNumericId(
                          companiesData?.companies,
                          createForm.companyId
                        ) || ""
                      }
                      disabled={fetchingCompanies}
                      onValueChange={(value) => {
                        // Decode the Relay Global ID to get numeric ID
                        const numericId = decodeGlobalId(value);
                        setCreateForm({
                          ...createForm,
                          companyId: numericId,
                        });
                      }}
                    >
                      <SelectTrigger id="company" className="w-full">
                        <SelectValue placeholder="Firma seçin" />
                      </SelectTrigger>
                      <SelectContent
                        position="popper"
                        sideOffset={4}
                        className="z-[100]"
                      >
                        {!companiesData?.companies?.length ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            Firma bulunamadı
                          </div>
                        ) : (
                          companiesData.companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name} ({company.type})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Kullanıcının bağlı olacağı firmayı seçin
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateForm({
                    email: "",
                    password: "",
                    name: "",
                    role: "INDIVIDUAL_CUSTOMER",
                    companyId: null,
                  });
                }}
              >
                İptal
              </Button>
              <Button type="submit">Kullanıcı Oluştur</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
            <DialogDescription>
              Kullanıcı bilgilerini, rolünü ve firmasını güncelleyin
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (!editingUser) return;

              // Decode Global ID to get numeric ID
              const numericId = decodeGlobalId(editingUser.id);
              if (!numericId) {
                toast.error("Hata", {
                  description: "Geçersiz kullanıcı ID'si.",
                });
                return;
              }

              console.log("✏️ Updating user:", {
                globalId: editingUser.id,
                numericId,
                updates: editForm,
              });

              const result = await updateUser({
                id: numericId,
                name: editForm.name || null,
                email: editForm.email || null,
                phone: editForm.phone || null,
                password: editForm.newPassword || null,
                role: editForm.role || null,
                companyId: editForm.companyId || null,
                department: editForm.department || null,
                jobTitle: editForm.jobTitle || null,
              });

              if (result.error) {
                console.error("❌ Update error:", result.error);
                toast.error("Hata", {
                  description:
                    result.error.message || "Kullanıcı güncellenemedi.",
                });
              } else {
                toast.success("Başarılı", {
                  description: "Kullanıcı başarıyla güncellendi.",
                });
                setShowEditModal(false);
                setEditingUser(null);

                // Refetch to ensure UI is in sync
                await Promise.all([
                  refetchUsers({ requestPolicy: "network-only" }),
                  refetchStats({ requestPolicy: "network-only" }),
                ]);
              }
            }}
            className="space-y-4"
          >
            {/* Basic Info Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Ad Soyad *</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="Ad Soyad"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-email">E-posta *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Telefon</Label>
                  <Input
                    id="edit-phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    placeholder="+90 555 123 4567"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-newPassword">
                    Yeni Şifre{" "}
                    <span className="text-xs text-muted-foreground">
                      (opsiyonel)
                    </span>
                  </Label>
                  <Input
                    id="edit-newPassword"
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) =>
                      setEditForm({ ...editForm, newPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Role & Company Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                Rol ve Firma
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Rol *</Label>
                  <Select
                    value={editForm.role}
                    onValueChange={(value) => {
                      setEditForm({
                        ...editForm,
                        role: value,
                        // Reset company if role doesn't require company
                        companyId: isCompanyRole(value)
                          ? editForm.companyId
                          : null,
                      });
                    }}
                  >
                    <SelectTrigger id="edit-role" className="w-full">
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="COMPANY_OWNER">
                        Firma Sahibi
                      </SelectItem>
                      <SelectItem value="COMPANY_EMPLOYEE">
                        Firma Çalışanı
                      </SelectItem>
                      <SelectItem value="INDIVIDUAL_CUSTOMER">
                        Bireysel Müşteri
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Company Selection - Show only for company roles */}
                {isCompanyRole(editForm.role) && (
                  <div className="grid gap-2">
                    <Label htmlFor="edit-company">Firma</Label>
                    {!companiesData?.companies?.length ? (
                      <div className="p-3 border border-amber-300 bg-amber-50 rounded-md text-xs">
                        <p className="text-amber-800 font-medium">
                          ⚠️ Firma kaydı yok
                        </p>
                      </div>
                    ) : (
                      <Select
                        key={`edit-company-${editForm.role}`}
                        value={
                          findGlobalIdByNumericId(
                            companiesData?.companies,
                            editForm.companyId
                          ) || ""
                        }
                        disabled={fetchingCompanies}
                        onValueChange={(value) => {
                          const numericId = decodeGlobalId(value);
                          setEditForm({
                            ...editForm,
                            companyId: numericId,
                          });
                        }}
                      >
                        <SelectTrigger id="edit-company" className="w-full">
                          <SelectValue placeholder="Firma seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {companiesData.companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name} ({company.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Job Info Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                İş Bilgileri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-department">Departman</Label>
                  <Input
                    id="edit-department"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    placeholder="Departman"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-jobTitle">İş Ünvanı</Label>
                  <Input
                    id="edit-jobTitle"
                    value={editForm.jobTitle}
                    onChange={(e) =>
                      setEditForm({ ...editForm, jobTitle: e.target.value })
                    }
                    placeholder="İş Ünvanı"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
              >
                İptal
              </Button>
              <Button type="submit">Güncelle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteUserId !== null}
        onOpenChange={() => setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={async () => {
                if (!deleteUserId) return;

                // Decode Global ID to get numeric ID
                const numericId = decodeGlobalId(deleteUserId);
                if (!numericId) {
                  toast.error("Hata", {
                    description: "Geçersiz kullanıcı ID'si.",
                  });
                  setDeleteUserId(null);
                  return;
                }

                console.log("🗑️ Deleting user:", {
                  globalId: deleteUserId,
                  numericId,
                });

                const result = await deleteUser({
                  id: numericId,
                });

                if (result.error) {
                  console.error("❌ Delete error:", result.error);
                  toast.error("Hata", {
                    description: "Kullanıcı silinemedi.",
                  });
                  setDeleteUserId(null);
                } else {
                  toast.success("Başarılı", {
                    description: "Kullanıcı başarıyla silindi.",
                  });

                  // Close modal first to show loading state
                  setDeleteUserId(null);

                  // Then refetch - this will update the UI immediately
                  await Promise.all([
                    refetchUsers({ requestPolicy: "network-only" }),
                    refetchStats({ requestPolicy: "network-only" }),
                  ]);
                }
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
