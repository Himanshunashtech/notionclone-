import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";
import { useUser } from "@/components/providers/supabase-provider";

export const useCustomLandingPage = () => {
  const { user } = useUser();
  const settings = useQuery(api.userSettings.getUserSettings);
  const updateSettings = useMutation(api.userSettings.updateUserSettings);
  const createDocument = useMutation(api.documents.create);

  const customLandingPageId = settings?.customLandingPageId || null;

  const enableCustomLandingPage = async () => {
    const ownerName = user?.firstName || "your";
    const title = ownerName === "your" ? "Welcome to your workspace" : `Welcome to ${ownerName}'s workspace`;

    // Create the page first
    const newPageId = await createDocument({
      title,
      // Initialize with empty content to act as a general page
      content: ""
    });

    // Save to settings
    await updateSettings({
      customLandingPageId: newPageId
    });

    return newPageId;
  };

  const disableCustomLandingPage = async () => {
    await updateSettings({
      customLandingPageId: null
    });
  };

  return {
    customLandingPageId,
    enableCustomLandingPage,
    disableCustomLandingPage,
    isLoading: settings === undefined
  };
};
