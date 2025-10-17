"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
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
import { useAuth } from "@/context/AuthProvider";
import { Award, Edit, FileText, Plus, ShieldX, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { gql, useMutation, useQuery } from "urql";
import { Certification } from "../../../../../__generated__/graphql";

// GraphQL Queries & Mutations
const MY_CERTIFICATIONS_QUERY = gql(/* GraphQL */ `
  query MyCertifications {
    myCertifications {
      id
      name
      code
      category
      issuer
      validFrom
      validUntil
      certificateNumber
      certificateFile
      description
      isActive
    }
  }
`);

const CREATE_CERTIFICATION_MUTATION = gql(/* GraphQL */ `
  mutation CreateCertification(
    $name: String!
    $code: String
    $category: CertificationCategory!
    $issuer: String
    $validFrom: DateTime
    $validUntil: DateTime
    $certificateNumber: String
    $certificateFile: String
    $description: String
  ) {
    createCertification(
      name: $name
      code: $code
      category: $category
      issuer: $issuer
      validFrom: $validFrom
      validUntil: $validUntil
      certificateNumber: $certificateNumber
      certificateFile: $certificateFile
      description: $description
    ) {
      id
      name
    }
  }
`);

const UPDATE_CERTIFICATION_MUTATION = gql(/* GraphQL */ `
  mutation UpdateCertification(
    $id: Int!
    $name: String
    $code: String
    $category: CertificationCategory
    $issuer: String
    $validFrom: DateTime
    $validUntil: DateTime
    $certificateNumber: String
    $certificateFile: String
    $description: String
    $isActive: Boolean
  ) {
    updateCertification(
      id: $id
      name: $name
      code: $code
      category: $category
      issuer: $issuer
      validFrom: $validFrom
      validUntil: $validUntil
      certificateNumber: $certificateNumber
      certificateFile: $certificateFile
      description: $description
      isActive: $isActive
    ) {
      id
      name
    }
  }
`);

const DELETE_CERTIFICATION_MUTATION = gql(/* GraphQL */ `
  mutation DeleteCertification($id: Int!) {
    deleteCertification(id: $id) {
      id
    }
  }
`);

type CertificationCategory =
  | "FIBER"
  | "CHEMICAL"
  | "SOCIAL"
  | "ENVIRONMENTAL"
  | "TRACEABILITY";

const categoryLabels: Record<CertificationCategory, string> = {
  FIBER: "Lif/Hammadde",
  CHEMICAL: "Kimyasal/Üretim",
  SOCIAL: "Sosyal/Etik",
  ENVIRONMENTAL: "Çevresel",
  TRACEABILITY: "İzlenebilirlik",
};

const categoryColors: Record<CertificationCategory, string> = {
  FIBER: "bg-green-100 text-green-800",
  CHEMICAL: "bg-blue-100 text-blue-800",
  SOCIAL: "bg-purple-100 text-purple-800",
  ENVIRONMENTAL: "bg-emerald-100 text-emerald-800",
  TRACEABILITY: "bg-orange-100 text-orange-800",
};

export default function CertificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [{ data }] = useQuery({ query: MY_CERTIFICATIONS_QUERY });
  const [, createCertification] = useMutation(CREATE_CERTIFICATION_MUTATION);
  const [, updateCertification] = useMutation(UPDATE_CERTIFICATION_MUTATION);
  const [, deleteCertification] = useMutation(DELETE_CERTIFICATION_MUTATION);

  // Access control
  const isManufacturer =
    (user?.role === "MANUFACTURE" ||
      user?.role === "COMPANY_OWNER" ||
      user?.role === "COMPANY_EMPLOYEE") &&
    user?.company?.type === "MANUFACTURER";

  useEffect(() => {
    if (user && !isManufacturer && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isManufacturer, router]);

  if (user && !isManufacturer && user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <ShieldX className="h-16 w-16 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
        <p className="text-gray-600 text-center max-w-md">
          Sertifika yönetimi sayfasına yalnızca üretici firmaların çalışanları erişebilir.
        </p>
      </div>
    );
  }

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "FIBER" as CertificationCategory,
    issuer: "",
    validFrom: "",
    validUntil: "",
    certificateNumber: "",
    certificateFile: "",
    description: "",
  });

  const certifications = data?.myCertifications || [];

  // Stats
  const stats = {
    total: certifications.length,
    fiber: certifications.filter(
      (c: (typeof certifications)[0]) => c.category === "FIBER"
    ).length,
    chemical: certifications.filter(
      (c: (typeof certifications)[0]) => c.category === "CHEMICAL"
    ).length,
    social: certifications.filter(
      (c: (typeof certifications)[0]) => c.category === "SOCIAL"
    ).length,
    environmental: certifications.filter(
      (c: (typeof certifications)[0]) => c.category === "ENVIRONMENTAL"
    ).length,
    traceability: certifications.filter(
      (c: (typeof certifications)[0]) => c.category === "TRACEABILITY"
    ).length,
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: "",
      code: "",
      category: "FIBER",
      issuer: "",
      validFrom: "",
      validUntil: "",
      certificateNumber: "",
      certificateFile: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (cert: (typeof certifications)[0]) => {
    setEditingId(cert.id);
    setFormData({
      name: cert.name,
      code: cert.code || "",
      category: cert.category as CertificationCategory,
      issuer: cert.issuer || "",
      validFrom: cert.validFrom
        ? new Date(cert.validFrom).toISOString().split("T")[0]
        : "",
      validUntil: cert.validUntil
        ? new Date(cert.validUntil).toISOString().split("T")[0]
        : "",
      certificateNumber: cert.certificateNumber || "",
      certificateFile: cert.certificateFile || "",
      description: cert.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateCertification({
        id: editingId,
        ...formData,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
      });
    } else {
      await createCertification({
        ...formData,
        validFrom: formData.validFrom || null,
        validUntil: formData.validUntil || null,
      });
    }
    setIsDialogOpen(false);
    window.location.reload();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bu sertifikayı silmek istediğinize emin misiniz?")) {
      await deleteCertification({ id });
      window.location.reload();
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8" />
            Certification Management
          </h1>
          <p className="text-muted-foreground mt-1">
            GOTS, OEKO-TEX, BSCI, GRS, bluesign ve diğer sertifikalarınızı
            yönetin
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sertifika
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Toplam</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700">Lif/Hammadde</p>
          <p className="text-2xl font-bold text-green-900">{stats.fiber}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">Kimyasal</p>
          <p className="text-2xl font-bold text-blue-900">{stats.chemical}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700">Sosyal</p>
          <p className="text-2xl font-bold text-purple-900">{stats.social}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700">Çevresel</p>
          <p className="text-2xl font-bold text-emerald-900">
            {stats.environmental}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-700">İzlenebilirlik</p>
          <p className="text-2xl font-bold text-orange-900">
            {stats.traceability}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sertifika Adı</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Kod</TableHead>
              <TableHead>Veren Kuruluş</TableHead>
              <TableHead>Geçerlilik</TableHead>
              <TableHead>Sertifika No</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certifications.map((cert: Certification) => {
              const isExpired =
                cert.validUntil && new Date(cert.validUntil) < new Date();
              return (
                <TableRow key={cert.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{cert.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        categoryColors[cert.category as CertificationCategory]
                      }
                    >
                      {categoryLabels[cert.category as CertificationCategory]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {cert.code || "-"}
                    </code>
                  </TableCell>
                  <TableCell>{cert.issuer || "-"}</TableCell>
                  <TableCell>
                    {cert.validFrom && cert.validUntil ? (
                      <div className="text-sm">
                        <div>
                          {new Date(cert.validFrom).toLocaleDateString("tr-TR")}
                        </div>
                        <div className="text-muted-foreground">
                          →{" "}
                          {new Date(cert.validUntil).toLocaleDateString(
                            "tr-TR"
                          )}
                        </div>
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Süresi Dolmuş
                          </Badge>
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cert.certificateNumber || "-"}
                      {cert.certificateFile && (
                        <FileText className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(cert)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cert.id)}
                        title="Sil"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Sertifika Düzenle" : "Yeni Sertifika Ekle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Sertifika Adı *</Label>
                <Input
                  placeholder="Örn: GOTS (Global Organic Textile Standard)"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: CertificationCategory) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FIBER">Lif/Hammadde</SelectItem>
                    <SelectItem value="CHEMICAL">Kimyasal/Üretim</SelectItem>
                    <SelectItem value="SOCIAL">Sosyal/Etik</SelectItem>
                    <SelectItem value="ENVIRONMENTAL">Çevresel</SelectItem>
                    <SelectItem value="TRACEABILITY">İzlenebilirlik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sertifika Kodu</Label>
                <Input
                  placeholder="Örn: GOTS-2024-TR-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Veren Kuruluş</Label>
                <Input
                  placeholder="Örn: Control Union"
                  value={formData.issuer}
                  onChange={(e) =>
                    setFormData({ ...formData, issuer: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Sertifika Numarası</Label>
                <Input
                  placeholder="Örn: CU-GOTS-851234"
                  value={formData.certificateNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificateNumber: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Geçerlilik Başlangıcı</Label>
                <Input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Geçerlilik Bitişi</Label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Sertifika Dosyası (URL)</Label>
                <Input
                  placeholder="/uploads/certifications/gots-2024.pdf"
                  value={formData.certificateFile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      certificateFile: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label>Açıklama</Label>
                <Textarea
                  placeholder="Sertifika hakkında detaylı bilgi..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingId ? "Güncelle" : "Oluştur"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
