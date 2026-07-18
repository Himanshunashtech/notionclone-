"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCoverImage } from "@/hooks/useCoverImage";
import { SingleImageDropzone } from "@/components/single-image-dropzone";
import { useEffect, useState } from "react";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { useParams } from "next/navigation";
import { Id } from "@/lib/supabase-db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const COVER_COLORS = [
  "#f87171",
  "#fb923c",
  "#fbbf24",
  "#a3e635",
  "#34d399",
  "#22d3ee",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#94a3b8",
  "#1e293b",
  "#ffffff",
  "linear-gradient(135deg, #f87171, #fb923c)",
  "linear-gradient(135deg, #fbbf24, #a3e635)",
  "linear-gradient(135deg, #34d399, #22d3ee)",
  "linear-gradient(135deg, #60a5fa, #a78bfa)",
  "linear-gradient(135deg, #f472b6, #fb923c)",
  "linear-gradient(135deg, #a78bfa, #60a5fa)",
  "linear-gradient(135deg, #1e293b, #475569)",
  "linear-gradient(135deg, #f87171, #a78bfa)",
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600",
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=600",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=600",
  "https://images.unsplash.com/photo-1434725039720-abb26e22ebe8?q=80&w=600",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=600",
  "https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=600",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=600",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=600",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=600",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600",
  "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?q=80&w=600",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600",
  "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=600",
  "https://images.unsplash.com/photo-1505761671935-60b3a7427bab?q=80&w=600",
];

export const CoverImageModal = () => {
  const params = useParams();

  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputUrl, setInputUrl] = useState("");
  const [visibleCount, setVisibleCount] = useState(9);

  const update = useMutation(api.documents.update);
  const coverImage = useCoverImage();
  const { uploadFile, deleteFile } = useSupabaseStorage();

  const [isDragging, setIsDragging] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 15) {
      if (visibleCount < COVER_IMAGES.length) {
        setVisibleCount((prev) => Math.min(prev + 6, COVER_IMAGES.length));
      }
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !coverImage.documentId) return;

    try {
      setIsSubmitting(true);

      if (coverImage.url?.startsWith("http")) {
        await deleteFile(coverImage.url);
      }

      await update({
        id: coverImage.documentId as Id<"documents">,
        coverImage: inputUrl.trim(),
      });

      setInputUrl("");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to update cover image URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onClose = () => {
    setFile(undefined);
    setIsSubmitting(false);
    setInputUrl("");
    setVisibleCount(9);
    coverImage.onClose();
  };

  useEffect(() => {
    if (!coverImage.isOpen) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.clientX === 0 && e.clientY === 0) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (files?.[0]) {
        if (!files[0].type.startsWith("image/")) {
          toast.error("Only image files are allowed.");
          return;
        }
        await onChange(files[0]);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [coverImage.isOpen]);


  const onChange = async (file?: File) => {
    if (file && coverImage.documentId) {
      setIsSubmitting(true);
      setFile(file);

      const res = await uploadFile(file, {
        replaceTargetUrl: coverImage.url?.startsWith("http")
          ? coverImage.url
          : undefined,
      });

      await update({
        id: coverImage.documentId as Id<"documents">,
        coverImage: res.url,
      });

      onClose();
    }
  };

  const onSelectColor = async (color: string) => {
    if (!coverImage.documentId) return;
    if (coverImage.url?.startsWith("http")) {
      await deleteFile(coverImage.url);
    }
    await update({
      id: coverImage.documentId as Id<"documents">,
      coverImage: color,
    });
    onClose();
  };

  return (
    <Dialog open={coverImage.isOpen} onOpenChange={coverImage.onClose}>
      <DialogTitle>
        <span className="sr-only">Change Cover Image</span>
      </DialogTitle>
      <DialogContent className="dark:bg-dark">
        <DialogHeader>
          <h2 className="text-center text-lg font-semibold">Cover Image</h2>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Upload a cover image or choose a color for your document.
        </DialogDescription>
        <Tabs defaultValue="upload">
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">
              Upload
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex-1">
              Colors
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1">
              Gallery
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <SingleImageDropzone
              className="w-full outline-hidden"
              disabled={isSubmitting}
              value={file}
              onChange={onChange}
              isDragging={isDragging}
            />
          </TabsContent>
          <TabsContent value="colors">
            <div className="grid grid-cols-4 gap-2 p-2">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSelectColor(color)}
                  className={cn(
                    "border-border h-14 w-full rounded-md border transition-transform hover:scale-105 hover:shadow-md",
                    coverImage.url === color &&
                      "ring-primary ring-2 ring-offset-2",
                  )}
                  style={{ background: color }}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="gallery">
            <div
              onScroll={handleScroll}
              className="grid grid-cols-3 gap-2 p-2 max-h-[300px] overflow-y-auto"
            >
              {COVER_IMAGES.slice(0, visibleCount).map((imgUrl) => (
                <button
                  key={imgUrl}
                  onClick={() => onSelectColor(imgUrl)}
                  className={cn(
                    "relative border border-border h-16 w-full rounded-md overflow-hidden transition-transform hover:scale-105 hover:shadow-md bg-muted",
                    coverImage.url === imgUrl &&
                      "ring-primary ring-2 ring-offset-2",
                  )}
                >
                  <img src={imgUrl} className="object-cover w-full h-full" alt="Cover option" />
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
