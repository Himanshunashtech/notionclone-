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
import { useEffect, useState, useRef } from "react";
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
import { Loader2 } from "lucide-react";

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

  // Bigger Gallery States
  const [isBiggerOpen, setIsBiggerOpen] = useState(false);
  const [biggerImages, setBiggerImages] = useState<Array<{ id: string; url: string }>>([]);
  const [page, setPage] = useState(1);
  const [loadingBigger, setLoadingBigger] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const update = useMutation(api.documents.update);
  const coverImage = useCoverImage();
  const { uploadFile, deleteFile } = useSupabaseStorage();

  const [isDragging, setIsDragging] = useState(false);

  const fetchMoreImages = async (pageNum: number) => {
    if (loadingBigger) return;
    try {
      setLoadingBigger(true);
      const res = await fetch(`https://picsum.photos/v2/list?page=${pageNum}&limit=18`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      const newImages = data.map((item: any) => ({
        id: item.id,
        url: `https://picsum.photos/id/${item.id}/800/450`
      }));
      setBiggerImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoadingBigger(false);
    }
  };

  useEffect(() => {
    if (isBiggerOpen && biggerImages.length === 0) {
      fetchMoreImages(1);
    }
  }, [isBiggerOpen]);

  const handleBiggerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 40) {
      if (!loadingBigger && hasMore) {
        setPage((prev) => {
          const next = prev + 1;
          fetchMoreImages(next);
          return next;
        });
      }
    }
  };

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
    setIsBiggerOpen(false);
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
    <>
      <Dialog open={coverImage.isOpen} onOpenChange={onClose}>
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
            <TabsContent value="gallery" className="space-y-4">
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
              <div className="flex justify-center border-t pt-3">
                <Button
                  variant="outline"
                  onClick={() => setIsBiggerOpen(true)}
                  className="w-full text-xs font-medium hover:bg-muted"
                >
                  Show more images
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Bigger Gallery Dialog */}
      <Dialog open={isBiggerOpen} onOpenChange={(open) => setIsBiggerOpen(open)}>
        <DialogTitle>
          <span className="sr-only">Explore Unlimited Cover Images</span>
        </DialogTitle>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 dark:bg-dark">
          <DialogHeader>
            <h2 className="text-xl font-bold">Explore Cover Images</h2>
            <p className="text-muted-foreground text-sm">
              Scroll down to discover and load unlimited beautiful covers for your document.
            </p>
          </DialogHeader>
          <div
            onScroll={handleBiggerScroll}
            className="flex-1 overflow-y-auto pr-2 mt-4 grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {biggerImages.map((img) => (
              <div key={img.id + img.url} className="relative group pb-4 pr-4">
                {/* File stack deck layers behind */}
                <div className="absolute inset-0 bg-neutral-200/50 dark:bg-neutral-800/40 rounded-lg translate-y-2 translate-x-2 scale-[0.98] transition-all duration-300 group-hover:translate-y-3.5 group-hover:translate-x-3.5 group-hover:scale-[0.96] border border-neutral-300/30 dark:border-neutral-700/20" />
                <div className="absolute inset-0 bg-neutral-300/50 dark:bg-neutral-800/60 rounded-lg translate-y-1 translate-x-1 scale-[0.99] transition-all duration-300 group-hover:translate-y-2 group-hover:translate-x-2 group-hover:scale-[0.98] border border-neutral-300/50 dark:border-neutral-700/40" />

                {/* Main Image Card */}
                <button
                  onClick={() => onSelectColor(img.url)}
                  className={cn(
                    "relative aspect-video border border-border w-full rounded-lg overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:scale-[1.01] shadow-md group-hover:shadow-xl bg-muted z-10",
                    coverImage.url === img.url && "ring-primary ring-2 ring-offset-2"
                  )}
                >
                  <img
                    src={img.url}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    alt="Gallery Option"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            ))}
            {loadingBigger && (
              <div className="col-span-full flex justify-center items-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!hasMore && (
              <div className="col-span-full text-center text-muted-foreground text-sm py-4">
                You've reached the end of the collection.
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t mt-4 gap-2">
            <Button variant="outline" onClick={() => setIsBiggerOpen(false)}>
              Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
