"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettingsModal";
import { ModeToggle } from "../mode-toggle";
import { EditorFont, useEditorFont } from "@/hooks/useEditorFont";
import { useFocusMode } from "@/hooks/useFocusMode";
import { fontFamilies } from "@/lib/editorFont";
import { useCustomLandingPage } from "@/hooks/useCustomLandingPage";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const FONTS: { label: string; value: EditorFont }[] = [
  { label: "Default", value: "default" },
  { label: "Sans", value: "Lora" },
  { label: "Mono", value: "JetBrains Mono" },
];

export const SettingsModal = () => {
  const settings = useSettings();
  const router = useRouter();
  const { editorFont, setEditorFont } = useEditorFont({
    enabled: settings.isOpen,
  });
  const { focusMode, setFocusMode } = useFocusMode({
    enabled: settings.isOpen,
  });
  const { customLandingPageId, enableCustomLandingPage, disableCustomLandingPage } = useCustomLandingPage();

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogTitle hidden>Settings</DialogTitle>
      <DialogDescription className="sr-only">
        Customize your editor settings, appearance, and focus mode preferences.
      </DialogDescription>
      <DialogContent className="dark:bg-dark">
        <DialogHeader className="border-b pb-2">
          <h2 className="text-lg font-medium">My settings</h2>
        </DialogHeader>
        <div className="divide-primary/10 divide-y">
          <div className="flex items-center justify-between py-2">
            <div className="flex flex-col gap-y-1">
              <Label>Appearance</Label>
              <span className="text-muted-foreground text-[0.8rem]">
                Customize how Zotion looks on your device.
              </span>
            </div>
            <ModeToggle />
          </div>
          <div className="flex flex-col gap-y-3 py-2">
            <div className="flex flex-col gap-y-1">
              <Label>Editor font</Label>
              <span className="text-muted-foreground text-[0.8rem]">
                Choose the font used in the editor.
              </span>
            </div>
            <div className="flex gap-2">
              {FONTS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEditorFont(option.value)}
                  className={cn(
                    "hover:bg-primary/5 flex flex-1 flex-col items-center gap-1 rounded-md border px-3 py-2 text-sm transition",
                    editorFont === option.value && "ring-primary ring",
                  )}
                >
                  <span
                    className="text-xl font-medium"
                    style={{
                      fontFamily: fontFamilies[option.value],
                    }}
                  >
                    Ag
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex flex-col gap-y-1">
              <Label>Focus mode</Label>
              <span className="text-muted-foreground text-[0.8rem]">
                Collapse the sidebar and topbar to minimize distractions and
                focus on your content.
              </span>
              <span className="text-muted-foreground text-xs">
                Shortcut:
                <kbd className="bg-muted text-muted-foreground pointer-events-none ml-2 hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[.625rem] font-medium opacity-100 select-none md:inline-flex dark:bg-neutral-700">
                  Ctrl + Shift + F
                </kbd>
              </span>
            </div>
            <Switch checked={focusMode} onCheckedChange={setFocusMode} />
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <div className="flex flex-col gap-y-1">
              <Label>Custom landing page</Label>
              <span className="text-muted-foreground text-[0.8rem]">
                Create and set a custom workspace page as your main dashboard.
              </span>
            </div>
            <Switch 
              checked={!!customLandingPageId} 
              onCheckedChange={async (checked) => {
                if (checked) {
                  const promise = enableCustomLandingPage().then((id) => {
                    router.push(`/documents/${id}`);
                    settings.onClose();
                  });
                  toast.promise(promise, {
                    loading: "Enabling custom workspace landing page...",
                    success: "Custom landing page enabled!",
                    error: "Failed to enable custom landing page."
                  });
                } else {
                  const promise = disableCustomLandingPage();
                  toast.promise(promise, {
                    loading: "Disabling custom workspace landing page...",
                    success: "Custom landing page disabled.",
                    error: "Failed to disable custom landing page."
                  });
                }
              }} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
