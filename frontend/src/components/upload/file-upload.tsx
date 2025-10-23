/**
 * File Upload Components for URQL + GraphQL Yoga v5
 *
 * Backend'de GraphQL Yoga v5 WHATWG File API kullanılıyor.
 * URQL'in fetchExchange zaten FormData/multipart destekliyor!
 *
 * ÖNEMLİ: Özel upload exchange'e gerek YOK!
 */

"use client";

import {
  MultipleUploadDocument,
  SingleUploadDocument,
} from "@/__generated__/graphql";
import { useState } from "react";
import { useMutation } from "urql";

// ============================================
// Single File Upload Component
// ============================================

interface SingleFileUploadProps {
  category?: "sketches" | "samples" | "documents" | "production" | "temp";
  onSuccess?: (file: any) => void;
}

export function SingleFileUpload({
  category = "temp",
  onSuccess,
}: SingleFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [result, executeMutation] = useMutation(SingleUploadDocument);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const result = await executeMutation({
      file,
      category,
      description: description || null,
    });

    if (result.data?.singleUpload) {
      onSuccess?.(result.data.singleUpload);
      // Reset
      setFile(null);
      setDescription("");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Dosya Seç</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,.pdf,.xml"
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {file && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Açıklama (Opsiyonel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dosya açıklaması..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>
              <strong>Dosya:</strong> {file.name}
            </p>
            <p>
              <strong>Boyut:</strong> {(file.size / 1024).toFixed(2)} KB
            </p>
            <p>
              <strong>Tip:</strong> {file.type}
            </p>
            <p>
              <strong>Kategori:</strong> {category}
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={result.fetching}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md
              hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {result.fetching ? "Yükleniyor..." : "Yükle"}
          </button>
        </>
      )}

      {result.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          Hata: {result.error.message}
        </div>
      )}

      {result.data?.singleUpload && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          ✅ Dosya yüklendi: {result.data.singleUpload.filename}
        </div>
      )}
    </div>
  );
}

// ============================================
// Multiple Files Upload Component
// ============================================

interface MultipleFileUploadProps {
  category?: "sketches" | "samples" | "documents" | "production" | "temp";
  maxFiles?: number;
  onSuccess?: (files: any[]) => void;
}

export function MultipleFileUpload({
  category = "temp",
  maxFiles = 5,
  onSuccess,
}: MultipleFileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [result, executeMutation] = useMutation(MultipleUploadDocument);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > maxFiles) {
      alert(`Maksimum ${maxFiles} dosya seçebilirsiniz`);
      return;
    }
    setFiles(selectedFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const result = await executeMutation({
      files,
      category,
      description: description || null,
    });

    if (result.data?.multipleUpload) {
      onSuccess?.(result.data.multipleUpload.files);
      // Reset
      setFiles([]);
      setDescription("");
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Dosyaları Seç (Maks {maxFiles})
        </label>
        <input
          type="file"
          onChange={handleFilesChange}
          accept="image/*,.pdf,.xml"
          multiple
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {files.length > 0 && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Açıklama (Opsiyonel)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dosya açıklaması..."
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              Seçili Dosyalar ({files.length})
            </p>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md text-sm"
              >
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB - {file.type}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Toplam boyut: {(totalSize / 1024).toFixed(2)} KB
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={result.fetching}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md
              hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {result.fetching ? "Yükleniyor..." : `${files.length} Dosya Yükle`}
          </button>
        </>
      )}

      {result.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          Hata: {result.error.message}
        </div>
      )}

      {result.data?.multipleUpload && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          ✅ {result.data.multipleUpload.uploadedCount} dosya yüklendi
        </div>
      )}
    </div>
  );
}

// ============================================
// Drag & Drop Upload Component
// ============================================

export function DragDropUpload({
  category = "temp",
  onSuccess,
}: SingleFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [result, executeMutation] = useMutation(SingleUploadDocument);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const result = await executeMutation({
      file,
      category,
    });

    if (result.data?.singleUpload) {
      onSuccess?.(result.data.singleUpload);
      setFile(null);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8
          text-center cursor-pointer transition-colors
          ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        {!file ? (
          <div>
            <p className="text-gray-600">
              📁 Dosyayı buraya sürükleyin veya tıklayın
            </p>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*,.pdf,.xml"
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="mt-2 inline-block text-blue-500 hover:text-blue-600 cursor-pointer"
            >
              Dosya Seç
            </label>
          </div>
        ) : (
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}
      </div>

      {file && (
        <button
          onClick={handleUpload}
          disabled={result.fetching}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md
            hover:bg-blue-600 disabled:opacity-50"
        >
          {result.fetching ? "Yükleniyor..." : "Yükle"}
        </button>
      )}

      {result.error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {result.error.message}
        </div>
      )}

      {result.data?.singleUpload && (
        <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
          ✅ Yüklendi: {result.data.singleUpload.filename}
        </div>
      )}
    </div>
  );
}
