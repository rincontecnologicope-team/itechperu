"use client";

import { GripVertical, ImagePlus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { DragEvent } from "react";

import {
  moveProductImage,
  normalizeProductImages,
  removeProductImage,
  setPrimaryProductImage,
} from "@/lib/product-images";
import type { ProductImage } from "@/types/product";

interface ProductImagesManagerProps {
  images: ProductImage[];
  enabled: boolean;
  onChange: (images: ProductImage[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

function buildImageItems(images: ProductImage[]): ProductImage[] {
  return normalizeProductImages(images);
}

function extractImageFiles(fileList: FileList | null): File[] {
  if (!fileList || fileList.length === 0) {
    return [];
  }
  return Array.from(fileList).filter((file) => file.type.startsWith("image/"));
}

export function ProductImagesManager({
  images,
  enabled,
  onChange,
  onUploadingChange,
}: ProductImagesManagerProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isFileDragOver, setIsFileDragOver] = useState(false);
  const [pendingOrderSave, setPendingOrderSave] = useState(false);

  const items = useMemo(() => buildImageItems(images), [images]);

  async function uploadFiles(files: File[]) {
    if (!enabled || files.length === 0) {
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setIsFileDragOver(false);
    setError("");
    setStatus(`Subiendo ${files.length} imagen(es)...`);

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const payload = (await response.json()) as { imageUrl?: string; error?: string };
        if (!response.ok || !payload.imageUrl) {
          throw new Error(payload.error ?? `No se pudo subir ${file.name}.`);
        }
        uploadedUrls.push(payload.imageUrl);
      }

      const appended = [
        ...items,
        ...uploadedUrls.map((url, index) => ({
          url,
          order: items.length + index,
          isPrimary: false,
        })),
      ];
      onChange(normalizeProductImages(appended));
      setStatus(`${uploadedUrls.length} imagen(es) cargadas.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error al subir imagenes.");
      setStatus("");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, targetIndex: number) {
    event.preventDefault();
    const droppedFiles = extractImageFiles(event.dataTransfer.files);
    if (droppedFiles.length > 0) {
      void uploadFiles(droppedFiles);
      return;
    }

    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const next = moveProductImage(items, dragIndex, targetIndex);
    onChange(next);
    setPendingOrderSave(true);
    setStatus("Orden actualizado. Presiona 'Guardar orden' para confirmar.");
    setDragIndex(null);
  }

  return (
    <div
      className={`mt-3 rounded-2xl border p-3 sm:p-4 ${
        isFileDragOver ? "border-emerald-400 bg-emerald-50/40" : "border-slate-200 bg-slate-50"
      }`}
      onDragOver={(event) => {
        const droppedFiles = extractImageFiles(event.dataTransfer.files);
        if (droppedFiles.length > 0) {
          event.preventDefault();
          setIsFileDragOver(true);
        }
      }}
      onDragEnter={(event) => {
        const droppedFiles = extractImageFiles(event.dataTransfer.files);
        if (droppedFiles.length > 0) {
          event.preventDefault();
          setIsFileDragOver(true);
        }
      }}
      onDragLeave={(event) => {
        const related = event.relatedTarget as Node | null;
        if (!related || !event.currentTarget.contains(related)) {
          setIsFileDragOver(false);
        }
      }}
      onDrop={(event) => {
        const droppedFiles = extractImageFiles(event.dataTransfer.files);
        if (droppedFiles.length > 0) {
          event.preventDefault();
          void uploadFiles(droppedFiles);
          setIsFileDragOver(false);
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Galeria de imagenes
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Sube varias imagenes, arrastra para reordenar y define una principal.
          </p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
          <ImagePlus className="size-4" />
          {uploading ? "Subiendo..." : "Subir imagenes"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="hidden"
            disabled={!enabled || uploading}
            onChange={(event) => {
              const files = extractImageFiles(event.target.files);
              if (files.length > 0) {
                void uploadFiles(files);
              }
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {items.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-5 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Todavia no hay imagenes. Sube al menos una para guardar el producto.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Tambien puedes arrastrar imagenes desde tu PC y soltarlas aqui.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, index) => (
            <article
              key={`${item.url}-${index}`}
              draggable={enabled}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => setDragIndex(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, index)}
              className={`relative overflow-hidden rounded-xl border ${
                item.isPrimary ? "border-emerald-400" : "border-slate-200"
              } bg-white`}
            >
              <div className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-700 backdrop-blur">
                <GripVertical className="size-3" />
                #{index + 1}
              </div>

              <div className="relative aspect-square">
                <Image
                  src={item.url}
                  alt={`Imagen ${index + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 220px"
                  className="object-cover"
                />
              </div>

              <div className="grid gap-1 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange(setPrimaryProductImage(items, index));
                    setStatus("Imagen principal actualizada.");
                  }}
                  disabled={!enabled}
                  className={`inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border px-2 text-[11px] font-semibold transition ${
                    item.isPrimary
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Star className="size-3" />
                  {item.isPrimary ? "Principal" : "Marcar principal"}
                </button>

                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(moveProductImage(items, index, Math.max(0, index - 1)));
                      setPendingOrderSave(true);
                    }}
                    disabled={!enabled || index === 0}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Subir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(moveProductImage(items, index, Math.min(items.length - 1, index + 1)));
                      setPendingOrderSave(true);
                    }}
                    disabled={!enabled || index === items.length - 1}
                    className="inline-flex min-h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Bajar
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onChange(removeProductImage(items, index));
                    setStatus("Imagen eliminada.");
                  }}
                  disabled={!enabled}
                  className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-rose-300 bg-white px-2 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-50"
                >
                  <Trash2 className="size-3" />
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {items.length > 0 ? (
        <p className="mt-2 text-xs text-slate-500">
          Tip: tambien puedes arrastrar nuevas imagenes y soltarlas sobre esta galeria.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            onChange(normalizeProductImages(items));
            setPendingOrderSave(false);
            setStatus("Orden de imagenes guardado en borrador.");
          }}
          disabled={!enabled || items.length === 0}
          className="inline-flex min-h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Guardar orden
        </button>
        {pendingOrderSave ? (
          <span className="text-xs font-medium text-amber-700">Orden pendiente por confirmar.</span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
      {status ? (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {status}
        </p>
      ) : null}
    </div>
  );
}
