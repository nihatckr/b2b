"use client";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthProvider";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
    CompanyFlowInput,
    User,
    useSignupMutation,
} from "../../../__generated__/graphql";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Minimal client-side validation - let server handle details
const step1Schema = z.object({
  email: z.string().min(1, "Email gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
  confirmPassword: z.string().min(1, "Şifreyi onayla"),
});

// Step 2: Personal Info
const step2Schema = z.object({
  firstName: z.string().min(1, "Ad gerekli"),
  lastName: z.string().min(1, "Soyad gerekli"),
  phone: z.string().optional(),
});

// Step 3: Company Action
const step3Schema = z.object({
  companyAction: z.enum(["CREATE_NEW", "JOIN_EXISTING", "INDIVIDUAL"]),
});

// Step 4a: Create Company (will be required only for CREATE_NEW)
const step4aSchema = z.object({
  companyName: z.string().default(""),
  companyEmail: z.string().default(""),
  companyPhone: z.string().optional(),
  companyAddress: z.string().optional(),
  companyWebsite: z.string().optional(),
  companyType: z
    .enum(["MANUFACTURER", "BUYER", "BOTH"])
    .default("MANUFACTURER"),
});

// Step 4b: Join Company
const step4bSchema = z.object({
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

// Combined schema with conditional validation
const fullSignupSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4aSchema.partial())
  .merge(step4bSchema.partial())
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.companyAction === "CREATE_NEW") {
        return data.companyName && data.companyName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Firma adı gerekli",
      path: ["companyName"],
    }
  )
  .refine(
    (data) => {
      if (data.companyAction === "CREATE_NEW") {
        return data.companyEmail && data.companyEmail.trim().length > 0;
      }
      return true;
    },
    {
      message: "Firma email gerekli",
      path: ["companyEmail"],
    }
  )
  .refine(
    (data) => {
      if (data.companyAction === "CREATE_NEW" && data.companyEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(data.companyEmail);
      }
      return true;
    },
    {
      message: "Geçersiz email formatı",
      path: ["companyEmail"],
    }
  );

type SignupFormData = z.infer<typeof fullSignupSchema>;

interface MultiStepSignupFormProps extends React.ComponentProps<"div"> {
  onSuccess?: () => void;
}

export function MultiStepSignupForm({
  className,
  onSuccess,
  ...props
}: MultiStepSignupFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Persist form data across steps
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});

  const form = useForm<SignupFormData>({
    // Remove complex validation, let server handle it
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      phone: "",
      companyAction: "INDIVIDUAL",
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      companyAddress: "",
      companyWebsite: "",
      companyType: "MANUFACTURER",
      department: "",
      jobTitle: "",
    },
  });

  const [, signupMutation] = useSignupMutation();

  const companyAction = form.watch("companyAction");

  const onSubmit = async (data: SignupFormData) => {
    console.log("🚀 Form submitted with data:", data);
    setIsLoading(true);
    try {
      // Prepare company flow input
      let companyFlowInput: CompanyFlowInput | null = null;

      if (data.companyAction === "CREATE_NEW") {
        companyFlowInput = {
          action: "CREATE_NEW",
          companyName: data.companyName,
          companyEmail: data.companyEmail,
          companyPhone: data.companyPhone,
          companyAddress: data.companyAddress,
          companyWebsite: data.companyWebsite,
          companyType: data.companyType,
        } as CompanyFlowInput;
      } else if (data.companyAction === "JOIN_EXISTING") {
        // TODO: Implement company selection
        showToast("Mevcut firmaya katılma özelliği yakında!", "info");
        setIsLoading(false);
        return;
      }

      const mutationInput = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        companyFlow: companyFlowInput,
        department: data.department || undefined,
        jobTitle: data.jobTitle || undefined,
      };

      console.log("📤 Sending mutation with input:", mutationInput);

      const result = await signupMutation({
        input: mutationInput,
      });

      console.log("📥 Mutation result:", result);

      if (result.error) {
        console.error("❌ Mutation error:", result.error);
        const errorMessage =
          result.error.graphQLErrors?.[0]?.message ||
          result.error.message ||
          "Kayıt başarısız";

        showToast(errorMessage, "error");
        form.setError("root", { message: errorMessage });
        return;
      }

      if (result.data?.signup?.token && result.data?.signup?.user) {
        console.log("✅ Signup successful, logging in...");
        login(result.data.signup.token, result.data.signup.user as User);
        showToast("Kayıt başarılı! Hoş geldiniz! 🎉", "success");

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: unknown) {
      console.error("💥 Signup catch error:", error);
      let errorMessage = "Bir hata oluştu";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: unknown }).message === "string"
      ) {
        errorMessage = (error as { message: string }).message;
      }
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Get and save current step values
    const values = form.getValues();
    setFormData((prev) => ({ ...prev, ...values }));
    console.log("💾 Saved form data:", { ...formData, ...values });

    if (currentStep === 1) {
      if (!values.email || !values.password || !values.confirmPassword) {
        showToast("Lütfen tüm alanları doldurun", "error");
        return;
      }
      if (values.password !== values.confirmPassword) {
        showToast("Şifreler eşleşmiyor", "error");
        return;
      }
    } else if (currentStep === 2) {
      if (!values.firstName || !values.lastName) {
        showToast("Ad ve soyad gerekli", "error");
        return;
      }
    }

    // Skip step 4 if INDIVIDUAL
    if (currentStep === 3 && values.companyAction === "INDIVIDUAL") {
      setCurrentStep(4); // Set to final step for totalSteps calculation
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Hesap Bilgileri";
      case 2:
        return "Kişisel Bilgiler";
      case 3:
        return "Firma Seçimi";
      case 4:
        if (companyAction === "CREATE_NEW") return "Firma Detayları";
        if (companyAction === "JOIN_EXISTING") return "Pozisyon Bilgileri";
        return "Tamamla";
      default:
        return "Kayıt Ol";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre Tekrar</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 2:
        return (
          <>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Ahmet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Yılmaz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon (Opsiyonel)</FormLabel>
                  <FormControl>
                    <Input placeholder="+90 532 123 4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 3:
        return (
          <FormField
            control={form.control}
            name="companyAction"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel>Firma Durumu</FormLabel>
                <FormControl>
                  <div className="grid gap-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        field.onChange("CREATE_NEW");
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent",
                        field.value === "CREATE_NEW"
                          ? "border-primary bg-accent"
                          : "border-muted"
                      )}
                    >
                      <div className="font-semibold">🏭 Yeni Firma Oluştur</div>
                      <div className="text-sm text-muted-foreground">
                        Kendi firmanızı oluşturun ve çalışanlarınızı ekleyin
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        field.onChange("JOIN_EXISTING");
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent",
                        field.value === "JOIN_EXISTING"
                          ? "border-primary bg-accent"
                          : "border-muted"
                      )}
                    >
                      <div className="font-semibold">
                        👥 Mevcut Firmaya Katıl
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Davet kodu ile bir firmaya çalışan olarak katılın
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        field.onChange("INDIVIDUAL");
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-lg border-2 p-4 transition-all hover:bg-accent",
                        field.value === "INDIVIDUAL"
                          ? "border-primary bg-accent"
                          : "border-muted"
                      )}
                    >
                      <div className="font-semibold">👤 Bireysel Müşteri</div>
                      <div className="text-sm text-muted-foreground">
                        Firma olmadan bireysel müşteri olarak devam edin
                      </div>
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 4:
        if (companyAction === "CREATE_NEW") {
          return (
            <>
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Firma Adı <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Defacto Tekstil A.Ş." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Firma Email <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="info@defacto.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Tipi</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seçiniz" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MANUFACTURER">
                          🏭 Üretici (Manufacturer)
                        </SelectItem>
                        <SelectItem value="BUYER">🛒 Alıcı (Buyer)</SelectItem>
                        <SelectItem value="BOTH">
                          ⚡ Her İkisi (Both)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Telefon (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="+90 212 555 0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="İstanbul, Türkiye" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="companyWebsite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="www.defacto.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        } else if (companyAction === "JOIN_EXISTING") {
          return (
            <>
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departman (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Satın Alma" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pozisyon (Opsiyonel)</FormLabel>
                    <FormControl>
                      <Input placeholder="Satın Alma Müdürü" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          );
        } else {
          // INDIVIDUAL - no extra fields
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Kayıt işlemini tamamlamak için &quot;Kayıt Ol&quot; butonuna
                tıklayın.
              </p>
            </div>
          );
        }

      default:
        return null;
    }
  };

  const totalSteps = companyAction === "INDIVIDUAL" ? 3 : 4;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{getStepTitle()}</CardTitle>
          <CardDescription className="text-center">
            Adım {currentStep} / {totalSteps}
          </CardDescription>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("⚠️ Form submit triggered on step", currentStep);
              }}
              className="space-y-4"
            >
              {renderStep()}

              {form.formState.errors.root && (
                <div className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="flex justify-between pt-4 gap-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isLoading}
                    className="h-11"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Geri
                  </Button>
                )}

                {currentStep < totalSteps && (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading}
                    className="ml-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    İleri
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {currentStep === totalSteps && (
                  <Button
                    type="button"
                    onClick={async () => {
                      console.log("🔘 Kayıt Ol button clicked");

                      // Merge all saved data with current step
                      const currentValues = form.getValues();
                      const allValues = { ...formData, ...currentValues };

                      console.log("💾 Saved formData:", formData);
                      console.log("📝 Current step values:", currentValues);
                      console.log("📋 Merged all values:", allValues);

                      // Manual validation for CREATE_NEW
                      if (allValues.companyAction === "CREATE_NEW") {
                        if (
                          !allValues.companyName?.trim() ||
                          !allValues.companyEmail?.trim()
                        ) {
                          showToast("Firma adı ve email gerekli", "error");
                          return;
                        }
                      }

                      // Validate basic required fields
                      if (!allValues.email || !allValues.password) {
                        showToast("Email ve şifre gerekli", "error");
                        console.error("❌ Missing email or password:", {
                          email: allValues.email,
                          password: allValues.password ? "***" : undefined,
                        });
                        return;
                      }

                      if (!allValues.firstName || !allValues.lastName) {
                        showToast("Ad ve soyad gerekli", "error");
                        return;
                      }

                      // Call onSubmit with merged values
                      await onSubmit(allValues as SignupFormData);
                    }}
                    disabled={isLoading}
                    className="ml-auto h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isLoading ? "Kaydediliyor..." : "Kayıt Ol"}
                  </Button>
                )}
              </div>

              {/* Login Link */}
              <div className="text-center text-sm text-gray-600 pt-4 border-t">
                Zaten hesabınız var mı?{" "}
                <a href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Giriş Yapın
                </a>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
