"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthProvider";
import {
  Loader2,
  Mail,
  Pencil,
  Power,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { gql, useMutation, useQuery } from "urql";
import { User } from "../../../../__generated__/graphql";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

const MY_COMPANY_EMPLOYEES_QUERY = gql`
  query MyCompanyEmployees {
    myCompanyEmployees {
      id
      email
      firstName
      lastName
      phone
      role
      department
      jobTitle
      isCompanyOwner
      isActive
      createdAt
      company {
        id
        name
      }
    }
  }
`;

const CREATE_EMPLOYEE_MUTATION = gql`
  mutation CreateEmployee($input: SignupInput!) {
    signup(input: $input) {
      user {
        id
        email
        firstName
        lastName
      }
    }
  }
`;

const UPDATE_EMPLOYEE_MUTATION = gql`
  mutation UpdateEmployee($input: UserUpdateInput!) {
    updateUser(input: $input) {
      id
      email
      firstName
      lastName
    }
  }
`;

const DELETE_EMPLOYEE_MUTATION = gql`
  mutation DeleteEmployee($id: Int!) {
    deleteUser(id: $id) {
      id
    }
  }
`;

export default function EmployeeManagementPage() {
  const { user } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    jobTitle: "",
    role: "COMPANY_EMPLOYEE",
    isActive: true,
    permissions: {
      collections: { view: true, create: false, edit: false, delete: false },
      samples: { view: true, create: false, updateStatus: false },
      orders: {
        view: true,
        sendQuote: false,
        updateStatus: false,
        confirm: false,
      },
      categories: { view: true, create: false, edit: false, delete: false },
      library: { view: true, create: false, edit: false, delete: false },
    },
  });

  const [{ data, fetching }] = useQuery({
    query: MY_COMPANY_EMPLOYEES_QUERY,
    requestPolicy: "network-only",
  });

  const [, createEmployee] = useMutation(CREATE_EMPLOYEE_MUTATION);
  const [, updateEmployee] = useMutation(UPDATE_EMPLOYEE_MUTATION);
  const [, deleteEmployee] = useMutation(DELETE_EMPLOYEE_MUTATION);

  const employees = data?.myCompanyEmployees || [];

  console.log("📊 Debug Info:");
  console.log("- User companyId:", user?.companyId);
  console.log("- Employees:", employees.length);
  console.log("- Employee list:", employees);

  const handleCreateClick = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "DefaultPass123!",
      phone: "",
      department: "",
      jobTitle: "",
      role: "COMPANY_EMPLOYEE",
      isActive: true,
      permissions: {
        collections: { view: true, create: false, edit: false, delete: false },
        samples: { view: true, create: false, updateStatus: false },
        orders: {
          view: true,
          sendQuote: false,
          updateStatus: false,
          confirm: false,
        },
        categories: { view: true, create: false, edit: false, delete: false },
        library: { view: true, create: false, edit: false, delete: false },
      },
    });
    setIsCreateDialogOpen(true);
  };

  const handleRoleChange = (role: string) => {
    let permissions = formData.permissions;

    // Eğer COMPANY_OWNER seçilirse tüm yetkiler verilsin
    if (role === "COMPANY_OWNER") {
      permissions = {
        collections: { view: true, create: true, edit: true, delete: true },
        samples: { view: true, create: true, updateStatus: true },
        orders: {
          view: true,
          sendQuote: true,
          updateStatus: true,
          confirm: true,
        },
        categories: { view: true, create: true, edit: true, delete: true },
        library: { view: true, create: true, edit: true, delete: true },
      };
    }

    setFormData({ ...formData, role, permissions });
  };

  const handleSubmitEdit = async () => {
    if (!selectedEmployee) return;
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Ad, soyad ve email gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateEmployee({
        input: {
          id: selectedEmployee.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          jobTitle: formData.jobTitle || undefined,
          role: formData.role,
          permissions: JSON.stringify(formData.permissions),
          isActive: formData.isActive,
        },
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Çalışan başarıyla güncellendi");
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Güncelleme sırasında bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      const result = await deleteEmployee({ id: selectedEmployee.id });

      if (result.error) throw new Error(result.error.message);

      toast.success("Çalışan başarıyla silindi");
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Silme sırasında bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error("Ad, soyad ve email gerekli");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createEmployee({
        input: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          jobTitle: formData.jobTitle || undefined,
          permissions: JSON.stringify(formData.permissions),
          companyFlow: {
            action: "JOIN_EXISTING",
            companyId: user?.companyId,
          },
        },
      });

      if (result.error) throw new Error(result.error.message);

      console.log("✅ Çalışan oluşturuldu:", result.data);
      toast.success("Çalışan başarıyla oluşturuldu");
      setIsCreateDialogOpen(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "DefaultPass123!",
        phone: "",
        department: "",
        jobTitle: "",
        role: "COMPANY_EMPLOYEE",
        isActive: true, // Added missing isActive property
        permissions: {
          collections: {
            view: true,
            create: false,
            edit: false,
            delete: false,
          },
          samples: { view: true, create: false, updateStatus: false },
          orders: {
            view: true,
            sendQuote: false,
            updateStatus: false,
            confirm: false,
          },
          categories: { view: true, create: false, edit: false, delete: false },
          library: { view: true, create: false, edit: false, delete: false },
        },
      });

      // Force page reload to refresh data
      window.location.reload();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Çalışan oluşturulurken bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) {
      return (
        <Badge className="bg-purple-500">
          <Shield className="h-3 w-3 mr-1" />
          Şirket Sahibi
        </Badge>
      );
    }

    const roleLabels: Record<string, string> = {
      ADMIN: "Admin",
      COMPANY_OWNER: "Şirket Sahibi",
      COMPANY_EMPLOYEE: "Çalışan",
      MANUFACTURE: "Üretici",
      CUSTOMER: "Müşteri",
    };

    return <Badge variant="secondary">{roleLabels[role] || role}</Badge>;
  };

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Çalışan Yönetimi</h1>
          <p className="text-muted-foreground">
            Şirketinizin çalışanlarını görüntüleyin
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Yeni Çalışan Oluştur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Toplam Çalışan
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              Şirketinizde kayıtlı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yönetici</CardTitle>
            <Shield className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employees.filter(
                  (e: { isCompanyOwner: boolean }) => e.isCompanyOwner
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Tam yetki</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employees.filter((e: { isActive: boolean }) => e.isActive)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Çalışıyor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pasif</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                employees.filter((e: { isActive: boolean }) => !e.isActive)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">Devre Dışı</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Çalışan Listesi</CardTitle>
            {employees.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {employees.length} çalışan
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Çalışan bulunamadı</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Şirketinize ait çalışan bulunmuyor
              </p>
              <Button onClick={handleCreateClick}>
                <UserPlus className="mr-2 h-4 w-4" />
                İlk Çalışanı Oluştur
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departman</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(
                  (employee: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone?: string;
                    department?: string;
                    jobTitle?: string;
                    role: string;
                    isCompanyOwner: boolean;
                    isActive: boolean;
                  }) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">
                        {employee.firstName} {employee.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {employee.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.department || "-"}
                          {employee.jobTitle && (
                            <div className="text-xs text-muted-foreground">
                              {employee.jobTitle}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(employee.role, employee.isCompanyOwner)}
                      </TableCell>
                      <TableCell>
                        {employee.isActive ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            ✓ Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-50 text-gray-600 border-gray-200"
                          >
                            ○ Pasif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee as unknown as User);
                              setFormData({
                                firstName: employee.firstName || "",
                                lastName: employee.lastName || "",
                                email: employee.email,
                                password: "",
                                phone: employee.phone || "",
                                department: employee.department || "",
                                jobTitle: employee.jobTitle || "",
                                role: employee.role,
                                isActive: employee.isActive ?? true,
                                permissions: (employee as unknown as User)
                                  .permissions
                                  ? JSON.parse(
                                      (employee as unknown as User).permissions!
                                    )
                                  : {
                                      collections: {
                                        view: true,
                                        create: false,
                                        edit: false,
                                        delete: false,
                                      },
                                      samples: {
                                        view: true,
                                        create: false,
                                        updateStatus: false,
                                      },
                                      orders: {
                                        view: true,
                                        sendQuote: false,
                                        updateStatus: false,
                                        confirm: false,
                                      },
                                      categories: {
                                        view: true,
                                        create: false,
                                        edit: false,
                                        delete: false,
                                      },
                                      library: {
                                        view: true,
                                        create: false,
                                        edit: false,
                                        delete: false,
                                      },
                                    },
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedEmployee(employee as unknown as User);
                              setIsDeleteDialogOpen(true);
                            }}
                            disabled={employee.id === String(user?.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Employee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Oluştur</DialogTitle>
            <DialogDescription>
              Şirketinize yeni bir çalışan ekleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Ad *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Mehmet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Soyad *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Yılmaz"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="mehmet@defacto.com"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <Input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Varsayılan: DefaultPass123!"
              />
              <p className="text-xs text-muted-foreground">
                Çalışan ilk girişte şifresini değiştirebilir
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+90 532 123 45 67"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="role">ROL *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-12 text-base font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY_EMPLOYEE" className="text-base">
                    👤 Çalışan (Sınırlı Yetki)
                  </SelectItem>
                  <SelectItem value="COMPANY_OWNER" className="text-base">
                    👑 Yönetici (Tüm Yetkiler)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.role === "COMPANY_OWNER"
                  ? "✅ Tüm modüllere tam erişim"
                  : "⚠️ Sınırlı erişim - Aşağıdan yetkileri düzenleyin"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departman</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Üretim, Numune, Satış..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Ünvan</Label>
              <Input
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                placeholder="Üretim Müdürü, Tasarımcı..."
              />
            </div>

            {/* Permissions */}
            {formData.role === "COMPANY_EMPLOYEE" && (
              <div className="col-span-2 space-y-2 pt-3 border-t">
                <Label className="text-sm font-medium">
                  Yetkiler (İsteğe Bağlı)
                </Label>

                {/* Collections */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    📦 Koleksiyonlar
                  </p>
                  <div className="flex gap-3 ml-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="col-create"
                        checked={formData.permissions.collections.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="col-create"
                        className="text-xs cursor-pointer"
                      >
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="col-edit"
                        checked={formData.permissions.collections.edit}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                edit: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="col-edit"
                        className="text-xs cursor-pointer"
                      >
                        Düzenle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="col-delete"
                        checked={formData.permissions.collections.delete}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                delete: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="col-delete"
                        className="text-xs cursor-pointer"
                      >
                        Sil
                      </label>
                    </div>
                  </div>
                </div>

                {/* Samples */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    🎨 Numuneler
                  </p>
                  <div className="flex gap-3 ml-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smp-create"
                        checked={formData.permissions.samples.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              samples: {
                                ...formData.permissions.samples,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="smp-create"
                        className="text-xs cursor-pointer"
                      >
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smp-status"
                        checked={formData.permissions.samples.updateStatus}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              samples: {
                                ...formData.permissions.samples,
                                updateStatus: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="smp-status"
                        className="text-xs cursor-pointer"
                      >
                        Durum Güncelle
                      </label>
                    </div>
                  </div>
                </div>

                {/* Orders */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    📋 Siparişler
                  </p>
                  <div className="flex gap-3 ml-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ord-quote"
                        checked={formData.permissions.orders.sendQuote}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                sendQuote: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="ord-quote"
                        className="text-xs cursor-pointer"
                      >
                        Teklif Gönder
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ord-status"
                        checked={formData.permissions.orders.updateStatus}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                updateStatus: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="ord-status"
                        className="text-xs cursor-pointer"
                      >
                        Durum Güncelle
                      </label>
                    </div>
                  </div>
                </div>

                {/* Library */}
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">
                    📚 Kütüphane
                  </p>
                  <div className="flex gap-3 ml-3 flex-wrap">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lib-create"
                        checked={formData.permissions.library.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="lib-create"
                        className="text-xs cursor-pointer"
                      >
                        Ekle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="lib-edit"
                        checked={formData.permissions.library.edit}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                edit: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label
                        htmlFor="lib-edit"
                        className="text-xs cursor-pointer"
                      >
                        Düzenle
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Çalışan Düzenle</DialogTitle>
            <DialogDescription>
              {selectedEmployee?.firstName} {selectedEmployee?.lastName}{" "}
              bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ad *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Soyad *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Telefon</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label>ROL *</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPANY_EMPLOYEE">👤 Çalışan</SelectItem>
                  <SelectItem value="COMPANY_OWNER">👑 Yönetici</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Departman</Label>
              <Input
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Ünvan</Label>
              <Input
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
              />
            </div>

            {/* Durum (Active/Inactive) */}
            <div className="col-span-2 flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Power className="h-5 w-5 text-gray-500" />
                <div>
                  <Label className="text-base font-medium">Hesap Durumu</Label>
                  <p className="text-xs text-gray-500">
                    Çalışan aktif mi, pasif mi?
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          {/* Permissions Section (same as Create Dialog) */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <Label className="text-base font-semibold">
                YETKİLER
                {formData.role === "COMPANY_OWNER" && (
                  <Badge variant="secondary" className="ml-2">
                    Tüm Yetkiler
                  </Badge>
                )}
              </Label>
            </div>

            {formData.role === "COMPANY_EMPLOYEE" && (
              <div className="grid gap-4">
                {/* Collections Permissions */}
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">
                    📦 Koleksiyonlar
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-col-view"
                        checked={formData.permissions.collections.view}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                view: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-col-view" className="text-xs">
                        Görüntüle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-col-create"
                        checked={formData.permissions.collections.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-col-create" className="text-xs">
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-col-edit"
                        checked={formData.permissions.collections.edit}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                edit: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-col-edit" className="text-xs">
                        Düzenle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-col-delete"
                        checked={formData.permissions.collections.delete}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              collections: {
                                ...formData.permissions.collections,
                                delete: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-col-delete" className="text-xs">
                        Sil
                      </label>
                    </div>
                  </div>
                </div>

                {/* Samples Permissions */}
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">🧪 Numuneler</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-smp-view"
                        checked={formData.permissions.samples.view}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              samples: {
                                ...formData.permissions.samples,
                                view: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-smp-view" className="text-xs">
                        Görüntüle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-smp-create"
                        checked={formData.permissions.samples.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              samples: {
                                ...formData.permissions.samples,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-smp-create" className="text-xs">
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-smp-status"
                        checked={formData.permissions.samples.updateStatus}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              samples: {
                                ...formData.permissions.samples,
                                updateStatus: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-smp-status" className="text-xs">
                        Durum Güncelle
                      </label>
                    </div>
                  </div>
                </div>

                {/* Orders Permissions */}
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">📋 Siparişler</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-ord-view"
                        checked={formData.permissions.orders.view}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                view: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-ord-view" className="text-xs">
                        Görüntüle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-ord-quote"
                        checked={formData.permissions.orders.sendQuote}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                sendQuote: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-ord-quote" className="text-xs">
                        Teklif Gönder
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-ord-status"
                        checked={formData.permissions.orders.updateStatus}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                updateStatus: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-ord-status" className="text-xs">
                        Durum Güncelle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-ord-confirm"
                        checked={formData.permissions.orders.confirm}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              orders: {
                                ...formData.permissions.orders,
                                confirm: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-ord-confirm" className="text-xs">
                        Onayla
                      </label>
                    </div>
                  </div>
                </div>

                {/* Categories Permissions */}
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">🏷️ Kategoriler</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cat-view"
                        checked={formData.permissions.categories.view}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              categories: {
                                ...formData.permissions.categories,
                                view: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-cat-view" className="text-xs">
                        Görüntüle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cat-create"
                        checked={formData.permissions.categories.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              categories: {
                                ...formData.permissions.categories,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-cat-create" className="text-xs">
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cat-edit"
                        checked={formData.permissions.categories.edit}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              categories: {
                                ...formData.permissions.categories,
                                edit: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-cat-edit" className="text-xs">
                        Düzenle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-cat-delete"
                        checked={formData.permissions.categories.delete}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              categories: {
                                ...formData.permissions.categories,
                                delete: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-cat-delete" className="text-xs">
                        Sil
                      </label>
                    </div>
                  </div>
                </div>

                {/* Library Permissions */}
                <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium">📚 Kütüphane</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-lib-view"
                        checked={formData.permissions.library.view}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                view: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-lib-view" className="text-xs">
                        Görüntüle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-lib-create"
                        checked={formData.permissions.library.create}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                create: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-lib-create" className="text-xs">
                        Oluştur
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-lib-edit"
                        checked={formData.permissions.library.edit}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                edit: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-lib-edit" className="text-xs">
                        Düzenle
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-lib-delete"
                        checked={formData.permissions.library.delete}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              library: {
                                ...formData.permissions.library,
                                delete: !!checked,
                              },
                            },
                          })
                        }
                      />
                      <label htmlFor="edit-lib-delete" className="text-xs">
                        Sil
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Çalışanı Sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>
                {selectedEmployee?.firstName} {selectedEmployee?.lastName}
              </strong>{" "}
              silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
