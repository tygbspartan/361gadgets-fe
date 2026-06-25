"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  useGetAllHeroImagesQuery,
  useUploadHeroImageMutation,
  useUpdateHeroImageMutation,
  useReorderHeroImagesMutation,
  useDeleteHeroImageMutation,
  HeroImage,
} from "@/lib/redux/features/hero/heroApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  ImageIcon,
  Loader2,
  X,
  Link as LinkIcon,
} from "lucide-react";

// ── Modal ───────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: "add" | "edit";
  image: HeroImage | null;
  onClose: () => void;
  onSuccess: () => void;
}

function HeroModal({ mode, image, onClose, onSuccess }: ModalProps) {
  const [uploadHero, { isLoading: isUploading }] = useUploadHeroImageMutation();
  const [updateHero, { isLoading: isUpdating }] = useUpdateHeroImageMutation();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(image?.imageUrl ?? null);
  const [altText, setAltText] = useState(image?.altText ?? "");
  const [linkUrl, setLinkUrl] = useState(image?.linkUrl ?? "");
  const [displayOrder, setDisplayOrder] = useState(
    image?.displayOrder !== undefined ? String(image.displayOrder) : ""
  );
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isLoading = isUploading || isUpdating;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "add" && !file) {
      setError("Please select an image file");
      return;
    }

    try {
      if (mode === "add") {
        const formData = new FormData();
        formData.append("image", file!);
        if (altText) formData.append("altText", altText);
        if (linkUrl) formData.append("linkUrl", linkUrl);
        if (displayOrder !== "") formData.append("displayOrder", displayOrder);
        await uploadHero(formData).unwrap();
      } else {
        await updateHero({
          id: image!.id,
          body: {
            altText: altText || undefined,
            linkUrl: linkUrl || null,
            displayOrder: displayOrder !== "" ? Number(displayOrder) : undefined,
          },
        }).unwrap();
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-5">
          {mode === "add" ? "Add Hero Image" : "Edit Hero Image"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File picker — add mode only */}
          {mode === "add" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg h-36 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors overflow-hidden"
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-sm">Click to select image</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Alt text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Summer Sale — Up to 40% off"
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL
            </label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="e.g. /products?sale=true"
            />
            <p className="text-xs text-gray-400 mt-1">Leave blank for a non-clickable banner</p>
          </div>

          {/* Display order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <Input
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="0 = first"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
              ) : mode === "add" ? "Upload" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminHeroPage() {
  const { data, isLoading } = useGetAllHeroImagesQuery();
  const [updateHero] = useUpdateHeroImageMutation();
  const [reorderHero] = useReorderHeroImagesMutation();
  const [deleteHero, { isLoading: isDeleting }] = useDeleteHeroImageMutation();

  const [modal, setModal] = useState<{ mode: "add" | "edit"; image: HeroImage | null } | null>(null);

  const images = data?.data ?? [];

  const handleToggleActive = async (image: HeroImage) => {
    try {
      await updateHero({ id: image.id, body: { isActive: !image.isActive } }).unwrap();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const updated = sorted.map((img, i) => {
      if (i === index) return { id: img.id, displayOrder: sorted[targetIndex].displayOrder };
      if (i === targetIndex) return { id: img.id, displayOrder: sorted[index].displayOrder };
      return { id: img.id, displayOrder: img.displayOrder };
    });

    try {
      await reorderHero({ order: updated }).unwrap();
    } catch {
      alert("Failed to reorder");
    }
  };

  const handleDelete = async (image: HeroImage) => {
    if (!confirm(`Delete this banner image? This cannot be undone.`)) return;
    try {
      await deleteHero(image.id).unwrap();
    } catch {
      alert("Failed to delete image");
    }
  };

  const sorted = [...images].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage homepage slider images
          </p>
        </div>
        <Button onClick={() => setModal({ mode: "add", image: null })} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Image
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold">No hero images yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Upload your first banner to display on the homepage
          </p>
          <Button onClick={() => setModal({ mode: "add", image: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Image
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((image, index) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-40 h-20 rounded-md overflow-hidden bg-gray-100 shrink-0">
                    <Image
                      src={image.imageUrl}
                      alt={image.altText ?? "Hero banner"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {image.altText || <span className="text-gray-400 italic">No alt text</span>}
                      </span>
                      <Badge
                        className={
                          image.isActive
                            ? "bg-green-500 hover:bg-green-600 cursor-pointer text-xs"
                            : "bg-gray-400 hover:bg-gray-500 cursor-pointer text-xs"
                        }
                        onClick={() => handleToggleActive(image)}
                      >
                        {image.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    {image.linkUrl ? (
                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <LinkIcon className="w-3 h-3 shrink-0" />
                        {image.linkUrl}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No link</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Order: {image.displayOrder}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Reorder */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === sorted.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(image)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        image.isActive ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                          image.isActive ? "left-5" : "left-1"
                        }`}
                      />
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setModal({ mode: "edit", image })}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(image)}
                      disabled={isDeleting}
                      className="border-red-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <HeroModal
          mode={modal.mode}
          image={modal.image}
          onClose={() => setModal(null)}
          onSuccess={() => setModal(null)}
        />
      )}
    </div>
  );
}
