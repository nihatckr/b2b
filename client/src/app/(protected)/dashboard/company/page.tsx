"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { Building2, Globe, Loader2, Mail, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { gql, useMutation, useQuery } from "urql";

const COMPANY_QUERY = gql`
  query CompanyDetails($id: Int!) {
    company(id: $id) {
      id
      name
      email
      phone
      address
      website
      type
      description
      isActive
      createdAt
    }
  }
`;

const UPDATE_COMPANY_MUTATION = gql`
  mutation UpdateCompanySettings(
    $id: Int!
    $name: String
    $email: String
    $phone: String
    $address: String
    $website: String
    $description: String
  ) {
    updateCompany(
      id: $id
      name: $name
      email: $email
      phone: $phone
      address: $address
      website: $website
      description: $description
    ) {
      id
      name
      email
    }
  }
`;

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    description: "",
  });

  const [{ data, fetching }] = useQuery({
    query: COMPANY_QUERY,
    variables: { id: user?.companyId || 0 },
    pause: !user?.companyId,
  });

  const [, updateCompany] = useMutation(UPDATE_COMPANY_MUTATION);

  const company = data?.company;

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        website: company.website || "",
        description: company.description || "",
      });
    }
  }, [company]);

  const handleSave = async () => {
    if (!company) return;

    try {
      const result = await updateCompany({
        id: company.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        website: formData.website || undefined,
        description: formData.description || undefined,
      });

      if (result.error) throw new Error(result.error.message);

      toast.success("Şirket bilgileri güncellendi");
      setIsEditing(false);
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Güncelleme sırasında bir hata oluştu");
    }
  };

  if (!user?.companyId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Şirket Bulunamadı</h3>
          <p className="text-sm text-muted-foreground">
            Bir şirkete bağlı değilsiniz
          </p>
        </CardContent>
      </Card>
    );
  }

  if (fetching) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Şirket Bilgisi Yok</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Şirket Bilgileri</h1>
          <p className="text-muted-foreground">
            Şirketinizin bilgilerini görüntüleyin ve düzenleyin
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Temel Bilgiler */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Şirket Adı *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Şirket Tipi</Label>
                <Select value={company.type} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANUFACTURER">Üretici</SelectItem>
                    <SelectItem value="BUYER">Alıcı</SelectItem>
                    <SelectItem value="BOTH">Her İkisi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İletişim Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>İletişim Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="+90 532 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  disabled={!isEditing}
                  placeholder="www.example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adres */}
        <Card>
          <CardHeader>
            <CardTitle>Adres Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
                rows={4}
                placeholder="Şirket adresi"
              />
            </div>
          </CardContent>
        </Card>

        {/* Açıklama */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Şirket Açıklaması</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              disabled={!isEditing}
              rows={4}
              placeholder="Şirketiniz hakkında kısa açıklama..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              if (company) {
                setFormData({
                  name: company.name || "",
                  email: company.email || "",
                  phone: company.phone || "",
                  address: company.address || "",
                  website: company.website || "",
                  description: company.description || "",
                });
              }
            }}
          >
            İptal
          </Button>
          <Button onClick={handleSave}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin hidden" />
            Kaydet
          </Button>
        </div>
      )}
    </div>
  );
}
