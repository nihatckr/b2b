"use client";
import { PageHeader } from "@/components/common";
import {
  FormImageUpload,
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from "@/components/forms";
import { SettingsCard, SettingsSection } from "@/components/settings";
import { SubscriptionWarningBanner } from "@/components/subscription/SubscriptionWarningBanner";
import { UsageCard } from "@/components/subscription/UsageCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Bell,
  Building2,
  CreditCard,
  Globe,
  Loader2,
  Lock,
  Mail,
  Save,
  Settings,
  User,
  UserCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import NextImage from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";

// URQL imports
import {
  SettingsCompanySubscriptionDocument,
  SettingsGetCurrentUserDocument,
  SettingsGetMyCompanyDocument,
  SettingsResendVerificationEmailDocument,
  SettingsSubscriptionWarningsDocument,
  SettingsUpdateCompanyInfoDocument,
  SettingsUpdateUserNotificationsDocument,
  SettingsUpdateUserPreferencesDocument,
  SettingsUpdateUserProfileDocument,
  SettingsUsageStatisticsDocument,
} from "@/__generated__/graphql";
import { useMutation, useQuery } from "urql";

// Zod Schemas
import {
  CompanySchema,
  NotificationSchema,
  PasswordSchema,
  PreferencesSchema,
  ProfileSchema,
  type CompanyInput,
  type NotificationInput,
  type PasswordInput,
  type PreferencesInput,
  type ProfileInput,
} from "@/lib/validations";

// Change Password Mutation (not yet in GraphQL operations file)
const CHANGE_PASSWORD_MUTATION = `
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

// Type definitions from imported schemas
type ProfileFormValues = ProfileInput;
type NotificationFormValues = NotificationInput;
type PreferencesFormValues = PreferencesInput;
type PasswordFormValues = PasswordInput;
type CompanyFormValues = CompanyInput;

export default function SettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // URQL Queries
  const [{ data: userData }] = useQuery({
    query: SettingsGetCurrentUserDocument,
  });

  const isCompanyOwner = session?.user?.isCompanyOwner || false;
  const hasCompany = !!session?.user?.companyId;

  const [{ data: companyData }] = useQuery({
    query: SettingsGetMyCompanyDocument,
    pause: !hasCompany || !isCompanyOwner, // Only fetch if user has company and is owner
  });

  // Subscription Queries
  const [{ data: subscriptionData }] = useQuery({
    query: SettingsCompanySubscriptionDocument,
    pause: !hasCompany,
  });

  const [{ data: usageData }] = useQuery({
    query: SettingsUsageStatisticsDocument,
    pause: !hasCompany,
  });

  const [{ data: warningsData }] = useQuery({
    query: SettingsSubscriptionWarningsDocument,
    pause: !hasCompany,
  });

  // URQL Mutations
  const [, updateProfileMutation] = useMutation(
    SettingsUpdateUserProfileDocument
  );
  const [, updateNotificationsMutation] = useMutation(
    SettingsUpdateUserNotificationsDocument
  );
  const [, updatePreferencesMutation] = useMutation(
    SettingsUpdateUserPreferencesDocument
  );
  const [, updateCompanyMutation] = useMutation(
    SettingsUpdateCompanyInfoDocument
  );
  const [{ fetching: isResendingEmail }, resendEmailMutation] = useMutation(
    SettingsResendVerificationEmailDocument
  );

  // URL'den tab parametresini al ve set et
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Check if email is verified
  const isEmailVerified = session?.user?.emailVerified || false;

  // Resend verification email with URQL
  const resendVerificationEmail = async () => {
    const result = await resendEmailMutation({});

    if (result.error) {
      toast.error(result.error.message || "Email gönderilemedi");
    } else if (result.data) {
      toast.success(
        "Doğrulama emaili gönderildi! 📧 Lütfen email'inizi kontrol edin."
      );
    }
  };

  // Profile Form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      bio: "",
      avatar: "",
      customAvatar: "",
    },
  });

  // Notification Form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(NotificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  // Preferences Form
  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      language: "tr",
      timezone: "Europe/Istanbul",
    },
  });

  // Password Form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Company Form
  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(CompanySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      website: "",
      address: "",
      city: "",
      country: "",
      logo: "",
      coverImage: "",
    },
  });

  // Ensure coverImage is always a string (avoid string | undefined for NextImage src)
  const coverImage = companyForm.watch("coverImage") || "";

  // Load user data from URQL query
  useEffect(() => {
    if (userData?.me) {
      const user = userData.me;

      // Parse socialLinks JSON
      const socialLinks = user.socialLinks ? JSON.parse(user.socialLinks) : {};

      profileForm.reset({
        name: user.name || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        jobTitle: user.jobTitle || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        customAvatar: user.customAvatar || "",
        // Social links
        twitter: socialLinks.twitter || "",
        linkedin: socialLinks.linkedin || "",
        github: socialLinks.github || "",
      });

      // Update notification form
      notificationForm.reset({
        emailNotifications: user.emailNotifications ?? true,
        pushNotifications: user.pushNotifications ?? true,
      });

      // Update preferences form
      preferencesForm.reset({
        language: user.language || "tr",
        timezone: user.timezone || "Europe/Istanbul",
      });
    }
  }, [userData, profileForm, notificationForm, preferencesForm]);

  // Load company data from URQL query
  useEffect(() => {
    if (companyData?.myCompany) {
      const company = companyData.myCompany;

      // Parse JSON fields
      const social = company.socialLinks ? JSON.parse(company.socialLinks) : {};
      const colors = company.brandColors ? JSON.parse(company.brandColors) : {};

      companyForm.reset({
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        description: company.description || "",
        website: company.website || "",
        address: company.address || "",
        city: company.city || "",
        country: company.country || "",
        logo: company.logo || "",
        coverImage: company.coverImage || "",
        // Social links
        instagram: social.instagram || "",
        companyLinkedin: social.linkedin || "",
        facebook: social.facebook || "",
        // Brand colors
        primaryColor: colors.primary || "#000000",
        secondaryColor: colors.secondary || "#666666",
        accentColor: colors.accent || "#0066FF",
        // Public profile
        profileSlug: company.profileSlug || "",
        isPublicProfile: company.isPublicProfile || false,
      });
    }
  }, [companyData, companyForm]);

  // Profile Update Handler with URQL
  const onProfileSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      // Create socialLinks JSON from individual fields
      const socialLinks = JSON.stringify({
        twitter: values.twitter || null,
        linkedin: values.linkedin || null,
        github: values.github || null,
      });

      const result = await updateProfileMutation({
        ...values,
        socialLinks,
      });

      if (result.error) {
        toast.error(result.error.message || "Profil güncellenemedi");
        return;
      }

      // Update session
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: values.name,
          jobTitle: values.jobTitle,
        },
      });

      toast.success("Profil başarıyla güncellendi! ✅");
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Notification Update Handler with URQL
  const onNotificationSubmit = async (values: NotificationFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateNotificationsMutation(values);

      if (result.error) {
        toast.error(result.error.message || "Ayarlar güncellenemedi");
        return;
      }

      toast.success("Bildirim ayarları güncellendi! 🔔");
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preferences Update Handler with URQL
  const onPreferencesSubmit = async (values: PreferencesFormValues) => {
    setIsLoading(true);
    try {
      const result = await updatePreferencesMutation(values);

      if (result.error) {
        toast.error(result.error.message || "Tercihler güncellenemedi");
        return;
      }

      toast.success("Tercihler güncellendi! 🌐");
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Password Change Handler
  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.backendToken}`,
          },
          body: JSON.stringify({
            query: CHANGE_PASSWORD_MUTATION,
            variables: {
              oldPassword: values.oldPassword,
              newPassword: values.newPassword,
            },
          }),
        }
      );

      const data = await response.json();

      if (data.errors) {
        toast.error(data.errors[0].message || "Şifre değiştirilemedi");
        return;
      }

      toast.success("Şifre başarıyla değiştirildi! 🔒");
      passwordForm.reset();
    } catch (error) {
      toast.error("Bir hata oluştu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Company Update Handler
  // Company Update Handler with URQL
  const onCompanySubmit = async (values: CompanyFormValues) => {
    // Company ID session'dan veya query'den al
    const companyId = session?.user?.companyId || companyData?.myCompany?.id;

    if (!companyId) {
      toast.error("Firma ID bulunamadı. Lütfen yeniden giriş yapın.");
      return;
    }

    setIsLoading(true);
    try {
      // Create socialLinks JSON from individual fields
      const socialLinks = JSON.stringify({
        instagram: values.instagram || null,
        linkedin: values.companyLinkedin || null,
        facebook: values.facebook || null,
      });

      // Create brandColors JSON from individual fields
      const brandColors = JSON.stringify({
        primary: values.primaryColor || "#000000",
        secondary: values.secondaryColor || "#666666",
        accent: values.accentColor || "#0066FF",
      });

      const result = await updateCompanyMutation({
        id: Number(companyId), // Convert to number
        name: values.name,
        email: values.email,
        phone: values.phone,
        description: values.description,
        website: values.website,
        address: values.address,
        city: values.city,
        country: values.country,
        logo: values.logo,
        coverImage: values.coverImage,
        socialLinks,
        brandColors,
        profileSlug: values.profileSlug,
        isPublicProfile: values.isPublicProfile,
      });

      if (result.error) {
        toast.error(result.error.message || "Firma bilgileri güncellenemedi");
        return;
      }

      toast.success("Firma bilgileri başarıyla güncellendi! 🏢");
    } catch (error) {
      console.error("❌ Error updating company:", error);
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Header */}
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        icon={<Settings className="h-6 w-6" />}
      />

      <Separator />

      {/* Email Verification Warning */}
      {!isEmailVerified && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Email Doğrulaması Gerekli</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Hesabınızı tam olarak kullanabilmek için email adresinizi
              doğrulamanız gerekmektedir. Lütfen email kutunuzu kontrol edin.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={resendVerificationEmail}
              disabled={isResendingEmail}
              className="ml-4"
            >
              {isResendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Tekrar Gönder
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 h-auto gap-2">
          <TabsTrigger
            value="profile"
            className="flex items-center justify-center"
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="flex items-center justify-center"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger
            value="messages"
            className="flex items-center justify-center"
          >
            <Mail className="mr-2 h-4 w-4" />
            Messages
          </TabsTrigger>
          {hasCompany && isCompanyOwner && (
            <TabsTrigger
              value="company"
              className="flex items-center justify-center"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </TabsTrigger>
          )}
          <TabsTrigger
            value="notifications"
            className="flex items-center justify-center"
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="preferences"
            className="flex items-center justify-center"
          >
            <Globe className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center justify-center"
          >
            <Lock className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
          {hasCompany && (
            <TabsTrigger
              value="subscription"
              className="flex items-center justify-center"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Subscription & Billing
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <SettingsCard
            title="Profile Information"
            description="Update your personal information and how others see you"
            form={profileForm}
            onSubmit={onProfileSubmit}
            isLoading={isLoading}
            submitLabel="Save Profile"
          >
            {/* Profile Picture Preview */}
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/50">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-2 border-background shadow-md overflow-hidden bg-primary/10">
                  {profileForm.watch("customAvatar") || session?.user?.image ? (
                    <NextImage
                      width={100}
                      height={100}
                      src={
                        profileForm.watch("customAvatar") ||
                        session?.user?.image ||
                        ""
                      }
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UserCircle className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-semibold truncate">
                  {profileForm.watch("name") ||
                    session?.user?.name ||
                    "Your Name"}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {profileForm.watch("jobTitle") || "Add your job title"}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>

            <SettingsSection
              title="Basic Information"
              description="Your personal details"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <FormInput
                  control={profileForm.control}
                  name="name"
                  label="Full Name *"
                  placeholder="John Doe"
                />

                <FormInput
                  control={profileForm.control}
                  name="jobTitle"
                  label="Job Title"
                  placeholder="Production Manager"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <FormInput
                  control={profileForm.control}
                  name="firstName"
                  label="First Name"
                  placeholder="John"
                />

                <FormInput
                  control={profileForm.control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Doe"
                />
              </div>

              <FormInput
                control={profileForm.control}
                name="phone"
                label="Phone Number"
                placeholder="+90 555 123 4567"
              />

              <FormTextarea
                control={profileForm.control}
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself..."
                description="Brief description for your profile (max 500 characters)"
                rows={4}
                maxLength={500}
              />
            </SettingsSection>

            <SettingsSection>
              <FormInput
                control={profileForm.control}
                name="customAvatar"
                label="Profile Picture URL"
                description="Enter a custom avatar URL (replaces OAuth photo)"
                placeholder="https://example.com/avatar.jpg"
              />
            </SettingsSection>

            <SettingsSection
              title="Social Media"
              description="Connect your social media accounts"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <FormInput
                  control={profileForm.control}
                  name="twitter"
                  label="Twitter / X"
                  placeholder="https://twitter.com/username"
                />

                <FormInput
                  control={profileForm.control}
                  name="linkedin"
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <FormInput
                control={profileForm.control}
                name="github"
                label="GitHub"
                placeholder="https://github.com/username"
              />
            </SettingsSection>

            {!isEmailVerified && (
              <p className="text-sm text-muted-foreground pt-4">
                * Email verification required to save changes
              </p>
            )}
          </SettingsCard>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                View your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your email address cannot be changed
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Role</Label>
                  <Input
                    value={session?.user?.role || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {session?.user?.companyId && (
                  <div className="grid gap-2">
                    <Label>Company ID</Label>
                    <Input
                      value={session.user.companyId || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                {session?.user?.department && (
                  <div className="grid gap-2">
                    <Label>Department</Label>
                    <Input
                      value={session.user.department || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Settings</CardTitle>
              <CardDescription>
                Manage your messaging preferences and inbox
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Coming Soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Message management features will be available soon.
                    You&apos;ll be able to:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>View and manage your messages</li>
                    <li>Configure message notifications</li>
                    <li>Set auto-reply preferences</li>
                    <li>Archive or delete conversations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        {/* Company Tab */}
        {hasCompany && isCompanyOwner && (
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Manage your company profile and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                {companyData === undefined ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Form {...companyForm}>
                    <form
                      onSubmit={companyForm.handleSubmit(onCompanySubmit)}
                      className="space-y-6"
                    >
                      {/* Visual Branding Section - Cover + Logo + Profile */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Visual Identity
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Customize your company&apos;s visual appearance
                          </p>
                          {/* Cover Image Preview */}
                          <div className="relative rounded-lg border overflow-hidden bg-muted">
                            {/* Cover Image Background */}
                            <div className="relative h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5">
                              {coverImage ? (
                                <NextImage
                                  width={100}
                                  height={100}
                                  src={coverImage}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <p className="text-sm text-muted-foreground">
                                    Kapak görseli yok
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Edit Cover Button */}
                            <div className="absolute top-4 right-4">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="shadow-md"
                                onClick={() => {
                                  // Scroll to cover image upload
                                  document
                                    .getElementById("cover-upload-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                              >
                                Kapak Düzenle
                              </Button>
                            </div>
                          </div>

                          {/* Logo + Profile Section */}
                          <div className="relative px-6 pb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
                              {/* Company Logo */}
                              <div className="relative">
                                <div className="h-32 w-32 rounded-lg border-4 border-background bg-background shadow-xl overflow-hidden">
                                  {companyForm.watch("logo") ? (
                                    <NextImage
                                      width={100}
                                      height={100}
                                      src={companyForm.watch("logo")!}
                                      alt=""
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-muted">
                                      <Building2 className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs shadow-md"
                                  onClick={() => {
                                    document
                                      .getElementById("logo-upload-section")
                                      ?.scrollIntoView({ behavior: "smooth" });
                                  }}
                                >
                                  Logo Düzenle
                                </Button>
                              </div>

                              {/* Company Info */}
                              <div className="flex-1 pt-2">
                                <h3 className="text-2xl font-bold">
                                  {companyForm.watch("name") || "Şirket Adı"}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {companyForm.watch("description") ||
                                    "Şirketiniz için bir açıklama ekleyin"}
                                </p>
                                {companyForm.watch("website") && (
                                  <a
                                    href={companyForm.watch("website")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                                  >
                                    <Globe className="h-3 w-3" />
                                    {companyForm.watch("website")}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Alert for Preview */}
                        <Alert>
                          <Building2 className="h-4 w-4" />
                          <AlertTitle>Önizleme</AlertTitle>
                          <AlertDescription>
                            Şirket profiliniz başkalarına bu şekilde
                            görünecektir. Logo, kapak görseli ve şirket
                            bilgilerinizi aşağıdan güncelleyebilirsiniz.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <Separator />

                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            Basic Information
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Essential company details
                          </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormInput
                            control={companyForm.control}
                            name="name"
                            label="Company Name *"
                            placeholder="Acme Corporation"
                          />

                          <FormInput
                            control={companyForm.control}
                            name="email"
                            label="Company Email"
                            type="email"
                            placeholder="info@company.com"
                          />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormInput
                            control={companyForm.control}
                            name="phone"
                            label="Company Phone"
                            placeholder="+90 555 123 4567"
                          />

                          <FormInput
                            control={companyForm.control}
                            name="website"
                            label="Website"
                            placeholder="https://www.company.com"
                          />
                        </div>

                        <FormTextarea
                          control={companyForm.control}
                          name="description"
                          label="Company Description"
                          placeholder="Tell us about your company..."
                          description="Brief description about your company (max 1000 characters)"
                          rows={4}
                          maxLength={1000}
                        />
                      </div>

                      <Separator />

                      {/* Location */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Location</h3>
                          <p className="text-sm text-muted-foreground">
                            Company address and location details
                          </p>
                        </div>

                        <FormInput
                          control={companyForm.control}
                          name="address"
                          label="Address"
                          placeholder="123 Main Street"
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormInput
                            control={companyForm.control}
                            name="city"
                            label="City"
                            placeholder="Istanbul"
                          />

                          <FormInput
                            control={companyForm.control}
                            name="country"
                            label="Country"
                            placeholder="Turkey"
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Branding Assets Upload */}
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">
                            Branding Assets
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Upload your company&apos;s visual assets
                          </p>
                        </div>

                        {/* Logo Upload */}
                        <div id="logo-upload-section">
                          <FormImageUpload
                            value={companyForm.watch("logo")}
                            onChange={(url) =>
                              companyForm.setValue("logo", url)
                            }
                            onDelete={async () => {
                              // Clear form state immediately (optimistic update)
                              companyForm.setValue("logo", "");

                              // Update backend to persist the change
                              try {
                                const companyId =
                                  session?.user?.companyId ||
                                  companyData?.myCompany?.id;
                                if (!companyId) {
                                  toast.error("Şirket ID bulunamadı");
                                  return;
                                }

                                const result = await updateCompanyMutation({
                                  id: Number(companyId),
                                  logo: "",
                                });

                                if (result.error) {
                                  console.error(
                                    "❌ Backend update failed:",
                                    result.error
                                  );
                                  toast.error("Logo veritabanından silinemedi");
                                } else {
                                  toast.success("Logo kaldırıldı");
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Error updating backend:",
                                  error
                                );
                                toast.error("Bir hata oluştu");
                              }
                            }}
                            label="Company Logo"
                            description="PNG, JPG or SVG - Square format recommended"
                            maxSize={5}
                            recommended="512x512px"
                            aspectRatio="square"
                            uploadType="logo"
                          />
                        </div>

                        {/* Cover Image Upload */}
                        <div id="cover-upload-section">
                          <FormImageUpload
                            value={companyForm.watch("coverImage")}
                            onChange={(url) =>
                              companyForm.setValue("coverImage", url)
                            }
                            onDelete={async () => {
                              // Clear form state immediately (optimistic update)
                              companyForm.setValue("coverImage", "");

                              // Update backend to persist the change
                              try {
                                const companyId =
                                  session?.user?.companyId ||
                                  companyData?.myCompany?.id;
                                if (!companyId) {
                                  toast.error("Şirket ID bulunamadı");
                                  return;
                                }

                                const result = await updateCompanyMutation({
                                  id: Number(companyId),
                                  coverImage: "",
                                });

                                if (result.error) {
                                  console.error(
                                    "❌ Backend update failed:",
                                    result.error
                                  );
                                  toast.error(
                                    "Kapak resmi veritabanından silinemedi"
                                  );
                                } else {
                                  toast.success("Kapak resmi kaldırıldı");
                                }
                              } catch (error) {
                                console.error(
                                  "❌ Error updating backend:",
                                  error
                                );
                                toast.error("Bir hata oluştu");
                              }
                            }}
                            label="Cover Image"
                            description="PNG or JPG - Wide format for banner background"
                            maxSize={10}
                            recommended="1920x1080px"
                            aspectRatio="wide"
                            uploadType="cover"
                          />
                        </div>

                        {/* Brand Colors */}
                        <div className="space-y-4 pt-4">
                          <div>
                            <h4 className="text-sm font-medium">
                              Brand Colors
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Define your brand&apos;s color palette
                            </p>
                          </div>
                          <div className="grid gap-6 md:grid-cols-3">
                            <FormField
                              control={companyForm.control}
                              name="primaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Primary Color</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        {...field}
                                        className="h-10 w-20"
                                      />
                                      <Input
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="flex-1 font-mono text-sm"
                                        placeholder="#000000"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Main brand color
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={companyForm.control}
                              name="secondaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Secondary Color</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        {...field}
                                        className="h-10 w-20"
                                      />
                                      <Input
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="flex-1 font-mono text-sm"
                                        placeholder="#666666"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Secondary brand color
                                  </FormDescription>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={companyForm.control}
                              name="accentColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Accent Color</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        {...field}
                                        className="h-10 w-20"
                                      />
                                      <Input
                                        type="text"
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="flex-1 font-mono text-sm"
                                        placeholder="#0066FF"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription className="text-xs">
                                    Accent/highlight color
                                  </FormDescription>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Social Media */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">Social Media</h3>
                          <p className="text-sm text-muted-foreground">
                            Connect your company&apos;s social media accounts
                          </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <FormInput
                            control={companyForm.control}
                            name="instagram"
                            label="Instagram"
                            placeholder="https://instagram.com/company"
                          />

                          <FormInput
                            control={companyForm.control}
                            name="companyLinkedin"
                            label="LinkedIn"
                            placeholder="https://linkedin.com/company/name"
                          />
                        </div>

                        <FormInput
                          control={companyForm.control}
                          name="facebook"
                          label="Facebook"
                          placeholder="https://facebook.com/company"
                        />
                      </div>

                      <Separator />

                      {/* Public Profile */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium">
                            Public Profile
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Make your company profile publicly accessible
                          </p>
                        </div>

                        <FormSwitch
                          control={companyForm.control}
                          name="isPublicProfile"
                          label="Public Profile"
                          description="Allow anyone to view your company profile"
                        />

                        <FormInput
                          control={companyForm.control}
                          name="profileSlug"
                          label="Profile URL Slug"
                          placeholder="your-company-name"
                          description={
                            companyForm.watch("profileSlug")
                              ? `Profile will be available at: yourapp.com/profile/${companyForm.watch(
                                  "profileSlug"
                                )}`
                              : "Choose a unique URL for your company profile"
                          }
                          disabled={!companyForm.watch("isPublicProfile")}
                        />
                      </div>

                      {companyData?.myCompany?.type && (
                        <Alert>
                          <Building2 className="h-4 w-4" />
                          <AlertTitle>Company Type</AlertTitle>
                          <AlertDescription>
                            {companyData.myCompany.type}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex items-center gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading || !isEmailVerified}
                          size="lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving Changes...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save Company Information
                            </>
                          )}
                        </Button>
                        {!isEmailVerified && (
                          <p className="text-sm text-muted-foreground">
                            * Email verification required
                          </p>
                        )}
                      </div>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form
                  onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                  className="space-y-6"
                >
                  {/* General Settings */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">General</h3>
                      <p className="text-sm text-muted-foreground">
                        Control how you receive notifications
                      </p>
                    </div>

                    <FormSwitch
                      control={notificationForm.control}
                      name="emailNotifications"
                      label="Email Notifications"
                      description="Receive notifications via email about important updates"
                    />

                    <FormSwitch
                      control={notificationForm.control}
                      name="pushNotifications"
                      label="Real-time Notifications"
                      description="Receive instant notifications in the bell icon (WebSocket subscriptions)"
                    />
                  </div>

                  <Separator />

                  {/* Notification Types */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Notification Types
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Choose which events trigger notifications
                      </p>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Profile Updates</p>
                          <p className="text-xs text-muted-foreground">
                            When your profile is successfully updated
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Always On
                          </span>
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            System Notifications
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Important system updates and announcements
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Always On
                          </span>
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Display Preferences */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        Display Preferences
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Customize how notifications appear
                      </p>
                    </div>

                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Silent Mode</p>
                          <p className="text-xs text-muted-foreground">
                            System notifications only show in bell icon (no
                            toast popups)
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">
                            Important Alerts
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Error and warning notifications show toast popups
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">Auto-dismiss</p>
                          <p className="text-xs text-muted-foreground">
                            Notifications automatically expire after 5-10
                            minutes
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Bell className="h-4 w-4" />
                      <AlertTitle>Real-time Notifications Active</AlertTitle>
                      <AlertDescription>
                        You&apos;re receiving real-time notifications via
                        WebSocket. Notifications appear instantly in the bell
                        icon and important alerts show as toast popups.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailVerified}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                  {!isEmailVerified && (
                    <p className="text-sm text-muted-foreground mt-2">
                      * Email doğrulaması gereklidir
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...preferencesForm}>
                <form
                  onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)}
                  className="space-y-6"
                >
                  <FormSelect
                    control={preferencesForm.control}
                    name="language"
                    label="Language"
                    description="Select your preferred language"
                    options={[
                      { value: "tr", label: "Türkçe" },
                      { value: "en", label: "English" },
                    ]}
                  />

                  <FormSelect
                    control={preferencesForm.control}
                    name="timezone"
                    label="Timezone"
                    description="Select your timezone for accurate time displays"
                    options={[
                      { value: "Europe/Istanbul", label: "Istanbul (GMT+3)" },
                      { value: "Europe/London", label: "London (GMT+0)" },
                      { value: "America/New_York", label: "New York (GMT-5)" },
                      { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
                    ]}
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailVerified}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                  {!isEmailVerified && (
                    <p className="text-sm text-muted-foreground mt-2">
                      * Email doğrulaması gereklidir
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <FormInput
                    control={passwordForm.control}
                    name="oldPassword"
                    label="Current Password"
                    type="password"
                    placeholder="••••••••"
                  />

                  <FormInput
                    control={passwordForm.control}
                    name="newPassword"
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    description="Must be at least 8 characters long"
                  />

                  <FormInput
                    control={passwordForm.control}
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    placeholder="••••••••"
                  />

                  <Button
                    type="submit"
                    disabled={isLoading || !isEmailVerified}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Change Password
                      </>
                    )}
                  </Button>
                  {!isEmailVerified && (
                    <p className="text-sm text-muted-foreground mt-2">
                      * Email doğrulaması gereklidir
                    </p>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-muted-foreground">
                    Two-factor authentication is not enabled
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Enable (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab - Read-Only View */}
        {hasCompany && (
          <TabsContent value="subscription" className="space-y-4">
            {/* Subscription & Billing */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>
                  View your current plan, usage limits, and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="flex items-start justify-between p-4 rounded-lg border bg-muted/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">
                        {subscriptionData?.myCompany?.subscriptionPlan ||
                          "FREE"}{" "}
                        Plan
                      </h4>
                      {subscriptionData?.myCompany?.subscriptionStatus ===
                        "ACTIVE" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                          Active
                        </span>
                      )}
                      {subscriptionData?.myCompany?.subscriptionStatus ===
                        "TRIAL" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400">
                          Trial
                        </span>
                      )}
                      {subscriptionData?.myCompany?.subscriptionStatus ===
                        "EXPIRED" && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-700 dark:text-red-400">
                          Expired
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subscriptionData?.myCompany?.subscriptionStartDate && (
                        <>
                          Started:{" "}
                          {new Date(
                            subscriptionData.myCompany.subscriptionStartDate
                          ).toLocaleDateString("tr-TR")}
                        </>
                      )}
                    </p>
                    {subscriptionData?.myCompany?.subscriptionEndDate && (
                      <p className="text-sm text-muted-foreground">
                        {subscriptionData.myCompany.subscriptionStatus ===
                        "ACTIVE"
                          ? "Renews"
                          : "Expired"}
                        :{" "}
                        {new Date(
                          subscriptionData.myCompany.subscriptionEndDate
                        ).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                  </div>
                  {isCompanyOwner && (
                    <Button
                      onClick={() => {
                        const companyId = session?.user?.companyId;
                        if (companyId) {
                          router.push(
                            `/dashboard/companies-management/${companyId}?tab=subscription`
                          );
                        }
                      }}
                    >
                      Manage Plan
                    </Button>
                  )}
                </div>

                {/* Warnings */}
                {warningsData?.subscriptionWarnings &&
                  warningsData.subscriptionWarnings.length > 0 && (
                    <div className="space-y-2">
                      {warningsData.subscriptionWarnings.map(
                        (warning, index) => (
                          <SubscriptionWarningBanner
                            key={index}
                            type={warning.type as any}
                            severity={warning.severity as any}
                            message={warning.message}
                            action={warning.action as any}
                            onActionClick={() => {
                              if (
                                warning.action === "UPGRADE" &&
                                isCompanyOwner
                              ) {
                                const companyId = session?.user?.companyId;
                                if (companyId) {
                                  router.push(
                                    `/dashboard/companies-management/${companyId}?tab=subscription`
                                  );
                                }
                              }
                            }}
                          />
                        )
                      )}
                    </div>
                  )}

                {/* Usage Statistics */}
                {usageData?.usageStatistics && (
                  <div>
                    <h4 className="text-sm font-medium mb-3">
                      Usage Statistics
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <UsageCard
                        label="Users"
                        current={usageData.usageStatistics.users.current}
                        max={usageData.usageStatistics.users.max}
                        percentage={usageData.usageStatistics.users.percentage}
                        isNearLimit={
                          usageData.usageStatistics.users.isNearLimit
                        }
                      />
                      <UsageCard
                        label="Samples"
                        current={usageData.usageStatistics.samples.current}
                        max={usageData.usageStatistics.samples.max}
                        percentage={
                          usageData.usageStatistics.samples.percentage
                        }
                        isNearLimit={
                          usageData.usageStatistics.samples.isNearLimit
                        }
                      />
                      <UsageCard
                        label="Orders"
                        current={usageData.usageStatistics.orders.current}
                        max={usageData.usageStatistics.orders.max}
                        percentage={usageData.usageStatistics.orders.percentage}
                        isNearLimit={
                          usageData.usageStatistics.orders.isNearLimit
                        }
                      />
                      <UsageCard
                        label="Collections"
                        current={usageData.usageStatistics.collections.current}
                        max={usageData.usageStatistics.collections.max}
                        percentage={
                          usageData.usageStatistics.collections.percentage
                        }
                        isNearLimit={
                          usageData.usageStatistics.collections.isNearLimit
                        }
                      />
                      <UsageCard
                        label="Storage"
                        current={usageData.usageStatistics.storageGB.current}
                        max={usageData.usageStatistics.storageGB.max}
                        percentage={
                          usageData.usageStatistics.storageGB.percentage
                        }
                        isNearLimit={
                          usageData.usageStatistics.storageGB.isNearLimit
                        }
                        unit="GB"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card for Non-Owners */}
            {!isCompanyOwner && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Subscription Management
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Only company owners can manage subscription plans.
                        Contact your company owner to upgrade or change the
                        plan.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
