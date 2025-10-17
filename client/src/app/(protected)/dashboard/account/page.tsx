"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthProvider";
import { Building2, Key, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useMutation } from "urql";

const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($input: UserUpdateInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      firstName
      lastName
      phone
      username
    }
  }
`;

const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

export default function AccountPage() {
  const { user } = useAuth();
  const [, updateProfile] = useMutation(UPDATE_PROFILE_MUTATION);
  const [, changePassword] = useMutation(CHANGE_PASSWORD_MUTATION);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    username: user?.username || "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);

    try {
      const result = await updateProfile({
        input: {
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          email: profileForm.email,
          phone: profileForm.phone,
          username: profileForm.username,
        },
      });

      if (result.error) {
        setProfileMessage({
          type: "error",
          text: result.error.message,
        });
      } else {
        setProfileMessage({
          type: "success",
          text: "Profil başarıyla güncellendi! Değişiklikleri görmek için sayfayı yenileyin.",
        });
        // Update local state
        setProfileForm({
          firstName: result.data.updateProfile.firstName,
          lastName: result.data.updateProfile.lastName,
          email: result.data.updateProfile.email,
          phone: result.data.updateProfile.phone,
          username: result.data.updateProfile.username,
        });
      }
    } catch (error: any) {
      setProfileMessage({
        type: "error",
        text: error.message || "Profil güncellenirken hata oluştu",
      });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Yeni şifreler eşleşmiyor",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Yeni şifre en az 6 karakter olmalı",
      });
      return;
    }

    try {
      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (result.error) {
        setPasswordMessage({
          type: "error",
          text: result.error.message,
        });
      } else {
        setPasswordMessage({
          type: "success",
          text: "Şifre başarıyla değiştirildi!",
        });
        // Clear form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      setPasswordMessage({
        type: "error",
        text: error.message || "Şifre değiştirilirken hata oluştu",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Hesap Ayarları</h1>
        <p className="text-muted-foreground mt-1">
          Profil bilgilerinizi ve hesap ayarlarınızı yönetin
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <UserIcon className="h-4 w-4" />
            Profil Bilgileri
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Key className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="h-4 w-4" />
            Firma Bilgileri
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kişisel Bilgiler</CardTitle>
              <CardDescription>
                Profil bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          firstName: e.target.value,
                        })
                      }
                      placeholder="Adınız"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          lastName: e.target.value,
                        })
                      }
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="ornek@email.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        phone: e.target.value,
                      })
                    }
                    placeholder="+90 5xx xxx xx xx"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    value={profileForm.username}
                    onChange={(e) =>
                      setProfileForm({
                        ...profileForm,
                        username: e.target.value,
                      })
                    }
                    placeholder="kullanici_adi"
                  />
                </div>

                {profileMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      profileMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <Button type="submit">Değişiklikleri Kaydet</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Şifre Değiştir</CardTitle>
              <CardDescription>
                Güvenliğiniz için güçlü bir şifre kullanın
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Mevcut şifreniz"
                    required
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Yeni şifreniz (min 6 karakter)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Yeni şifrenizi tekrar girin"
                    required
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <Button type="submit">Şifreyi Değiştir</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firma Bilgileri</CardTitle>
              <CardDescription>
                Bağlı olduğunuz firma ve rol bilgileri
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.company ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Firma Adı</Label>
                      <p className="font-medium">{user.company.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Firma Tipi</Label>
                      <p className="font-medium">
                        {user.company.type === "MANUFACTURER"
                          ? "Üretici"
                          : user.company.type === "BUYER"
                            ? "Alıcı"
                            : "Her İkisi"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Rolünüz</Label>
                      <p className="font-medium">
                        {user.isCompanyOwner ? "Firma Sahibi" : "Çalışan"}
                      </p>
                    </div>
                    {user.department && (
                      <div>
                        <Label className="text-muted-foreground">Departman</Label>
                        <p className="font-medium">{user.department}</p>
                      </div>
                    )}
                  </div>

                  {user.jobTitle && (
                    <div>
                      <Label className="text-muted-foreground">Pozisyon</Label>
                      <p className="font-medium">{user.jobTitle}</p>
                    </div>
                  )}

                  {user.company.email && (
                    <div>
                      <Label className="text-muted-foreground">Firma E-posta</Label>
                      <p className="font-medium">{user.company.email}</p>
                    </div>
                  )}

                  {user.company.phone && (
                    <div>
                      <Label className="text-muted-foreground">Firma Telefon</Label>
                      <p className="font-medium">{user.company.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">
                  Henüz bir firmaya bağlı değilsiniz.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
