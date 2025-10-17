# Library Access Control Template

Her library sayfasına eklenecek kod bloğu:

## 1. Imports Ekle
```typescript
import { useAuth } from "@/context/AuthProvider";
import { ShieldX } from "lucide-react"; // Mevcut import'a ekle
import { useRouter } from "next/navigation";
import { useEffect } from "react"; // useState ile birleştirilmeli
```

## 2. Component'e Ekle (export default function içinde)
```typescript
const { user } = useAuth();
const router = useRouter();

// Check if user is manufacturer
const isManufacturer =
  (user?.role === "MANUFACTURE" ||
    user?.role === "COMPANY_OWNER" ||
    user?.role === "COMPANY_EMPLOYEE") &&
  user?.company?.type === "MANUFACTURER";

// Redirect non-manufacturers
useEffect(() => {
  if (user && !isManufacturer && user.role !== "ADMIN") {
    router.push("/dashboard");
  }
}, [user, isManufacturer, router]);

// Show access denied for non-manufacturers
if (user && !isManufacturer && user.role !== "ADMIN") {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <ShieldX className="h-16 w-16 text-red-500" />
      <h2 className="text-2xl font-bold text-gray-900">Erişim Reddedildi</h2>
      <p className="text-gray-600 text-center max-w-md">
        Bu sayfa yalnızca üretici firmaların çalışanlarına açıktır.
      </p>
    </div>
  );
}
```

## Completed:
- ✅ Colors
- ✅ Fabrics
- ⏳ Sizes
- ⏳ Seasons
- ⏳ Fits
- ⏳ Certifications
