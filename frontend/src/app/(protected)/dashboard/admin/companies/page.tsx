"use client";

import {
  AdminCompaniesListDocument,
  AdminCompanyDetailDocument,
  AdminDeleteCompanyDocument,
  AdminToggleCompanyStatusDocument,
  AdminUpdateCompanyDocument,
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
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useRelayIds } from "@/hooks/useRelayIds";
import {
  Building2,
  Power,
  PowerOff,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery } from "urql";

export default function AdminCompaniesPage() {
  // Hooks
  const { decodeGlobalId } = useRelayIds();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleStatusDialogOpen, setToggleStatusDialogOpen] = useState(false);

  // Queries
  const [{ data, fetching }, refetchCompanies] = useQuery({
    query: AdminCompaniesListDocument,
    variables: {
      search: searchTerm || undefined,
      type: typeFilter === "all" ? undefined : typeFilter,
      take: 100,
      includeInactive: true, // Admin can see all companies (active + inactive)
    },
  });

  // Mutations
  const [, toggleStatusMutation] = useMutation(
    AdminToggleCompanyStatusDocument
  );
  const [, deleteCompanyMutation] = useMutation(AdminDeleteCompanyDocument);

  const companies = data?.companies || [];

  // Debug: Log companies data changes
  useEffect(() => {
    console.log("📊 Companies data updated:", {
      count: companies.length,
      activeCount: companies.filter((c: any) => c.isActive).length,
      inactiveCount: companies.filter((c: any) => !c.isActive).length,
      fetching,
    });
  }, [companies, fetching]);

  // Handlers
  const handleToggleStatus = async () => {
    if (!selectedCompany) return;

    const numericId = decodeGlobalId(selectedCompany.id);
    if (!numericId) {
      toast.error("Geçersiz firma ID");
      return;
    }

    const result = await toggleStatusMutation({ id: numericId });

    if (result.data?.toggleCompanyStatus) {
      const newStatus = result.data.toggleCompanyStatus.isActive;
      toast.success(
        newStatus
          ? `${selectedCompany.name} aktif edildi`
          : `${selectedCompany.name} devre dışı bırakıldı`
      );
      refetchCompanies({ requestPolicy: "network-only" });
      setToggleStatusDialogOpen(false);
      setSelectedCompany(null);
    } else if (result.error) {
      toast.error("Durum değiştirilemedi");
      console.error(result.error);
    }
  };

  const handleDelete = async (hardDelete = false) => {
    if (!selectedCompany) return;

    const numericId = decodeGlobalId(selectedCompany.id);
    if (!numericId) {
      toast.error("Geçersiz firma ID");
      return;
    }

    console.log("🗑️ Delete mutation called:", {
      companyName: selectedCompany.name,
      numericId,
      hardDelete,
      currentIsActive: selectedCompany.isActive,
    });

    const result = await deleteCompanyMutation({
      id: numericId,
      hardDelete,
    });

    console.log("📥 Delete mutation result:", result);

    if (result.data?.deleteCompany) {
      const response = result.data.deleteCompany as any;
      toast.success(response.message || "Firma silindi");

      console.log("🔄 Refetching companies...");
      refetchCompanies({ requestPolicy: "network-only" });

      setDeleteDialogOpen(false);
      setSelectedCompany(null);
    } else if (result.error) {
      toast.error("Firma silinemedi");
      console.error("❌ Delete error:", result.error);
    }
  };

  // Stats calculation
  const stats = {
    total: companies.length,
    manufacturers: companies.filter((c: any) => c.type === "MANUFACTURER")
      .length,
    buyers: companies.filter((c: any) => c.type === "BUYER").length,
    both: companies.filter((c: any) => c.type === "BOTH").length,
    active: companies.filter((c: any) => c.isActive).length,
    inactive: companies.filter((c: any) => !c.isActive).length,
  };

  // Company type badge
  const getCompanyTypeBadge = (type: string) => {
    const config: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      MANUFACTURER: { label: "Üretici", variant: "default" },
      BUYER: { label: "Alıcı", variant: "secondary" },
      BOTH: { label: "Her İkisi", variant: "outline" },
    };
    return config[type] || { label: type, variant: "outline" };
  };

  // Handlers
  const handleEditClick = (company: any) => {
    setSelectedCompany(company);
    setEditDialogOpen(true);
  };

  const handleDetailClick = (company: any) => {
    setSelectedCompany(company);
    setDetailDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Firma Yönetimi</h1>
          <p className="text-muted-foreground">
            Platform genelindeki firmaları yönetin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            Toplam
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Üretici</div>
          <div className="mt-2 text-2xl font-bold">{stats.manufacturers}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Alıcı</div>
          <div className="mt-2 text-2xl font-bold">{stats.buyers}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">Her İkisi</div>
          <div className="mt-2 text-2xl font-bold">{stats.both}</div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-green-600">Aktif</div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {stats.active}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="text-sm text-red-600">Pasif</div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {stats.inactive}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Firma ara (ad, email)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Tipler</SelectItem>
            <SelectItem value="MANUFACTURER">Üretici</SelectItem>
            <SelectItem value="BUYER">Alıcı</SelectItem>
            <SelectItem value="BOTH">Her İkisi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Companies Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Firma</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Kullanıcı</TableHead>
              <TableHead>Abonelik</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fetching ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Yükleniyor...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Firma bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company: any) => {
                const typeBadge = getCompanyTypeBadge(company.type);
                return (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{company.name}</div>
                        {company.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {company.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeBadge.variant}>
                        {typeBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{company.email}</div>
                        {company.phone && (
                          <div className="text-muted-foreground">
                            {company.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="h-3 w-3" />
                        {company.currentUsers}/{company.maxUsers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          company.subscriptionStatus === "ACTIVE"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {company.subscriptionPlan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {company.isActive ? (
                        <Badge className="bg-green-500">Aktif</Badge>
                      ) : (
                        <Badge variant="destructive">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDetailClick(company)}
                        >
                          Detay
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(company)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedCompany(company);
                            setToggleStatusDialogOpen(true);
                          }}
                        >
                          {company.isActive ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setSelectedCompany(company);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <EditCompanyDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        company={selectedCompany}
        onSuccess={() => {
          refetchCompanies({ requestPolicy: "network-only" });
          setEditDialogOpen(false);
        }}
      />

      {/* Detail Dialog */}
      <CompanyDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        companyId={selectedCompany?.id}
      />

      {/* Toggle Status Confirmation Dialog */}
      <AlertDialog
        open={toggleStatusDialogOpen}
        onOpenChange={setToggleStatusDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedCompany?.isActive
                ? "Firmayı Devre Dışı Bırak"
                : "Firmayı Aktif Et"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedCompany?.isActive ? (
                <>
                  <strong>{selectedCompany?.name}</strong> firmasını devre dışı
                  bırakmak istediğinize emin misiniz? Firma kullanıcıları
                  sisteme giriş yapamayacak.
                </>
              ) : (
                <>
                  <strong>{selectedCompany?.name}</strong> firmasını aktif etmek
                  istediğinize emin misiniz? Firma kullanıcıları tekrar sisteme
                  giriş yapabilecek.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus}>
              {selectedCompany?.isActive ? "Devre Dışı Bırak" : "Aktif Et"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Firmayı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{selectedCompany?.name}</strong> firmasını silmek
              istediğinize emin misiniz?
              <br />
              <br />
              <strong>Soft Delete (Önerilen):</strong> Firma devre dışı
              bırakılır, veriler korunur ve ileride geri yüklenebilir.
              <br />
              <br />
              <strong className="text-destructive">Hard Delete:</strong> Firma
              ve tüm ilişkili veriler (kullanıcılar, numuneler, siparişler)
              kalıcı olarak silinir. Bu işlem geri alınamaz!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(false)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Soft Delete (Devre Dışı Bırak)
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleDelete(true)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Hard Delete (Kalıcı Sil)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Edit Company Dialog Component
function EditCompanyDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: any;
  onSuccess: () => void;
}) {
  const { decodeGlobalId } = useRelayIds();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    website: "",
    address: "",
    city: "",
    country: "",
    subscriptionPlan: "",
    subscriptionStatus: "",
  });

  // Update form when company changes
  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        description: company.description || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        subscriptionPlan: company.subscriptionPlan || "FREE",
        subscriptionStatus: company.subscriptionStatus || "TRIAL",
      });
    }
  }, [company]);

  // Mutation
  const [updateResult, updateCompany] = useMutation(AdminUpdateCompanyDocument);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;

    const numericId = decodeGlobalId(company.id);
    if (!numericId) {
      toast.error("Geçersiz firma ID");
      return;
    }

    const result = await updateCompany({
      id: numericId,
      ...form,
    });

    if (result.data) {
      toast.success("Firma bilgileri güncellendi");
      onSuccess();
    } else if (result.error) {
      toast.error("Firma güncellenirken hata oluştu");
      console.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Firma Düzenle</DialogTitle>
          <DialogDescription>
            {company?.name} firma bilgilerini güncelleyin
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Firma Adı *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Ülke</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>
          </div>

          {/* Subscription (Admin Only) */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm">Abonelik Yönetimi (Admin)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionPlan">Abonelik Planı</Label>
                <Select
                  value={form.subscriptionPlan}
                  onValueChange={(value) =>
                    setForm({ ...form, subscriptionPlan: value })
                  }
                >
                  <SelectTrigger id="subscriptionPlan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionStatus">Abonelik Durumu</Label>
                <Select
                  value={form.subscriptionStatus}
                  onValueChange={(value) =>
                    setForm({ ...form, subscriptionStatus: value })
                  }
                >
                  <SelectTrigger id="subscriptionStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRIAL">Trial (Deneme)</SelectItem>
                    <SelectItem value="ACTIVE">Active (Aktif)</SelectItem>
                    <SelectItem value="PAST_DUE">
                      Past Due (Gecikmiş)
                    </SelectItem>
                    <SelectItem value="CANCELLED">Cancelled (İptal)</SelectItem>
                    <SelectItem value="EXPIRED">
                      Expired (Süresi Dolmuş)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={updateResult.fetching}>
              {updateResult.fetching ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Company Detail Dialog Component
function CompanyDetailDialog({
  open,
  onOpenChange,
  companyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
}) {
  const { decodeGlobalId } = useRelayIds();

  // Decode the Global ID to numeric ID
  const numericId = companyId ? decodeGlobalId(companyId) : null;

  const [{ data, fetching }] = useQuery({
    query: AdminCompanyDetailDocument,
    variables: { id: numericId || 0 },
    pause: !numericId,
  });

  const company = data?.company;

  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{company.name}</DialogTitle>
          <DialogDescription>Detaylı firma bilgileri</DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-8 text-center">Yükleniyor...</div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3">Temel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{company.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span>
                  <p className="font-medium">{company.phone || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Website:</span>
                  <p className="font-medium">{company.website || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tip:</span>
                  <p className="font-medium">{company.type}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {company.description && (
              <div>
                <h3 className="font-semibold mb-2">Açıklama</h3>
                <p className="text-sm text-muted-foreground">
                  {company.description}
                </p>
              </div>
            )}

            {/* Address */}
            <div>
              <h3 className="font-semibold mb-3">Adres Bilgileri</h3>
              <div className="text-sm space-y-1">
                <p>{company.address || "-"}</p>
                <p>
                  {company.city && company.country
                    ? `${company.city}, ${company.country}`
                    : company.city || company.country || "-"}
                </p>
              </div>
            </div>

            {/* Subscription & Usage */}
            <div>
              <h3 className="font-semibold mb-3">Abonelik & Kullanım</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Plan:</span>
                  <p className="font-medium">{company.subscriptionPlan}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Durum:</span>
                  <p className="font-medium">{company.subscriptionStatus}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kullanıcılar:</span>
                  <p className="font-medium">
                    {company.currentUsers} / {company.maxUsers}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Numuneler:</span>
                  <p className="font-medium">
                    {company.currentSamples} / {company.maxSamples}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Siparişler:</span>
                  <p className="font-medium">
                    {company.currentOrders} / {company.maxOrders}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Depolama:</span>
                  <p className="font-medium">
                    {company.currentStorageGB?.toFixed(2)} /{" "}
                    {company.maxStorageGB} GB
                  </p>
                </div>
              </div>
            </div>

            {/* Employees */}
            {company.employees && company.employees.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Çalışanlar ({company.employees.length})
                </h3>
                <div className="space-y-2">
                  {company.employees.slice(0, 5).map((employee: any) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium text-sm">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {employee.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {employee.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {company.employees.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{company.employees.length - 5} çalışan daha
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
