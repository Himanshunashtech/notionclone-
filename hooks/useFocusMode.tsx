import { useQuery, useMutation } from "@/hooks/use-supabase-db";
import { api } from "@/lib/supabase-db";

interface UseFocusModeOptions {
  enabled?: boolean;
}

export const useFocusMode = ({ enabled = true }: UseFocusModeOptions = {}) => {
  const settings = useQuery(
    api.userSettings.getUserSettings,
    enabled ? {} : "skip",
  );
  const updateSettings = useMutation(api.userSettings.updateUserSettings);

  const focusMode = settings?.focusMode ?? false;

  const setFocusMode = (value: boolean) => {
    if (!enabled) return;
    updateSettings({ focusMode: value });
  };

  return { focusMode, setFocusMode };
};
