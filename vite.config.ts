import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
        "next/link": path.resolve(__dirname, "./components/shims/link.tsx"),
        "next/navigation": path.resolve(__dirname, "./components/shims/navigation.tsx"),
        "next/image": path.resolve(__dirname, "./components/shims/image.tsx"),
        "next/dynamic": path.resolve(__dirname, "./components/shims/dynamic.tsx"),
        "next/font/google": path.resolve(__dirname, "./components/shims/font-google.tsx"),
      },
    },
    define: {
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL),
      "process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY": JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      "process.env": {},
    },
    server: {
      port: 3000,
    },
  };
});
