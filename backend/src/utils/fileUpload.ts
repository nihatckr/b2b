import { randomBytes } from "crypto";
import { fileTypeFromBuffer } from "file-type";
import fs from "fs";
import path from "path";
import { RateLimiterMemory } from "rate-limiter-flexible";
import sanitizeFilename from "sanitize-filename";

/**
 * File Upload Service with Security Features
 *
 * Güvenlik Özellikleri:
 * - Path traversal koruması
 * - Filename sanitization
 * - Magic number validation (gerçek dosya tipi kontrolü)
 * - Rate limiting (upload bombing koruması)
 * - File size validation
 * - Malicious filename detection
 */

// Upload dizinleri
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const CATEGORIES = {
  sketches: "sketches",
  samples: "ai-generated-samples",
  collections: "collections",
  documents: "documents",
  production: "production",
  temp: "temp",
  // Library item categories
  fabrics: "library/fabrics",
  colors: "library/colors",
  materials: "library/materials",
  accessories: "library/accessories",
  certifications: "library/certifications",
  sizeGroups: "library/size-groups",
  fits: "library/fits",
  seasons: "library/seasons",
} as const;

// Rate limiter: 10 dosya / 1 dakika per IP/user
const uploadRateLimiter = new RateLimiterMemory({
  points: 10, // 10 upload
  duration: 60, // 1 dakika
});

// Dizinleri oluştur
Object.values(CATEGORIES).forEach((category) => {
  const dir = path.join(UPLOAD_DIR, category);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// WHATWG File API type (compatible with GraphQL Yoga v5)
// No need for custom FileUpload interface - use standard File type

export interface UploadedFile {
  id: string;
  filename: string;
  originalFilename: string;
  path: string;
  relativePath: string;
  size: number;
  mimetype: string;
  encoding: string;
  url: string;
}

/**
 * Validation hatası interface'i
 */
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Dosya adını güvenli hale getir (Path Traversal koruması)
 *
 * @param filename - Temizlenecek dosya adı
 * @returns Güvenli dosya adı
 */
function sanitizeFileName(filename: string): string {
  if (!filename || typeof filename !== "string") {
    throw new Error("Geçersiz dosya adı");
  }

  // 1. sanitize-filename ile temel temizlik
  let sanitized = sanitizeFilename(filename, { replacement: "_" });

  // 2. Path traversal karakterlerini temizle
  sanitized = sanitized.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[/\\]/g, "_");

  // 3. Null bytes temizle
  sanitized = sanitized.replace(/\0/g, "");

  // 4. Unicode control characters temizle
  sanitized = sanitized.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");

  // 5. Windows reserved names engelle
  const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
  const nameWithoutExt = path.basename(sanitized, path.extname(sanitized));
  if (reservedNames.test(nameWithoutExt)) {
    sanitized = `file_${sanitized}`;
  }

  // 6. Boş dosya adı kontrolü
  if (sanitized.length === 0) {
    throw new Error("Dosya adı temizlendikten sonra boş kaldı");
  }

  // 7. Çok uzun dosya adlarını kısalt (max 255 karakter)
  if (sanitized.length > 255) {
    const ext = path.extname(sanitized);
    const nameWithoutExt = sanitized.substring(0, 255 - ext.length);
    sanitized = nameWithoutExt + ext;
  }

  return sanitized;
}

/**
 * Dosya uzantısını doğrula (whitelist yaklaşımı)
 *
 * @param filename - Dosya adı
 * @param allowedExtensions - İzin verilen uzantılar
 * @returns Uzantı geçerli mi?
 */
function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): boolean {
  const ext = path.extname(filename).toLowerCase();

  if (!ext) {
    return false; // Uzantısız dosyalar reddedilir
  }

  // Nokta ile başlayan uzantıları normalize et
  const normalizedExt = ext.startsWith(".") ? ext : `.${ext}`;
  const normalizedAllowed = allowedExtensions.map((e) =>
    e.startsWith(".") ? e.toLowerCase() : `.${e.toLowerCase()}`
  );

  return normalizedAllowed.includes(normalizedExt);
}

/**
 * Dosya içeriğini magic number ile doğrula
 * MIME type spoofing'i önler
 *
 * @param buffer - Dosya buffer'ı
 * @param declaredMimeType - Bildirilen MIME type
 * @returns Gerçek dosya tipi veya null
 */
async function validateFileContent(
  buffer: Buffer,
  declaredMimeType: string
): Promise<{ valid: boolean; actualMimeType?: string; error?: string }> {
  try {
    // Magic number ile gerçek dosya tipini tespit et
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      // Bazı text dosyaları magic number içermez
      const textMimeTypes = [
        "text/plain",
        "text/csv",
        "text/xml",
        "application/xml",
        "application/json",
      ];

      if (textMimeTypes.includes(declaredMimeType)) {
        return { valid: true };
      }

      return {
        valid: false,
        error: "Dosya tipi tespit edilemedi",
      };
    }

    // Bildirilen MIME type ile gerçek MIME type'ı karşılaştır
    const actualMimeType = fileType.mime;

    // Bazı MIME type'lar birbiriyle uyumlu (örn: image/jpeg vs image/jpg)
    const compatibleMimeTypes: Record<string, string[]> = {
      "image/jpeg": ["image/jpeg", "image/jpg"],
      "image/jpg": ["image/jpeg", "image/jpg"],
      "application/x-zip-compressed": ["application/zip"],
      "application/zip": ["application/x-zip-compressed"],
    };

    const declaredCompatible = compatibleMimeTypes[declaredMimeType] || [
      declaredMimeType,
    ];
    const actualCompatible = compatibleMimeTypes[actualMimeType] || [
      actualMimeType,
    ];

    const isCompatible =
      declaredCompatible.includes(actualMimeType) ||
      actualCompatible.includes(declaredMimeType);

    if (!isCompatible) {
      return {
        valid: false,
        actualMimeType,
        error: `Dosya tipi uyuşmazlığı: Bildirilen ${declaredMimeType}, Gerçek ${actualMimeType}`,
      };
    }

    return { valid: true, actualMimeType };
  } catch (error) {
    console.error("❌ Dosya içerik doğrulama hatası:", error);
    return {
      valid: false,
      error: "Dosya içeriği doğrulanamadı",
    };
  }
}

/**
 * Tehlikeli dosya tiplerini kontrol et
 *
 * @param filename - Dosya adı
 * @param mimeType - MIME type
 * @returns Dosya tehlikeli mi?
 */
function isDangerousFile(filename: string, mimeType: string): boolean {
  // Tehlikeli uzantılar (executable, script)
  const dangerousExtensions = [
    ".exe",
    ".bat",
    ".cmd",
    ".com",
    ".pif",
    ".scr",
    ".vbs",
    ".vbe",
    ".js",
    ".jse",
    ".wsf",
    ".wsh",
    ".msi",
    ".msp",
    ".scf",
    ".lnk",
    ".inf",
    ".reg",
    ".ps1",
    ".ps1xml",
    ".ps2",
    ".ps2xml",
    ".psc1",
    ".psc2",
    ".msh",
    ".msh1",
    ".msh2",
    ".mshxml",
    ".msh1xml",
    ".msh2xml",
    ".app",
    ".deb",
    ".rpm",
    ".dmg",
    ".pkg",
  ];

  const ext = path.extname(filename).toLowerCase();
  if (dangerousExtensions.includes(ext)) {
    return true;
  }

  // Tehlikeli MIME types
  const dangerousMimeTypes = [
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
    "application/x-sharedlib",
    "application/x-sh",
    "application/x-shellscript",
    "text/x-sh",
    "text/x-shellscript",
  ];

  if (dangerousMimeTypes.includes(mimeType)) {
    return true;
  }

  return false;
}

/**
 * Zip bomb kontrolü (sıkıştırılmış dosyalar için)
 *
 * @param compressedSize - Sıkıştırılmış dosya boyutu
 * @param maxUncompressedSize - Maksimum sıkıştırılmamış boyut
 * @returns Zip bomb olabilir mi?
 */
function checkZipBomb(
  compressedSize: number,
  maxUncompressedSize: number = 100 * 1024 * 1024 // 100MB
): boolean {
  // Çok küçük sıkıştırılmış dosyalar şüpheli
  // Örnek: 1KB compressed -> 1GB uncompressed = zip bomb
  const suspiciousRatio = 1000; // 1:1000 oranı şüpheli

  if (compressedSize < 10 * 1024) {
    // 10KB'den küçükse
    // Bu küçük dosyanın çok büyük olması şüpheli
    return true;
  }

  return false;
}

/**
 * Rate limiting kontrolü
 *
 * @param identifier - IP veya user ID
 * @throws Rate limit aşıldıysa hata fırlatır
 */
async function checkUploadRateLimit(identifier: string): Promise<void> {
  try {
    await uploadRateLimiter.consume(identifier);
  } catch (error) {
    throw new Error(
      "Çok fazla dosya yükleme denemesi. Lütfen 1 dakika sonra tekrar deneyin."
    );
  }
}

/**
 * Upload file to server with security features (GraphQL Yoga v5 WHATWG File API)
 *
 * @param file - WHATWG File object from GraphQL Yoga
 * @param category - Upload category (sketches, samples, documents, etc.)
 * @param signal - AbortSignal for cancellation support
 * @param identifier - User ID veya IP (rate limiting için, varsayılan: 'anonymous')
 * @param options - Ek validasyon seçenekleri
 * @returns Uploaded file metadata
 * @throws Validation hatası, rate limit aşımı veya güvenlik ihlali durumunda hata fırlatır
 */
export async function uploadFile(
  file: File,
  category: keyof typeof CATEGORIES = "temp",
  signal?: AbortSignal,
  identifier: string = "anonymous",
  options?: {
    allowedExtensions?: string[];
    maxSize?: number;
    validateContent?: boolean;
  }
): Promise<UploadedFile> {
  // Debug: Log file object structure
  console.log("🔍 [uploadFile] Received file object:", {
    hasFile: !!file,
    fileName: file?.name,
    fileType: file?.type,
    fileSize: file?.size,
    category,
    identifier,
  });

  // 1. Dosya object kontrolü
  if (!file) {
    throw new Error("Geçersiz dosya: dosya undefined veya null");
  }

  if (!file.name) {
    console.error("❌ [uploadFile] File object structure:", {
      file: JSON.stringify(file, null, 2),
      type: typeof file,
      constructor: file?.constructor?.name,
    });
    throw new Error(
      `Geçersiz dosya: file.name undefined. Alınan: ${typeof file}`
    );
  }

  // 2. Rate limiting kontrolü
  try {
    await checkUploadRateLimit(identifier);
  } catch (error) {
    console.error("❌ Rate limit aşıldı:", identifier);
    throw error;
  }

  // 3. Cancellation kontrolü
  if (signal?.aborted) {
    throw new Error("Yükleme iptal edildi");
  }

  // 4. Dosya adını sanitize et (Path Traversal koruması)
  let sanitizedFilename: string;
  try {
    sanitizedFilename = sanitizeFileName(file.name);
  } catch (error) {
    throw new Error(
      `Dosya adı güvenli değil: ${
        error instanceof Error ? error.message : "Bilinmeyen hata"
      }`
    );
  }

  // 5. Dosya boyutu kontrolü
  const maxSize = options?.maxSize || SIZE_LIMITS.default;
  if (!validateFileSize(file.size, maxSize)) {
    throw new Error(
      `Dosya çok büyük: ${(file.size / 1024 / 1024).toFixed(2)}MB (Max: ${(
        maxSize /
        1024 /
        1024
      ).toFixed(0)}MB)`
    );
  }

  // 6. Tehlikeli dosya kontrolü
  if (isDangerousFile(sanitizedFilename, file.type)) {
    console.error("❌ Tehlikeli dosya tipi:", {
      filename: sanitizedFilename,
      mimeType: file.type,
    });
    throw new Error("Bu dosya tipi güvenlik nedeniyle yüklenemez");
  }

  // 7. Dosya uzantısı kontrolü (eğer whitelist belirtilmişse)
  if (options?.allowedExtensions && options.allowedExtensions.length > 0) {
    if (!validateFileExtension(sanitizedFilename, options.allowedExtensions)) {
      throw new Error(
        `Geçersiz dosya uzantısı. İzin verilen: ${options.allowedExtensions.join(
          ", "
        )}`
      );
    }
  }

  // 8. Dosya içeriğini oku
  if (signal?.aborted) {
    throw new Error("Yükleme iptal edildi");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 9. Magic number validation (gerçek dosya tipi kontrolü)
  if (options?.validateContent !== false) {
    const contentValidation = await validateFileContent(buffer, file.type);

    if (!contentValidation.valid) {
      console.error(
        "❌ Dosya içerik doğrulama hatası:",
        contentValidation.error
      );
      throw new Error(
        contentValidation.error || "Dosya içeriği bildirilen tipte değil"
      );
    }

    // Gerçek MIME type'ı kullan (eğer tespit edildiyse)
    if (contentValidation.actualMimeType) {
      console.log(
        "✅ Dosya tipi doğrulandı:",
        contentValidation.actualMimeType
      );
    }
  }

  // 10. Zip bomb kontrolü (sıkıştırılmış dosyalar için)
  const compressedMimeTypes = [
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
  ];

  if (compressedMimeTypes.includes(file.type)) {
    if (checkZipBomb(buffer.length)) {
      console.error("❌ Şüpheli sıkıştırılmış dosya (olası zip bomb)");
      throw new Error("Şüpheli sıkıştırılmış dosya tespit edildi");
    }
  }

  // 11. Benzersiz dosya adı oluştur (crypto ile güvenli)
  const timestamp = Date.now();
  const randomHex = randomBytes(8).toString("hex");
  const ext = path.extname(sanitizedFilename);
  const nameWithoutExt = path.basename(sanitizedFilename, ext);
  const uniqueFilename = `${nameWithoutExt}-${timestamp}-${randomHex}${ext}`;

  // Create file path
  const categoryPath = CATEGORIES[category];
  const uploadPath = path.join(UPLOAD_DIR, categoryPath);
  const filePath = path.join(uploadPath, uniqueFilename);
  const relativePath = path.join("uploads", categoryPath, uniqueFilename);

  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // 12. Dosyayı diske yaz
  await fs.promises.writeFile(filePath, buffer);

  // 13. Dosya boyutunu al
  const size = buffer.length;

  // 14. URL oluştur
  const url = `/${relativePath.replace(/\\/g, "/")}`;

  console.log("✅ Dosya başarıyla yüklendi:", {
    filename: uniqueFilename,
    size: `${(size / 1024).toFixed(2)}KB`,
    category,
  });

  return {
    id: `${timestamp}-${randomHex}`,
    filename: uniqueFilename,
    originalFilename: file.name,
    path: filePath,
    relativePath: relativePath.replace(/\\/g, "/"),
    size,
    mimetype: file.type,
    encoding: "binary",
    url,
  };
}

/**
 * Delete file from server
 * @param filePath - Relative or absolute file path
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Validate file type
 * @param mimetype - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 */
export function validateFileType(
  mimetype: string,
  allowedTypes: string[]
): boolean {
  return allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      const baseType = type.split("/")[0];
      return mimetype.startsWith(baseType + "/");
    }
    return mimetype === type;
  });
}

/**
 * Validate file size
 * @param size - File size in bytes
 * @param maxSize - Maximum allowed size in bytes
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size <= maxSize;
}

// Common MIME type groups
export const MIME_TYPES = {
  images: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  spreadsheets: [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  archives: [
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ],
  xml: ["application/xml", "text/xml"],
  all: ["*/*"],
};

// File size limits (in bytes)
export const SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 20 * 1024 * 1024, // 20MB
  default: 50 * 1024 * 1024, // 50MB
};

// Güvenli dosya uzantıları (whitelist)
export const SAFE_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  spreadsheets: ['.xls', '.xlsx', '.csv'],
  archives: ['.zip', '.rar', '.7z'],
  xml: ['.xml'],
};

/**
 * Güvenli dosya yükleme (kategori ayarlarını otomatik uygular)
 * 
 * @param file - WHATWG File object
 * @param category - Upload kategorisi
 * @param signal - AbortSignal
 * @param identifier - User ID veya IP
 * @returns Uploaded file metadata
 */
export async function uploadFileSecure(
  file: File,
  category: keyof typeof CATEGORIES = 'temp',
  signal?: AbortSignal,
  identifier: string = 'anonymous'
): Promise<UploadedFile> {
  // Kategori bazında güvenlik ayarları
  const categorySettings: Record<string, any> = {
    sketches: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    samples: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    collections: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    documents: { allowedExtensions: [...SAFE_EXTENSIONS.documents, ...SAFE_EXTENSIONS.spreadsheets], maxSize: SIZE_LIMITS.document, validateContent: true },
    production: { maxSize: SIZE_LIMITS.default, validateContent: true },
    temp: { maxSize: SIZE_LIMITS.default, validateContent: false },
    fabrics: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    colors: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    materials: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    accessories: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    certifications: { allowedExtensions: [...SAFE_EXTENSIONS.documents, ...SAFE_EXTENSIONS.images], maxSize: SIZE_LIMITS.document, validateContent: true },
    sizeGroups: { allowedExtensions: SAFE_EXTENSIONS.documents, maxSize: SIZE_LIMITS.document, validateContent: true },
    fits: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
    seasons: { allowedExtensions: SAFE_EXTENSIONS.images, maxSize: SIZE_LIMITS.image, validateContent: true },
  };
  
  const settings = categorySettings[category] || { maxSize: SIZE_LIMITS.default, validateContent: false };
  
  return uploadFile(file, category, signal, identifier, settings);
}
