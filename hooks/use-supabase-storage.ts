import { supabase } from "@/lib/supabase";

const getPathFromUrl = (url: string) => {
  const parts = url.split("/files/");
  if (parts.length > 1) {
    return parts[1];
  }
  return "";
};

const MEDIA_BLOCK_TYPES = new Set(["image", "video", "audio", "file", "pdf"]);

export const getDocumentUrls = (document: any): string[] => {
  const urls: string[] = [];

  if (document.coverImage && document.coverImage.startsWith("http")) {
    urls.push(document.coverImage);
  }

  if (document.content) {
    try {
      const blocks = JSON.parse(document.content);
      const traverse = (blocks: any[]) => {
        for (const block of blocks) {
          if (MEDIA_BLOCK_TYPES.has(block.type) && block.props?.url) {
            urls.push(block.props.url);
          }
          if (block.children?.length) traverse(block.children);
        }
      };
      traverse(blocks);
    } catch {}
  }

  return urls;
};

export const useSupabaseStorage = () => {
  const uploadFile = async (
    file: File,
    options?: { replaceTargetUrl?: string }
  ) => {
    // 1. Get the current user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    // 2. If replaceTargetUrl is specified, delete the old file first
    if (options?.replaceTargetUrl) {
      try {
        const oldPath = getPathFromUrl(options.replaceTargetUrl);
        if (oldPath) {
          await supabase.storage.from("files").remove([oldPath]);
        }
      } catch (e) {
        console.error("Failed to delete old file:", e);
      }
    }

    // 3. Generate a unique name
    const fileExtension = file.name.split(".").pop();
    const uniqueFileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;

    // 4. Upload to Supabase Storage 'files' bucket
    const { data, error } = await supabase.storage
      .from("files")
      .upload(uniqueFileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // 5. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("files")
      .getPublicUrl(uniqueFileName);

    return {
      url: publicUrl,
    };
  };

  const deleteFile = async (url: string) => {
    const path = getPathFromUrl(url);
    if (!path) return;

    const { error } = await supabase.storage.from("files").remove([path]);
    if (error) throw error;
  };

  return {
    uploadFile,
    deleteFile,
  };
};
