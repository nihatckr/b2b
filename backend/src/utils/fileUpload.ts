import fs from 'fs';
import path from 'path';

// Upload dizinleri
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const CATEGORIES = {
  sketches: 'sketches',
  samples: 'ai-generated-samples',
  collections: 'collections',
  documents: 'documents',
  production: 'production',
  temp: 'temp',
};

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
 * Upload file to server with cancellation support (GraphQL Yoga v5 WHATWG File API)
 * @param file - WHATWG File object from GraphQL Yoga
 * @param category - Upload category (sketches, samples, documents, etc.)
 * @param signal - AbortSignal for cancellation support
 * @returns Uploaded file metadata
 */
export async function uploadFile(
  file: File,
  category: keyof typeof CATEGORIES = 'temp',
  signal?: AbortSignal
): Promise<UploadedFile> {
  // Check if already aborted
  if (signal?.aborted) {
    throw new Error('Upload cancelled');
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const ext = path.extname(file.name);
  const nameWithoutExt = path.basename(file.name, ext);
  const uniqueFilename = `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;

  // Create file path
  const categoryPath = CATEGORIES[category];
  const uploadPath = path.join(UPLOAD_DIR, categoryPath);
  const filePath = path.join(uploadPath, uniqueFilename);
  const relativePath = path.join('uploads', categoryPath, uniqueFilename);

  // Ensure directory exists
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  // Check cancellation before reading file
  if (signal?.aborted) {
    throw new Error('Upload cancelled');
  }

  // Use WHATWG File API to get file content
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Write file to disk
  await fs.promises.writeFile(filePath, buffer);

  // Get file size
  const size = buffer.length;

  // Generate URL (adjust based on your server config)
  const url = `/${relativePath.replace(/\\/g, '/')}`;

  return {
    id: `${timestamp}-${randomString}`,
    filename: uniqueFilename,
    originalFilename: file.name,
    path: filePath,
    relativePath: relativePath.replace(/\\/g, '/'),
    size,
    mimetype: file.type,
    encoding: 'binary', // WHATWG File API uses binary encoding
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
    console.error('Error deleting file:', error);
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
    if (type.endsWith('/*')) {
      const baseType = type.split('/')[0];
      return mimetype.startsWith(baseType + '/');
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
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  archives: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'],
  xml: ['application/xml', 'text/xml'],
  all: ['*/*'],
};

// File size limits (in bytes)
export const SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  document: 20 * 1024 * 1024, // 20MB
  default: 50 * 1024 * 1024, // 50MB
};
