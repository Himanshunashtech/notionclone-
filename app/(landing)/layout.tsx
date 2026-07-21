"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./_components/Navbar";
import { Footer } from "./_components/Footer";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return (
    <div className="dark:bg-dark min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-12">{children}</main>
      <Footer />
    </div>
  );
};
export default LandingLayout;
