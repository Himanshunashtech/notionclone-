"use client";

import { useEffect, useState } from "react";

import { SettingsModal } from "@/components/modals/SettingsModal";
import { CoverImageModal } from "@/components/modals/CoverImageModal";
import { AuthModal } from "@/components/modals/AuthModal";
import { AccountModal } from "@/components/modals/AccountModal";
import { FilePreviewModal } from "@/components/modals/FilePreviewModal";
import { TemplatesModal } from "@/components/modals/TemplatesModal";
import { OnboardingModal } from "@/components/modals/OnboardingModal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <SettingsModal />
      <CoverImageModal />
      <AuthModal />
      <AccountModal />
      <FilePreviewModal />
      <TemplatesModal />
      <OnboardingModal />
    </>
  );
};
